const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, param, query, validationResult } = require('express-validator');
const { catchAsync } = require('../middleware/errorHandler');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { getPool } = require('../config/database');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// --- Testimonies Routes ---

// @desc    Get all active testimonies
// @route   GET /api/community/testimonies
// @access  Public
router.get('/testimonies', catchAsync(async (req, res) => {
  const pool = getPool();
  const [testimonies] = await pool.execute(
    'SELECT * FROM community_testimonies WHERE is_active = ? ORDER BY created_at DESC',
    [true]
  );

  res.status(200).json({
    success: true,
    data: testimonies
  });
}));

// @desc    Get all testimonies (including inactive)
// @route   GET /api/community/testimonies/admin
// @access  Private (Admin)
router.get('/testimonies/admin', protect, authorize('admin'), catchAsync(async (req, res) => {
  const pool = getPool();
  const [testimonies] = await pool.execute(
    'SELECT * FROM community_testimonies ORDER BY created_at DESC'
  );

  res.status(200).json({
    success: true,
    data: testimonies
  });
}));

// @desc    Create a testimony
// @route   POST /api/community/testimonies
// @access  Public (or Admin if we want to moderate)
router.post('/testimonies', [
  body('name').trim().notEmpty().isLength({ max: 100 }),
  body('location').optional().trim().isLength({ max: 255 }),
  body('text').trim().notEmpty()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed: ' + errors.array().map(e => e.msg).join(', '),
      errors: errors.array() 
    });
  }

  const { name, location, text } = req.body;
  const pool = getPool();

  const [result] = await pool.execute(
    'INSERT INTO community_testimonies (name, location, text) VALUES (?, ?, ?)',
    [name, location, text]
  );

  res.status(201).json({
    success: true,
    data: { id: result.insertId, name, location, text }
  });
}));

