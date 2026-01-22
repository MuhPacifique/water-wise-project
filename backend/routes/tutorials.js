const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, param, query, validationResult } = require('express-validator');
const { catchAsync } = require('../middleware/errorHandler');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { getPool } = require('../config/database');

const router = express.Router();

// Configure multer for file uploads
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
    fileSize: 100 * 1024 * 1024 // 100MB limit for tutorial videos
  }
});

// @desc    Get all tutorials
// @route   GET /api/tutorials
// @access  Public
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().trim(),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  query('language').optional().isLength({ min: 2, max: 10 })
], catchAsync(async (req, res, next) => {
  const { page = 1, limit = 12, category, difficulty, language = 'en' } = req.query;
  const pool = getPool();
  const offset = (page - 1) * limit;

  const whereConditions = ['is_active = ?'];
  const whereValues = [true];

  if (category) {
    whereConditions.push('category = ?');
    whereValues.push(category);
  }

  if (difficulty) {
    whereConditions.push('difficulty = ?');
    whereValues.push(difficulty);
  }

  if (language) {
    whereConditions.push('language = ?');
    whereValues.push(language);
  }

  const whereClause = whereConditions.join(' AND ');

  const [tutorials] = await pool.execute(`
    SELECT * FROM interactive_tutorials
    WHERE ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `, [...whereValues, parseInt(limit), offset]);

  const [countResult] = await pool.execute(`
    SELECT COUNT(*) as total FROM interactive_tutorials WHERE ${whereClause}
  `, whereValues);

  res.status(200).json({
    success: true,
    data: {
      tutorials,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    }
  });
}));

// @desc    Get single tutorial
// @route   GET /api/tutorials/:id
// @access  Public
router.get('/:id', optionalAuth, [
  param('id').isInt({ min: 1 })
], catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const pool = getPool();

  const [tutorials] = await pool.execute(
    'SELECT * FROM interactive_tutorials WHERE id = ? AND is_active = ?',
    [id, true]
  );

  if (tutorials.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Tutorial not found'
    });
  }

  res.status(200).json({
    success: true,
    data: tutorials[0]
  });
}));

// @desc    Create tutorial
// @route   POST /api/tutorials
// @access  Private (Admin/Moderator)
router.post('/', protect, authorize('admin', 'moderator'), upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), [
  body('title').trim().isLength({ min: 1, max: 500 }),
  body('description').optional().trim(),
  body('video_url').optional().isURL(),
  body('thumbnail_url').optional().isURL(),
  body('duration').optional().isInt({ min: 0 }).toInt(),
  body('category').optional().trim(),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('language').optional().isLength({ min: 2, max: 10 })
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  let { title, description, video_url, thumbnail_url, duration, category, difficulty, language = 'en' } = req.body;
  const pool = getPool();

  // If files were uploaded, use those URLs
  if (req.files) {
    if (req.files.video) {
      video_url = `/uploads/${req.files.video[0].filename}`;
    }
    if (req.files.thumbnail) {
      thumbnail_url = `/uploads/${req.files.thumbnail[0].filename}`;
    }
  }

  if (!video_url) {
    return res.status(400).json({ success: false, message: 'Video file or URL is required' });
  }

  const [result] = await pool.execute(
    `INSERT INTO interactive_tutorials 
     (title, description, video_url, thumbnail_url, duration, category, difficulty, language, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, video_url, thumbnail_url, duration, category, difficulty, language, req.user.id]
  );

  res.status(201).json({
    success: true,
    data: { id: result.insertId, title, video_url }
  });
}));

// @desc    Update tutorial
// @route   PUT /api/tutorials/:id
// @access  Private (Admin/Moderator)
router.put('/:id', protect, authorize('admin', 'moderator'), upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), [
  param('id').isInt({ min: 1 }),
  body('title').optional().trim().isLength({ min: 1, max: 500 }),
  body('description').optional().trim(),
  body('video_url').optional().isURL(),
  body('thumbnail_url').optional().isURL(),
  body('duration').optional().isInt({ min: 0 }).toInt(),
  body('category').optional().trim(),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('language').optional().isLength({ min: 2, max: 10 }),
  body('is_active').optional().isBoolean().toBoolean()
], catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const pool = getPool();

  const [existing] = await pool.execute('SELECT * FROM interactive_tutorials WHERE id = ?', [id]);
  if (existing.length === 0) {
    return res.status(404).json({ success: false, message: 'Tutorial not found' });
  }

  const fields = ['title', 'description', 'video_url', 'thumbnail_url', 'duration', 'category', 'difficulty', 'language', 'is_active'];
  const updates = [];
  const values = [];

  // Handle uploaded files
  if (req.files) {
    if (req.files.video) {
      // Delete old video file if it exists and is local
      if (existing[0].video_url && existing[0].video_url.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', existing[0].video_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      req.body.video_url = `/uploads/${req.files.video[0].filename}`;
    }
    if (req.files.thumbnail) {
      // Delete old thumbnail file if it exists and is local
      if (existing[0].thumbnail_url && existing[0].thumbnail_url.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', existing[0].thumbnail_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      req.body.thumbnail_url = `/uploads/${req.files.thumbnail[0].filename}`;
    }
  }

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
    `UPDATE interactive_tutorials SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  res.status(200).json({ success: true, message: 'Tutorial updated successfully' });
}));

// @desc    Delete tutorial
// @route   DELETE /api/tutorials/:id
// @access  Private (Admin/Moderator)
router.delete('/:id', protect, authorize('admin', 'moderator'), [
  param('id').isInt({ min: 1 })
], catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const pool = getPool();

  const [existing] = await pool.execute('SELECT * FROM interactive_tutorials WHERE id = ?', [id]);
  if (existing.length === 0) {
    return res.status(404).json({ success: false, message: 'Tutorial not found' });
  }

  // Delete local files
  if (existing[0].video_url && existing[0].video_url.startsWith('/uploads/')) {
    const videoPath = path.join(__dirname, '..', existing[0].video_url);
    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
  }
  if (existing[0].thumbnail_url && existing[0].thumbnail_url.startsWith('/uploads/')) {
    const thumbnailPath = path.join(__dirname, '..', existing[0].thumbnail_url);
    if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);
  }

  const [result] = await pool.execute('DELETE FROM interactive_tutorials WHERE id = ?', [id]);

  res.status(200).json({ success: true, message: 'Tutorial deleted successfully' });
}));

module.exports = router;
