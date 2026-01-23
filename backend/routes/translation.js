const express = require('express');
const { body, validationResult } = require('express-validator');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const geminiService = require('../services/geminiService');

const router = express.Router();

// Translation endpoint using Gemini AI
router.post('/translate', [
  body('text').notEmpty().withMessage('Text is required'),
  body('to').notEmpty().withMessage('Target language (to) is required')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { text, from = 'en', to } = req.body;

  try {
    const translatedText = await geminiService.translate(text, to, from);
    
    res.json({
      success: true,
      data: {
        originalText: text,
        translatedText: translatedText,
        from,
        to
      }
    });
  } catch (error) {
    console.error('Translation error:', error);
    return next(new AppError('Translation failed', 500));
  }
}));

module.exports = router;