// @desc    Update a testimony
// @route   PUT /api/community/testimonies/:id
// @access  Private (Admin)
router.put('/testimonies/:id', protect, authorize('admin'), [
  param('id').isInt(),
  body('name').optional().trim().isLength({ max: 100 }),
  body('location').optional().trim().isLength({ max: 255 }),
  body('text').optional().trim().notEmpty(),
  body('is_active').optional().isBoolean(),
  body('likes').optional().isInt()
], catchAsync(async (req, res) => {
  const { id } = req.params;
  const pool = getPool();

  const fields = ['name', 'location', 'text', 'is_active', 'likes'];
  const updates = [];
  const values = [];

  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  });

  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update' });
  }

  values.push(id);
  await pool.execute(
    `UPDATE community_testimonies SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  res.status(200).json({ success: true, message: 'Testimony updated successfully' });
}));

// @desc    Delete a testimony
// @route   DELETE /api/community/testimonies/:id
// @access  Private (Admin)
router.delete('/testimonies/:id', protect, authorize('admin'), catchAsync(async (req, res) => {
  const { id } = req.params;
  const pool = getPool();

  await pool.execute('DELETE FROM community_testimonies WHERE id = ?', [id]);

  res.status(200).json({ success: true, message: 'Testimony deleted successfully' });
}));

// --- Campaigns Routes ---

// @desc    Get all active campaigns
// @route   GET /api/community/campaigns
// @access  Public
router.get('/campaigns', catchAsync(async (req, res) => {
  const pool = getPool();
  const [campaigns] = await pool.execute(
    'SELECT * FROM water_campaigns WHERE is_active = ? ORDER BY created_at DESC',
    [true]
  );

  res.status(200).json({
    success: true,
    data: campaigns
  });
}));

// @desc    Get single campaign
// @route   GET /api/community/campaigns/:id
// @access  Public
router.get('/campaigns/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const pool = getPool();
  const [campaigns] = await pool.execute(
    'SELECT * FROM water_campaigns WHERE id = ?',
    [id]
  );

  if (campaigns.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Campaign not found'
    });
  }

  res.status(200).json({
    success: true,
    data: campaigns[0]
  });
}));

// @desc    Get all campaigns (including inactive)
// @route   GET /api/community/campaigns/admin
// @access  Private (Admin)
router.get('/campaigns/admin', protect, authorize('admin'), catchAsync(async (req, res) => {
  const pool = getPool();
  const [campaigns] = await pool.execute(
    'SELECT * FROM water_campaigns ORDER BY created_at DESC'
  );

  res.status(200).json({
    success: true,
    data: campaigns
  });
}));

// @desc    Create a campaign
// @route   POST /api/community/campaigns
// @access  Private (Admin)
router.post('/campaigns', protect, authorize('admin'), upload.single('image'), [
  body('title').trim().notEmpty().isLength({ max: 500 }),
  body('location').optional().trim().isLength({ max: 255 }),
  body('date').optional().trim().isLength({ max: 100 }),
  body('participants').optional().isInt(),
  body('status').optional().isIn(['Planned', 'Upcoming', 'Ongoing', 'Completed']),
  body('campaign_type').optional().isIn(['Tree Planting', 'Plastic Collection', 'Agroforestry', 'Awareness', 'Other']),
  body('image_url').optional().trim().isLength({ max: 1000 })
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed: ' + errors.array().map(e => e.msg).join(', '),
      errors: errors.array() 
    });
  }

  let { title, location, date, participants = 0, status = 'Planned', campaign_type = 'Awareness', image_url } = req.body;
  const pool = getPool();

  if (req.file) {
    image_url = `/uploads/${req.file.filename}`;
  }

  const [result] = await pool.execute(
    'INSERT INTO water_campaigns (title, location, date, participants, status, campaign_type, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, location, date, participants, status, campaign_type, image_url]
  );

  res.status(201).json({
    success: true,
    data: { id: result.insertId, title, location, date, participants, status, campaign_type, image_url }
  });
}));

// @desc    Update a campaign
// @route   PUT /api/community/campaigns/:id
// @access  Private (Admin)
router.put('/campaigns/:id', protect, authorize('admin'), upload.single('image'), [
  param('id').isInt(),
  body('title').optional().trim().isLength({ max: 500 }),
  body('location').optional().trim().isLength({ max: 255 }),
  body('date').optional().trim().isLength({ max: 100 }),
  body('participants').optional().isInt(),
  body('status').optional().isIn(['Planned', 'Upcoming', 'Ongoing', 'Completed']),
  body('campaign_type').optional().isIn(['Tree Planting', 'Plastic Collection', 'Agroforestry', 'Awareness', 'Other']),
  body('image_url').optional().trim().isLength({ max: 1000 }),
  body('is_active').optional().isBoolean()
], catchAsync(async (req, res) => {
  const { id } = req.params;
  const pool = getPool();

  const [existing] = await pool.execute('SELECT * FROM water_campaigns WHERE id = ?', [id]);
  if (existing.length === 0) {
    return res.status(404).json({ success: false, message: 'Campaign not found' });
  }

  if (req.file) {
    // Delete old image file if it exists and is local
    if (existing[0].image_url && existing[0].image_url.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '..', existing[0].image_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    req.body.image_url = `/uploads/${req.file.filename}`;
  }

  const fields = ['title', 'location', 'date', 'participants', 'status', 'campaign_type', 'image_url', 'is_active'];
  const updates = [];
  const values = [];

  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  });

  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update' });
  }

  values.push(id);
  await pool.execute(
    `UPDATE water_campaigns SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  res.status(200).json({ success: true, message: 'Campaign updated successfully' });
}));

