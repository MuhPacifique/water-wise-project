const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/auth');
const { getPool } = require('../config/database');
const { catchAsync, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'team-' + uniqueSuffix + path.extname(file.originalname));
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
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all team members (admin only)
router.get('/', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    'SELECT * FROM team_members ORDER BY display_order ASC, created_at DESC'
  );
  res.json({ success: true, data: rows });
}));

// Get active team members (public)
router.get('/public', catchAsync(async (req, res, next) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    'SELECT id, name, country, role, image_url, bio FROM team_members WHERE is_active = true ORDER BY display_order ASC, created_at DESC'
  );
  res.json({ success: true, data: rows });
}));

// Add new team member
router.post('/', protect, authorize('admin'), upload.single('image'), catchAsync(async (req, res, next) => {
  const { name, country, role, bio, display_order, social_links } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;
  const pool = getPool();

  const [result] = await pool.execute(
    'INSERT INTO team_members (name, country, role, image_url, bio, social_links, display_order, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [name, country, role || null, image_url || null, bio || null, social_links || null, display_order || 0, req.user.id]
  );

  res.status(201).json({
    success: true,
    message: 'Team member added successfully',
    data: { id: result.insertId }
  });
}));

// Update team member
router.put('/:id', protect, authorize('admin'), upload.single('image'), catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, country, role, bio, display_order, is_active, social_links } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;
  const pool = getPool();

  const [result] = await pool.execute(
    'UPDATE team_members SET name = ?, country = ?, role = ?, image_url = ?, bio = ?, social_links = ?, display_order = ?, is_active = ? WHERE id = ?',
    [name, country, role || null, image_url || null, bio || null, social_links || null, display_order || 0, is_active, id]
  );

  if (result.affectedRows === 0) {
    return next(new AppError('Team member not found', 404));
  }

  res.json({ success: true, message: 'Team member updated successfully' });
}));

// Delete team member
router.delete('/:id', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const pool = getPool();

  const [result] = await pool.execute(
    'DELETE FROM team_members WHERE id = ?',
    [id]
  );

  if (result.affectedRows === 0) {
    return next(new AppError('Team member not found', 404));
  }

  res.json({ success: true, message: 'Team member deleted successfully' });
}));

// Update display order
router.put('/:id/order', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { display_order } = req.body;
  const pool = getPool();

  const [result] = await pool.execute(
    'UPDATE team_members SET display_order = ? WHERE id = ?',
    [display_order, id]
  );

  if (result.affectedRows === 0) {
    return next(new AppError('Team member not found', 404));
  }

  res.json({ success: true, message: 'Display order updated successfully' });
}));

module.exports = router;
