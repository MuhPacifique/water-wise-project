const express = require('express');
const { body, validationResult } = require('express-validator');
const { catchAsync } = require('../middleware/errorHandler');
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
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { message, history = [], language = 'en' } = req.body;

  try {
    const response = await geminiService.generateResponse(message, history, language);
    
    res.status(200).json({
      success: true,
      data: {
        response
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get response from AI specialist'
    });
  }
}));

module.exports = router;
