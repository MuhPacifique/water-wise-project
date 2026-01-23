const express = require('express');
const bcrypt = require('bcryptjs');
const { body, param, query, validationResult } = require('express-validator');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { protect, authorize } = require('../middleware/auth');
const { getPool } = require('../config/database');

const router = express.Router();

// @desc    Admin create user
// @route   POST /api/users
// @access  Private (admin only)
router.post('/', protect, authorize('admin'), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['user', 'moderator', 'admin']).withMessage('Invalid role'),
  body('country').optional().trim().isLength({ max: 100 }).withMessage('Country must be less than 100 characters')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { name, email, password, role = 'user', country } = req.body;
  const pool = getPool();

  // Check if user already exists
  const [existingUsers] = await pool.execute(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existingUsers.length > 0) {
    return next(new AppError('User with this email already exists', 400));
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const [result] = await pool.execute(
    `INSERT INTO users (name, email, password, role, country, is_active, email_verified)
     VALUES (?, ?, ?, ?, ?, true, true)`,
    [name, email, hashedPassword, role, country || null]
  );

  const userId = result.insertId;

  // Log activity
  await pool.execute(
    'INSERT INTO activities (user_id, activity_type, description, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, 'user_created', `Admin created user: ${name}`, JSON.stringify({ email, role }), req.ip || null, req.get('User-Agent') || null]
  );

  // Get created user
  const [users] = await pool.execute(
    'SELECT id, name, email, role, avatar, bio, location, country, is_active, email_verified, last_login, created_at, updated_at FROM users WHERE id = ?',
    [userId]
  );

  res.status(201).json({
    success: true,
    data: {
      user: users[0]
    }
  });
}));

// @desc    Admin update user password
// @route   PUT /api/users/:id/password
// @access  Private (admin only)
router.put('/:id/password', protect, authorize('admin'), [
  param('id').isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { id } = req.params;
  const { password } = req.body;
  const pool = getPool();

  // Check if user exists
  const [users] = await pool.execute(
    'SELECT id, name FROM users WHERE id = ?',
    [id]
  );

  if (users.length === 0) {
    return next(new AppError('User not found', 404));
  }

  // Hash new password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Update password
  await pool.execute(
    'UPDATE users SET password = ? WHERE id = ?',
    [hashedPassword, id]
  );

  // Log activity
  await pool.execute(
    'INSERT INTO activities (user_id, activity_type, description, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, 'user_password_reset', `Admin reset password for user: ${users[0].name}`, JSON.stringify({ userId: id }), req.ip || null, req.get('User-Agent') || null]
  );

  res.status(200).json({
    success: true,
    message: 'User password updated successfully'
  });
}));

