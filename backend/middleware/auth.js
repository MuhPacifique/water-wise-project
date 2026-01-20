const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const { getPool } = require('../config/database');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const pool = getPool();
      const [users] = await pool.execute(
        'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        return next(new AppError('User not found', 401));
      }

      const user = users[0];

      if (!user.is_active) {
        return next(new AppError('User account is deactivated', 401));
      }

      req.user = user;
      next();
    } catch (error) {
      return next(new AppError('Not authorized to access this route', 401));
    }
  } catch (error) {
    return next(new AppError('Server error during authentication', 500));
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(`User role ${req.user.role} is not authorized to access this route`, 403));
    }

    next();
  };
};

// Check if user owns resource or is admin
const ownerOrAdmin = (resourceUserIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

    if (!resourceUserId) {
      return next(new AppError('Resource user ID not found', 400));
    }

    if (req.user.id !== parseInt(resourceUserId)) {
      return next(new AppError('Not authorized to access this resource', 403));
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const pool = getPool();
        const [users] = await pool.execute(
          'SELECT id, name, email, role, is_active FROM users WHERE id = ?',
          [decoded.id]
        );

        if (users.length > 0 && users[0].is_active) {
          req.user = users[0];
        }
      } catch (error) {
        // Silently fail for optional auth
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.id);

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Remove password from user object
  const userResponse = { ...user };
  delete userResponse.password;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        user: userResponse
      }
    });
};

module.exports = {
  protect,
  authorize,
  ownerOrAdmin,
  optionalAuth,
  generateToken,
  sendTokenResponse
};
