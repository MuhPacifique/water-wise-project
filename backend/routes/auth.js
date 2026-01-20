const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { catchAsync } = require('../middleware/errorHandler');
const { sendTokenResponse } = require('../middleware/auth');
const { getPool } = require('../config/database');

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('country').optional().trim().isLength({ max: 100 }).withMessage('Country must be less than 100 characters')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, email, password, country } = req.body;
  const pool = getPool();

  // Check if user already exists
  const [existingUsers] = await pool.execute(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existingUsers.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const [result] = await pool.execute(
    `INSERT INTO users (name, email, password, country, role, is_active, email_verified)
     VALUES (?, ?, ?, ?, 'user', true, false)`,
    [name, email, hashedPassword, country || null]
  );

  const userId = result.insertId;

  // Get created user
  const [users] = await pool.execute(
    'SELECT id, name, email, role, avatar, country, is_active, email_verified, created_at FROM users WHERE id = ?',
    [userId]
  );

  const user = users[0];

  // Log registration activity
  await pool.execute(
    'INSERT INTO activities (user_id, activity_type, description, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, 'user_registered', `User ${name} registered`, JSON.stringify({ email, country }), req.ip, req.get('User-Agent')]
  );

  // Send token response
  sendTokenResponse(user, 201, res);
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;
  console.log('Login attempt for:', email);
  const pool = getPool();

  // Check if user exists
  const [users] = await pool.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if (users.length === 0) {
    console.log('User not found:', email);
    return res.status(401).json({
      success: false,
      message: 'User not found'
    });
  }

  const user = users[0];
  console.log('User found:', user.email, 'Role:', user.role);

  // Check if user is active
  if (!user.is_active) {
    console.log('User inactive:', email);
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated. Please contact support.'
    });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  console.log('Password valid:', isPasswordValid);
  
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid password'
    });
  }

  // Update last login
  await pool.execute(
    'UPDATE users SET last_login = NOW() WHERE id = ?',
    [user.id]
  );

  // Log login activity
  await pool.execute(
    'INSERT INTO activities (user_id, activity_type, description, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [user.id, 'user_login', `User ${user.name} logged in`, JSON.stringify({ email }), req.ip, req.get('User-Agent')]
  );

  // Remove password from user object
  delete user.password;

  // Send token response
  sendTokenResponse(user, 200, res);
}));

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', require('../middleware/auth').protect, catchAsync(async (req, res, next) => {
  const pool = getPool();

  const [users] = await pool.execute(`
    SELECT u.id, u.name, u.email, u.role, u.avatar, u.bio, u.location, u.country,
           u.is_active, u.email_verified, u.last_login, u.created_at, u.updated_at,
           up.organization, up.expertise, up.interests, up.social_links, up.preferences
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE u.id = ?
  `, [req.user.id]);

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const user = users[0];

  // Parse JSON fields
  if (user.social_links) user.social_links = JSON.parse(user.social_links);
  if (user.preferences) user.preferences = JSON.parse(user.preferences);

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
}));

// @desc    Update user password
// @route   PUT /api/auth/updatepassword
// @access  Private
router.put('/updatepassword', require('../middleware/auth').protect, [
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { currentPassword, newPassword } = req.body;
  const pool = getPool();

  // Get user with password
  const [users] = await pool.execute(
    'SELECT password FROM users WHERE id = ?',
    [req.user.id]
  );

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
  if (!isCurrentPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Hash new password
  const salt = await bcrypt.genSalt(12);
  const hashedNewPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  await pool.execute(
    'UPDATE users SET password = ? WHERE id = ?',
    [hashedNewPassword, req.user.id]
  );

  // Log password change activity
  await pool.execute(
    'INSERT INTO activities (user_id, activity_type, description, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, 'password_changed', 'User changed password', JSON.stringify({}), req.ip, req.get('User-Agent')]
  );

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
}));

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
router.post('/forgotpassword', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email } = req.body;
  const pool = getPool();

  // Check if user exists
  const [users] = await pool.execute(
    'SELECT id, name FROM users WHERE email = ? AND is_active = ?',
    [email, true]
  );

  if (users.length === 0) {
    // Don't reveal if email exists or not for security
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  const user = users[0];

  // Generate reset token (simplified - in production use proper token generation)
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store reset token (in production, store hashed token)
  await pool.execute(
    'UPDATE users SET reset_password_token = ?, reset_password_expiry = ? WHERE id = ?',
    [resetToken, resetTokenExpiry, user.id]
  );

  // In a real application, send email with reset link
  // For now, just log it
  console.log(`Password reset token for ${email}: ${resetToken}`);

  // Log activity
  await pool.execute(
    'INSERT INTO activities (user_id, activity_type, description, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [user.id, 'password_reset_requested', `Password reset requested for ${email}`, JSON.stringify({ email }), req.ip, req.get('User-Agent')]
  );

  res.status(200).json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.'
  });
}));

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
router.put('/resetpassword/:token', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { token } = req.params;
  const { password } = req.body;
  const pool = getPool();

  // Find user with valid reset token
  const [users] = await pool.execute(
    'SELECT id, name, email FROM users WHERE reset_password_token = ? AND reset_password_expiry > NOW() AND is_active = ?',
    [token, true]
  );

  if (users.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }

  const user = users[0];

  // Hash new password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Update password and clear reset token
  await pool.execute(
    'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expiry = NULL WHERE id = ?',
    [hashedPassword, user.id]
  );

  // Log activity
  await pool.execute(
    'INSERT INTO activities (user_id, activity_type, description, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [user.id, 'password_reset', 'Password reset completed', JSON.stringify({}), req.ip, req.get('User-Agent')]
  );

  res.status(200).json({
    success: true,
    message: 'Password reset successfully'
  });
}));

module.exports = router;