// @desc    Get all users
// @route   GET /api/users
// @access  Private (admin only)
router.get('/', protect, authorize('admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['user', 'moderator', 'admin']).withMessage('Invalid role'),
  query('active').optional().isBoolean().withMessage('Active must be a boolean'),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search query must be between 1 and 100 characters')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { page = 1, limit = 20, role, active, search } = req.query;
  const pool = getPool();
  const offset = (page - 1) * limit;

  // Build WHERE clause
  const whereConditions = [];
  const whereValues = [];

  if (role) {
    whereConditions.push('role = ?');
    whereValues.push(role);
  }

  if (active !== undefined) {
    whereConditions.push('is_active = ?');
    whereValues.push(active === 'true' ? 1 : 0);
  }

  if (search) {
    whereConditions.push('(name LIKE ? OR email LIKE ?)');
    whereValues.push(`%${search}%`, `%${search}%`);
  }

  const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

  // Get users
  const [users] = await pool.execute(`
    SELECT id, name, email, role, avatar, bio, location, country,
           is_active, email_verified, last_login, created_at, updated_at
    FROM users ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `, [...whereValues, parseInt(limit), offset]);

  // Get total count
  const [countResult] = await pool.execute(
    `SELECT COUNT(*) as total FROM users ${whereClause}`,
    whereValues
  );

  const total = countResult[0].total;
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    }
  });
}));

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (own profile or admin)
router.get('/:id', protect, [
  param('id').isInt({ min: 1 }).withMessage('User ID must be a positive integer')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { id } = req.params;
  const pool = getPool();

  // Check if user can access this profile
  if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to access this user profile', 403));
  }

  // Get user with profile
  const [users] = await pool.execute(`
    SELECT u.id, u.name, u.email, u.role, u.avatar, u.bio, u.location, u.country,
           u.is_active, u.email_verified, u.last_login, u.created_at, u.updated_at,
           up.organization, up.expertise, up.interests, up.social_links, up.preferences
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE u.id = ?
  `, [id]);

  if (users.length === 0) {
    return next(new AppError('User not found', 404));
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

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (own profile or admin)
router.put('/:id', protect, [
  param('id').isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('location').optional().trim().isLength({ max: 255 }).withMessage('Location must be less than 255 characters'),
  body('country').optional().trim().isLength({ max: 100 }).withMessage('Country must be less than 100 characters'),
  body('avatar').optional().trim().isURL().withMessage('Avatar must be a valid URL'),
  body('role').optional().isIn(['user', 'moderator', 'admin']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { id } = req.params;
  const { name, bio, location, country, avatar, role, isActive } = req.body;
  const pool = getPool();

  // Check permissions
  if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update this user', 403));
  }

  // Only admins can change role and active status
  if ((role || isActive !== undefined) && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to change role or active status', 403));
  }

  // Build update query for users table
  const userUpdateFields = [];
  const userUpdateValues = [];

  if (name !== undefined) {
    userUpdateFields.push('name = ?');
    userUpdateValues.push(name);
  }
  if (bio !== undefined) {
    userUpdateFields.push('bio = ?');
    userUpdateValues.push(bio);
  }
  if (location !== undefined) {
    userUpdateFields.push('location = ?');
    userUpdateValues.push(location);
  }
  if (country !== undefined) {
    userUpdateFields.push('country = ?');
    userUpdateValues.push(country);
  }
  if (avatar !== undefined) {
    userUpdateFields.push('avatar = ?');
    userUpdateValues.push(avatar);
  }
  if (role !== undefined && req.user.role === 'admin') {
    userUpdateFields.push('role = ?');
    userUpdateValues.push(role);
  }
  if (isActive !== undefined && req.user.role === 'admin') {
    userUpdateFields.push('is_active = ?');
    userUpdateValues.push(isActive);
  }

  // Update user if there are fields to update
  if (userUpdateFields.length > 0) {
    userUpdateValues.push(id);
    await pool.execute(
      `UPDATE users SET ${userUpdateFields.join(', ')} WHERE id = ?`,
      userUpdateValues
    );
  }

  // Log activity
  await pool.execute(
    'INSERT INTO activities (user_id, activity_type, description, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, 'user_updated', `Updated user profile`, JSON.stringify({ userId: id }), req.ip || null, req.get('User-Agent') || null]
  );

  // Get updated user
  const [users] = await pool.execute(
    'SELECT id, name, email, role, avatar, bio, location, country, is_active, email_verified, last_login, created_at, updated_at FROM users WHERE id = ?',
    [id]
  );

  res.status(200).json({
    success: true,
    data: {
      user: users[0]
    }
  });
}));

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (admin only)
router.delete('/:id', protect, authorize('admin'), [
  param('id').isInt({ min: 1 }).withMessage('User ID must be a positive integer')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { id } = req.params;
  const pool = getPool();

  // Check if user exists
  const [users] = await pool.execute(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );

  if (users.length === 0) {
    return next(new AppError('User not found', 404));
  }

  const user = users[0];

  // Prevent deleting admin users
  if (user.role === 'admin') {
    return next(new AppError('Cannot delete admin users', 403));
  }

  // Soft delete by deactivating
  await pool.execute(
    'UPDATE users SET is_active = ? WHERE id = ?',
    [false, id]
  );

  // Log activity
  await pool.execute(
    'INSERT INTO activities (user_id, activity_type, description, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, 'user_deleted', `Deactivated user: ${user.name}`, JSON.stringify({ userId: id, userName: user.name }), req.ip || null, req.get('User-Agent') || null]
  );

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully'
  });
}));

