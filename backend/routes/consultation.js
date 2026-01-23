const express = require('express');
const { body, validationResult } = require('express-validator');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { protect, optionalAuth } = require('../middleware/auth');
const geminiService = require('../services/geminiService');

const router = express.Router();

/**
 * @desc    Get AI consultation response
 * @route   POST /api/consultation/chat
 * @access  Public (Optional Auth for tracking)
 */
router.post('/chat', optionalAuth, [
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }).withMessage('Message is too long'),
  body('history').optional().isArray().withMessage('History must be an array'),
  body('language').optional().isString().isLength({ min: 2, max: 5 }).withMessage('Invalid language code')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { message, history = [], language = 'en' } = req.body;

  const { response, isMock } = await geminiService.generateResponse(message, history, language);
  
  res.status(200).json({
    success: true,
    data: {
      response,
      isMock
    }
  });
}));

/**
 * @desc    Get autonomous AI content for a specific section
 * @route   GET /api/consultation/autonomous-content/:section
 * @access  Public
 */
router.get('/autonomous-content/:section', catchAsync(async (req, res) => {
  const { section } = req.params;
  const content = await geminiService.generateAutonomousContent(section);
  
  res.status(200).json({
    success: true,
    data: content
  });
}));

/**
 * @desc    Get daily AI insight
 * @route   GET /api/consultation/daily-insight
 * @access  Public
 */
router.get('/daily-insight', catchAsync(async (req, res) => {
  const insights = [
    "Did you know? Planting bamboo along riverbanks in East Africa can reduce soil erosion by up to 90% while providing sustainable building material for the community.",
    "Plastic waste in Lake Victoria has reached critical levels. Autonomous collection systems could potentially remove 15 tons of surface plastic annually.",
    "Agroforestry isn't just about trees; it's about water. In dry regions of Kenya, integrated tree-crop systems maintain 30% more soil moisture.",
    "Community-led 'Water Guardians' in Tanzania have successfully restored 5 local springs by simply managing native vegetation buffer zones."
  ];
  
  // Use day of the year to pick an insight
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const insight = insights[dayOfYear % insights.length];

  res.status(200).json({
    success: true,
    data: { insight }
  });
}));

module.exports = router;