// @desc    Delete a campaign
// @route   DELETE /api/community/campaigns/:id
// @access  Private (Admin)
router.delete('/campaigns/:id', protect, authorize('admin'), catchAsync(async (req, res) => {
  const { id } = req.params;
  const pool = getPool();

  const [existing] = await pool.execute('SELECT * FROM water_campaigns WHERE id = ?', [id]);
  if (existing.length === 0) {
    return res.status(404).json({ success: false, message: 'Campaign not found' });
  }

  // Delete local image file
  if (existing[0].image_url && existing[0].image_url.startsWith('/uploads/')) {
    const imgPath = path.join(__dirname, '..', existing[0].image_url);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  await pool.execute('DELETE FROM water_campaigns WHERE id = ?', [id]);

  res.status(200).json({ success: true, message: 'Campaign deleted successfully' });
}));

// --- Campaign Registration Routes ---

// @desc    Register for a campaign
// @route   POST /api/community/campaigns/:id/register
// @access  Public (or Private if we want to track users)
router.post('/campaigns/:id/register', [
  param('id').isInt(),
  body('name').trim().notEmpty().isLength({ max: 100 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('role').trim().notEmpty().isLength({ max: 100 }),
  body('phone').optional().trim().isLength({ max: 50 }),
  body('experience').optional().trim()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed: ' + errors.array().map(e => e.msg).join(', '),
      errors: errors.array() 
    });
  }

  const { id } = req.params;
  const { name, email, phone, role, experience } = req.body;
  const pool = getPool();

  // Check if campaign exists
  const [campaigns] = await pool.execute('SELECT * FROM water_campaigns WHERE id = ?', [id]);
  if (campaigns.length === 0) {
    return res.status(404).json({ success: false, message: 'Campaign not found' });
  }

  // Insert registration
  const [result] = await pool.execute(
    'INSERT INTO campaign_registrations (campaign_id, name, email, phone, role, experience) VALUES (?, ?, ?, ?, ?, ?)',
    [id, name, email, phone || null, role, experience || null]
  );

  // Update participant count in water_campaigns
  await pool.execute(
    'UPDATE water_campaigns SET participants = participants + 1 WHERE id = ?',
    [id]
  );

  // Log activity
  try {
    await pool.execute(
      'INSERT INTO activities (activity_type, description, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
      ['campaign_registration', `Volunteer ${name} registered for campaign ${id}`, JSON.stringify({ name, email, campaign_id: id }), req.ip || null, req.get('User-Agent') || null]
    );
  } catch (activityError) {
    console.error('Failed to log campaign registration activity:', activityError);
    // Don't fail the registration if activity logging fails
  }

  res.status(201).json({
    success: true,
    message: 'Successfully registered for the campaign',
    data: { id: result.insertId }
  });
}));

// @desc    Get all campaign registrations
// @route   GET /api/community/registrations
// @access  Private (Admin)
router.get('/registrations', protect, authorize('admin'), catchAsync(async (req, res) => {
  const pool = getPool();
  const [registrations] = await pool.execute(`
    SELECT cr.*, wc.title as campaign_title 
    FROM campaign_registrations cr
    JOIN water_campaigns wc ON cr.campaign_id = wc.id
    ORDER BY cr.created_at DESC
  `);

  res.status(200).json({
    success: true,
    data: registrations
  });
}));

// @desc    Delete a campaign registration
// @route   DELETE /api/community/registrations/:id
// @access  Private (Admin)
router.delete('/registrations/:id', protect, authorize('admin'), catchAsync(async (req, res) => {
  const { id } = req.params;
  const pool = getPool();

  // Get campaign_id before deleting
  const [registrations] = await pool.execute('SELECT campaign_id FROM campaign_registrations WHERE id = ?', [id]);
  
  if (registrations.length > 0) {
    const campaignId = registrations[0].campaign_id;
    
    // Delete registration
    await pool.execute('DELETE FROM campaign_registrations WHERE id = ?', [id]);

    // Update participant count in water_campaigns
    await pool.execute(
      'UPDATE water_campaigns SET participants = GREATEST(0, participants - 1) WHERE id = ?',
      [campaignId]
    );
  } else {
    return res.status(404).json({ success: false, message: 'Registration not found' });
  }

  res.status(200).json({ success: true, message: 'Registration deleted successfully' });
}));

module.exports = router;
