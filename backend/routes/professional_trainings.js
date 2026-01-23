const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, param, query, validationResult } = require('express-validator');
const { catchAsync, AppError } = require('../middleware/errorHandler');
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
    fileSize: 50 * 1024 * 1024 // 50MB limit for documents
  }
});

// @desc    Get all professional trainings
// @route   GET /api/professional-trainings
// @access  Public
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().trim(),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  query('language').optional().isLength({ min: 2, max: 10 })
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }
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

  const [trainings] = await pool.execute(`
    SELECT * FROM professional_trainings
    WHERE ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `, [...whereValues, parseInt(limit), offset]);

  const [countResult] = await pool.execute(`
    SELECT COUNT(*) as total FROM professional_trainings WHERE ${whereClause}
  `, whereValues);

  res.status(200).json({
    success: true,
    data: {
      trainings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    }
  });
}));

// @desc    Get single training
// @route   GET /api/professional-trainings/:id
// @access  Public
router.get('/:id', optionalAuth, [
  param('id').isInt({ min: 1 })
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }
  const { id } = req.params;
  const pool = getPool();

  const [trainings] = await pool.execute(
    'SELECT * FROM professional_trainings WHERE id = ? AND is_active = ?',
    [id, true]
  );

  if (trainings.length === 0) {
    return next(new AppError('Training not found', 404));
  }

  res.status(200).json({
    success: true,
    data: trainings[0]
  });
}));

// @desc    Create training
// @route   POST /api/professional-trainings
// @access  Private (Admin/Moderator)
router.post('/', protect, authorize('admin', 'moderator'), upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), [
  body('title').trim().isLength({ min: 1, max: 500 }),
  body('description').optional().trim(),
  body('document_url').optional().isURL(),
  body('thumbnail_url').optional().isURL(),
  body('category').optional().trim(),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('language').optional().isLength({ min: 2, max: 10 })
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  let { title, description, document_url, thumbnail_url, category, difficulty, language = 'en' } = req.body;
  const pool = getPool();

  if (req.files) {
    if (req.files.document) {
      document_url = `/uploads/${req.files.document[0].filename}`;
    }
    if (req.files.thumbnail) {
      thumbnail_url = `/uploads/${req.files.thumbnail[0].filename}`;
    }
  }

  if (!document_url) {
    return next(new AppError('Document file or URL is required', 400));
  }

  const [result] = await pool.execute(
    `INSERT INTO professional_trainings 
     (title, description, document_url, thumbnail_url, category, difficulty, language, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, document_url, thumbnail_url, category, difficulty, language, req.user.id]
  );

  res.status(201).json({
    success: true,
    data: { id: result.insertId, title, document_url }
  });
}));

// @desc    Update training
// @route   PUT /api/professional-trainings/:id
// @access  Private (Admin/Moderator)
router.put('/:id', protect, authorize('admin', 'moderator'), upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), [
  param('id').isInt({ min: 1 }),
  body('title').optional().trim().isLength({ min: 1, max: 500 }),
  body('description').optional().trim(),
  body('document_url').optional().isURL(),
  body('thumbnail_url').optional().isURL(),
  body('category').optional().trim(),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('language').optional().isLength({ min: 2, max: 10 }),
  body('is_active').optional().isBoolean().toBoolean()
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }
  const { id } = req.params;
  const pool = getPool();

  const [existing] = await pool.execute('SELECT * FROM professional_trainings WHERE id = ?', [id]);
  if (existing.length === 0) {
    return next(new AppError('Training not found', 404));
  }

  const fields = ['title', 'description', 'document_url', 'thumbnail_url', 'category', 'difficulty', 'language', 'is_active'];
  const updates = [];
  const values = [];

  if (req.files) {
    if (req.files.document) {
      if (existing[0].document_url && existing[0].document_url.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', existing[0].document_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      req.body.document_url = `/uploads/${req.files.document[0].filename}`;
    }
    if (req.files.thumbnail) {
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
    return next(new AppError('No fields to update', 400));
  }

  values.push(id);
  await pool.execute(
    `UPDATE professional_trainings SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  res.status(200).json({ success: true, message: 'Training updated successfully' });
}));

// @desc    Delete training
// @route   DELETE /api/professional-trainings/:id
// @access  Private (Admin/Moderator)
router.delete('/:id', protect, authorize('admin', 'moderator'), [
  param('id').isInt({ min: 1 })
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }
  const { id } = req.params;
  const pool = getPool();

  const [existing] = await pool.execute('SELECT * FROM professional_trainings WHERE id = ?', [id]);
  if (existing.length === 0) {
    return next(new AppError('Training not found', 404));
  }

  if (existing[0].document_url && existing[0].document_url.startsWith('/uploads/')) {
    const docPath = path.join(__dirname, '..', existing[0].document_url);
    if (fs.existsSync(docPath)) fs.unlinkSync(docPath);
  }
  if (existing[0].thumbnail_url && existing[0].thumbnail_url.startsWith('/uploads/')) {
    const thumbnailPath = path.join(__dirname, '..', existing[0].thumbnail_url);
    if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);
  }

  await pool.execute('DELETE FROM professional_trainings WHERE id = ?', [id]);

  res.status(200).json({ success: true, message: 'Training deleted successfully' });
}));

module.exports = router;
