const express = require('express');
const { body, validationResult } = require('express-validator');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { getPool } = require('../config/database');

const router = express.Router();

// @desc    Submit volunteer application
// @route   POST /api/actions/volunteer
// @access  Public
router.post('/volunteer', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().trim().isLength({ max: 50 }),
  body('interest').optional().trim().isLength({ max: 255 }),
  body('message').trim().notEmpty().withMessage('Message is required')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { name, email, phone, interest, message } = req.body;
  const pool = getPool();

  await pool.execute(
    'INSERT INTO volunteer_applications (name, email, phone, interest, message) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone || null, interest || null, message]
  );

  res.status(201).json({
    success: true,
    message: 'Volunteer application submitted successfully'
  });
}));

// @desc    Submit donation
// @route   POST /api/actions/donate
// @access  Public
router.post('/donate', [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('donor_name').optional().trim().isLength({ max: 255 }),
  body('donor_email').optional().trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('payment_method').optional().trim().isLength({ max: 50 })
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { amount, donor_name, donor_email, payment_method } = req.body;
  const pool = getPool();

  await pool.execute(
    'INSERT INTO donations (amount, donor_name, donor_email, payment_method) VALUES (?, ?, ?, ?)',
    [amount, donor_name || null, donor_email || null, payment_method || 'Credit Card']
  );

  res.status(201).json({
    success: true,
    message: 'Donation recorded successfully'
  });
}));

module.exports = router;
