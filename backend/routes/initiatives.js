const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { getPool } = require('../config/database');
const { catchAsync, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Get all initiatives (public - active only)
router.get('/', catchAsync(async (req, res, next) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    'SELECT id, title, description, icon, image_url, is_active FROM initiatives WHERE is_active = true ORDER BY created_at ASC'
  );
  res.json({ success: true, data: rows });
}));

// Get all initiatives (admin only - includes inactive)
router.get('/admin', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    'SELECT * FROM initiatives ORDER BY created_at ASC'
  );
  res.json({ success: true, data: rows });
}));

// Get single initiative (public)
router.get('/:id', catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const pool = getPool();
  const [rows] = await pool.execute(
    'SELECT * FROM initiatives WHERE id = ?',
    [id]
  );
  
  if (rows.length === 0) {
    return next(new AppError('Initiative not found', 404));
  }
  
  res.json({ success: true, data: rows[0] });
}));

// Create initiative (admin only)
router.post('/', protect, authorize('admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { title, description, content, icon, image_url } = req.body;
  const pool = getPool();

  const [result] = await pool.execute(
    'INSERT INTO initiatives (title, description, content, icon, image_url) VALUES (?, ?, ?, ?, ?)',
    [title, description, content, icon, image_url]
  );

  res.status(201).json({
    success: true,
    message: 'Initiative created successfully',
    data: { id: result.insertId }
  });
}));

// Update initiative (admin only)
router.put('/:id', protect, authorize('admin'), [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { id } = req.params;
  const { title, description, content, icon, image_url, is_active } = req.body;
  const pool = getPool();

  const [result] = await pool.execute(
    'UPDATE initiatives SET title = ?, description = ?, content = ?, icon = ?, image_url = ?, is_active = ? WHERE id = ?',
    [title, description, content, icon, image_url, is_active, id]
  );

  if (result.affectedRows === 0) {
    return next(new AppError('Initiative not found', 404));
  }

  res.json({ success: true, message: 'Initiative updated successfully' });
}));

// Delete initiative (admin only)
router.delete('/:id', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const pool = getPool();

  const [result] = await pool.execute(
    'DELETE FROM initiatives WHERE id = ?',
    [id]
  );

  if (result.affectedRows === 0) {
    return next(new AppError('Initiative not found', 404));
  }

  res.json({ success: true, message: 'Initiative deleted successfully' });
}));

module.exports = router;