// @desc    Get user profile
// @route   GET /api/users/:id/profile
// @access  Private (own profile or admin)
router.get('/:id/profile', protect, [
  param('id').isInt({ min: 1 }).withMessage('User ID must be a positive integer')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { id } = req.params;
  const pool = getPool();

  // Check permissions
  if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to access this user profile', 403));
  }

  // Get user profile
  const [profiles] = await pool.execute(
    'SELECT * FROM user_profiles WHERE user_id = ?',
    [id]
  );

  let profile = null;
  if (profiles.length > 0) {
    profile = profiles[0];
    // Parse JSON fields
    if (profile.social_links) profile.social_links = JSON.parse(profile.social_links);
    if (profile.preferences) profile.preferences = JSON.parse(profile.preferences);
  }

  res.status(200).json({
    success: true,
    data: {
      profile
    }
  });
}));

// @desc    Update user profile
// @route   PUT /api/users/:id/profile
// @access  Private (own profile only)
router.put('/:id/profile', protect, [
  param('id').isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
  body('organization').optional().trim().isLength({ max: 255 }).withMessage('Organization must be less than 255 characters'),
  body('expertise').optional().trim().isLength({ max: 1000 }).withMessage('Expertise must be less than 1000 characters'),
  body('interests').optional().trim().isLength({ max: 1000 }).withMessage('Interests must be less than 1000 characters'),
  body('socialLinks').optional().isObject().withMessage('Social links must be an object'),
  body('preferences').optional().isObject().withMessage('Preferences must be an object')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { id } = req.params;
  const { organization, expertise, interests, socialLinks, preferences } = req.body;
  const pool = getPool();

  // Check ownership
  if (req.user.id !== parseInt(id)) {
    return next(new AppError('Not authorized to update this user profile', 403));
  }

  // Check if profile exists
  const [existingProfiles] = await pool.execute(
    'SELECT id FROM user_profiles WHERE user_id = ?',
    [id]
  );

  const profileData = {
    organization: organization || null,
    expertise: expertise || null,
    interests: interests || null,
    social_links: socialLinks ? JSON.stringify(socialLinks) : null,
    preferences: preferences ? JSON.stringify(preferences) : null
  };

  if (existingProfiles.length > 0) {
    // Update existing profile
    const updateFields = [];
    const updateValues = [];

    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(profileData[key]);
      }
    });

    if (updateFields.length > 0) {
      updateValues.push(id);
      await pool.execute(
        `UPDATE user_profiles SET ${updateFields.join(', ')} WHERE user_id = ?`,
        updateValues
      );
    }
  } else {
    // Create new profile
    await pool.execute(
      `INSERT INTO user_profiles (user_id, organization, expertise, interests, social_links, preferences)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, ...Object.values(profileData)]
    );
  }

  // Get updated profile
  const [profiles] = await pool.execute(
    'SELECT * FROM user_profiles WHERE user_id = ?',
    [id]
  );

  const profile = profiles[0];
  // Parse JSON fields
  if (profile.social_links) profile.social_links = JSON.parse(profile.social_links);
  if (profile.preferences) profile.preferences = JSON.parse(profile.preferences);

  res.status(200).json({
    success: true,
    data: {
      profile
    }
  });
}));

// @desc    Get user activity
// @route   GET /api/users/:id/activity
// @access  Private (own activity or admin)
router.get('/:id/activity', protect, [
  param('id').isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const pool = getPool();

  // Check permissions
  if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this user activity'
    });
  }

  const offset = (page - 1) * limit;

  // Get user activities
  const [activities] = await pool.execute(`
    SELECT id, activity_type, description, metadata, ip_address, created_at
    FROM activities
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `, [id, parseInt(limit), offset]);

  // Get total count
  const [countResult] = await pool.execute(
    'SELECT COUNT(*) as total FROM activities WHERE user_id = ?',
    [id]
  );

  const total = countResult[0].total;
  const totalPages = Math.ceil(total / limit);

  // Parse metadata JSON
  activities.forEach(activity => {
    if (activity.metadata) {
      activity.metadata = JSON.parse(activity.metadata);
    }
  });

  res.status(200).json({
    success: true,
    data: {
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    }
  });
}));

module.exports = router;
