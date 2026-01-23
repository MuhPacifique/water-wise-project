const express = require('express');
const { body, validationResult } = require('express-validator');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { protect, authorize } = require('../middleware/auth');
const { getPool } = require('../config/database');

const router = express.Router();

// @desc    Save frontend settings
// @route   POST /api/settings/frontend
// @access  Private (admin only)
router.post('/frontend', protect, authorize('admin'), [
  body('showHero').optional().isBoolean().withMessage('showHero must be a boolean'),
  body('showProblem').optional().isBoolean().withMessage('showProblem must be a boolean'),
  body('showSolutions').optional().isBoolean().withMessage('showSolutions must be a boolean'),
  body('showResources').optional().isBoolean().withMessage('showResources must be a boolean'),
  body('showChat').optional().isBoolean().withMessage('showChat must be a boolean'),
  body('showTeam').optional().isBoolean().withMessage('showTeam must be a boolean'),
  body('showActivities').optional().isBoolean().withMessage('showActivities must be a boolean'),
  body('showFooter').optional().isBoolean().withMessage('showFooter must be a boolean'),
  body('showNav').optional().isBoolean().withMessage('showNav must be a boolean'),
  body('maintenanceMode').optional().isBoolean().withMessage('maintenanceMode must be a boolean'),
  body('maintenanceProgress').optional().isInt({ min: 0, max: 100 }).withMessage('maintenanceProgress must be between 0 and 100'),
  body('maintenanceCompletionDate').optional().isString().trim(),
  body('darkMode').optional().isBoolean().withMessage('darkMode must be a boolean')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const settings = req.body;
  const pool = getPool();

  // Store settings in database with key 'frontend_settings'
  await pool.execute(
    `INSERT INTO settings (setting_key, setting_value, updated_by, updated_at)
     VALUES (?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
     setting_value = VALUES(setting_value),
     updated_by = VALUES(updated_by),
     updated_at = NOW()`,
    ['frontend_settings', JSON.stringify(settings), req.user.id]
  );

  res.status(200).json({
    success: true,
    message: 'Frontend settings saved successfully'
  });
}));

// @desc    Get frontend settings
// @route   GET /api/settings/frontend
// @access  Private (admin only)
router.get('/frontend', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const pool = getPool();

  const [settings] = await pool.execute(
    'SELECT setting_value FROM settings WHERE setting_key = ?',
    ['frontend_settings']
  );

  let frontendSettings = {
    showHero: true,
    showProblem: true,
    showSolutions: true,
    showResources: true,
    showChat: true,
    showTeam: true,
    showActivities: true,
    showFooter: true,
    showNav: true,
    maintenanceMode: false,
    maintenanceProgress: 0,
    maintenanceCompletionDate: '',
  };

  if (settings.length > 0) {
    try {
      frontendSettings = { ...frontendSettings, ...JSON.parse(settings[0].setting_value) };
    } catch (error) {
      console.error('Error parsing frontend settings:', error);
    }
  }

  res.status(200).json({
    success: true,
    data: frontendSettings
  });
}));

// @desc    Get frontend visibility settings
// @route   GET /api/settings/frontend-visibility
// @access  Public
router.get('/frontend-visibility', catchAsync(async (req, res, next) => {
  const pool = getPool();

  const [settings] = await pool.execute(
    'SELECT setting_value FROM settings WHERE setting_key = ?',
    ['frontend_settings']
  );

  let frontendVisibility = {
    showHero: true,
    showProblem: true,
    showSolutions: true,
    showResources: true,
    showChat: true,
    showTeam: true,
    showActivities: true,
    showFooter: true,
    showNav: true,
    darkMode: false,
  };

  if (settings.length > 0) {
    try {
      const fullSettings = JSON.parse(settings[0].setting_value);
      frontendVisibility = {
        showHero: fullSettings.showHero !== false,
        showProblem: fullSettings.showProblem !== false,
        showSolutions: fullSettings.showSolutions !== false,
        showResources: fullSettings.showResources !== false,
        showChat: fullSettings.showChat !== false,
        showTeam: fullSettings.showTeam !== false,
        showActivities: fullSettings.showActivities !== false,
        showFooter: fullSettings.showFooter !== false,
        showNav: fullSettings.showNav !== false,
        darkMode: fullSettings.darkMode || false,
      };
    } catch (error) {
      console.error('Error parsing frontend settings:', error);
    }
  }

  res.status(200).json({
    success: true,
    data: frontendVisibility
  });
}));

// @desc    Get maintenance mode status
// @route   GET /api/settings/maintenance
// @access  Public
router.get('/maintenance', catchAsync(async (req, res, next) => {
  const pool = getPool();

  const [settings] = await pool.execute(
    'SELECT setting_value FROM settings WHERE setting_key = ?',
    ['frontend_settings']
  );

  let maintenanceMode = false;
  let maintenanceProgress = 0;
  let maintenanceCompletionDate = '';

  if (settings.length > 0) {
    try {
      const frontendSettings = JSON.parse(settings[0].setting_value);
      maintenanceMode = frontendSettings.maintenanceMode || false;
      maintenanceProgress = frontendSettings.maintenanceProgress || 0;
      maintenanceCompletionDate = frontendSettings.maintenanceCompletionDate || '';
    } catch (error) {
      console.error('Error parsing frontend settings:', error);
    }
  }

  res.status(200).json({
    success: true,
    maintenanceMode,
    maintenanceProgress,
    maintenanceCompletionDate
  });
}));

// @desc    Save site content
// @route   POST /api/settings/content
// @access  Private (admin only)
router.post('/content', protect, authorize('admin'), [
  body('hero_title').optional().isString().trim(),
  body('site_name').optional().isString().trim(),
  body('hero_subtitle').optional().isString().trim(),
  body('site_description').optional().isString().trim(),
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const content = req.body;
  const pool = getPool();

  // Store content in database with key 'site_content'
  await pool.execute(
    `INSERT INTO settings (setting_key, setting_value, updated_by, updated_at)
     VALUES (?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
     setting_value = VALUES(setting_value),
     updated_by = VALUES(updated_by),
     updated_at = NOW()`,
    ['site_content', JSON.stringify(content), req.user.id]
  );

  res.status(200).json({
    success: true,
    message: 'Site content saved successfully'
  });
}));

// @desc    Get site content
// @route   GET /api/settings/content
// @access  Public
router.get('/content', catchAsync(async (req, res, next) => {
  const pool = getPool();

  const [settings] = await pool.execute(
    'SELECT setting_value FROM settings WHERE setting_key = ?',
    ['site_content']
  );

  let siteContent = {
    hero_title: "Protecting water resources",
    site_name: "Water-Wise Project",
    hero_subtitle: "Save the Water",
    site_description: "Empowering communities across East Africa to protect, conserve, and sustain our most precious natural resource through education and action."
  };

  if (settings.length > 0) {
    try {
      siteContent = { ...siteContent, ...JSON.parse(settings[0].setting_value) };
    } catch (error) {
      console.error('Error parsing site content:', error);
    }
  }

  res.status(200).json({
    success: true,
    data: siteContent
  });
}));

// @desc    Save problem section content
// @route   POST /api/settings/problem-content
// @access  Private (admin only)
router.post('/problem-content', protect, authorize('admin'), [
  body('title').optional().isString().trim(),
  body('subtitle').optional().isString().trim(),
  body('description').optional().isString().trim(),
  body('points').optional().isArray(),
  body('image_url').optional().isString().trim().isURL().withMessage('image_url must be a valid URL'),
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const content = req.body;
  const pool = getPool();

  // Store content in database with key 'problem_content'
  await pool.execute(
    `INSERT INTO settings (setting_key, setting_value, updated_by, updated_at)
     VALUES (?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
     setting_value = VALUES(setting_value),
     updated_by = VALUES(updated_by),
     updated_at = NOW()`,
    ['problem_content', JSON.stringify(content), req.user.id]
  );

  res.status(200).json({
    success: true,
    message: 'Problem section content saved successfully'
  });
}));

// @desc    Get problem section content
// @route   GET /api/settings/problem-content
// @access  Public
router.get('/problem-content', catchAsync(async (req, res, next) => {
  const pool = getPool();

  const [settings] = await pool.execute(
    'SELECT setting_value FROM settings WHERE setting_key = ?',
    ['problem_content']
  );

  let problemContent = {
    title: "Water Resource Challenge",
    subtitle: "Critical Challenge",
    description: "All over the world, the issue of climate change is a subject under discussion. Most countries face its effects, especially in Africa, due to specific challenges:",
    points: [
      "Lack of awareness about water resources protection",
      "Direct dumping of waste into rivers, lakes, and oceans",
      "Agricultural activities too close to river banks",
      "Language barriers in existing online awareness programs"
    ],
    image_url: "https://picsum.photos/seed/water-problem/800/600"
  };

  if (settings.length > 0) {
    try {
      problemContent = { ...problemContent, ...JSON.parse(settings[0].setting_value) };
    } catch (error) {
      console.error('Error parsing problem content:', error);
    }
  }

  res.status(200).json({
    success: true,
    data: problemContent
  });
}));

// @desc    Save footer content
// @route   POST /api/settings/footer
// @access  Private (admin only)
router.post('/footer', protect, authorize('admin'), [
  body('facebook_url').optional({ checkFalsy: true }).isString().trim(),
  body('twitter_url').optional({ checkFalsy: true }).isString().trim(),
  body('github_url').optional({ checkFalsy: true }).isString().trim(),
  body('contact_email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid contact email'),
  body('locations').optional({ checkFalsy: true }).isString().trim(),
  body('quick_links').optional().isArray(),
  body('programs').optional().isArray(),
  body('copyright_text').optional({ checkFalsy: true }).isString().trim(),
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const content = req.body;
  const pool = getPool();

  await pool.execute(
    `INSERT INTO settings (setting_key, setting_value, updated_by, updated_at)
     VALUES (?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
     setting_value = VALUES(setting_value),
     updated_by = VALUES(updated_by),
     updated_at = NOW()`,
    ['footer_content', JSON.stringify(content), req.user.id]
  );

  res.status(200).json({
    success: true,
    message: 'Footer content saved successfully'
  });
}));

// @desc    Get footer content
// @route   GET /api/settings/footer
// @access  Public
router.get('/footer', catchAsync(async (req, res, next) => {
  const pool = getPool();

  const [settings] = await pool.execute(
    'SELECT setting_value FROM settings WHERE setting_key = ?',
    ['footer_content']
  );

  let footerContent = {
    facebook_url: "https://facebook.com",
    twitter_url: "https://twitter.com",
    github_url: "https://github.com",
    contact_email: "info@waterwise.org",
    locations: "Kigali, Rwanda | Bujumbura, Burundi | Dar es Salaam, Tanzania",
    quick_links: [
      { label: "Home", href: "#" },
      { label: "Challenges", href: "#problem" },
      { label: "Our Solution", href: "#solutions" },
      { label: "Specialist Hub", href: "#chat" }
    ],
    programs: [
      "Water Heroes Certificate",
      "3D Animation Classes",
      "Rural Outreach",
      "Tree Planting"
    ],
    copyright_text: "WATER-WISE PROJECT. SUSTAINING LIFE."
  };

  if (settings.length > 0) {
    try {
      footerContent = { ...footerContent, ...JSON.parse(settings[0].setting_value) };
    } catch (error) {
      console.error('Error parsing footer content:', error);
    }
  }

  res.status(200).json({
    success: true,
    data: footerContent
  });
}));

// @desc    Save initiatives take action content
// @route   POST /api/settings/initiatives-take-action
// @access  Private (admin only)
router.post('/initiatives-take-action', protect, authorize('admin'), [
  body('title').optional().isString().trim(),
  body('description').optional().isString().trim(),
  body('volunteer_button_text').optional().isString().trim(),
  body('donate_button_text').optional().isString().trim(),
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const content = req.body;
  const pool = getPool();

  await pool.execute(
    `INSERT INTO settings (setting_key, setting_value, updated_by, updated_at)
     VALUES (?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
     setting_value = VALUES(setting_value),
     updated_by = VALUES(updated_by),
     updated_at = NOW()`,
    ['initiatives_take_action', JSON.stringify(content), req.user.id]
  );

  res.status(200).json({
    success: true,
    message: 'Initiatives take action content saved successfully'
  });
}));

// @desc    Get initiatives take action content
// @route   GET /api/settings/initiatives-take-action
// @access  Public
router.get('/initiatives-take-action', catchAsync(async (req, res, next) => {
  const pool = getPool();

  const [settings] = await pool.execute(
    'SELECT setting_value FROM settings WHERE setting_key = ?',
    ['initiatives_take_action']
  );

  let takeActionContent = {
    title: "Take Action",
    description: "Be part of the solution. Every small action counts towards protecting our water resources.",
    volunteer_button_text: "Volunteer with Us",
    donate_button_text: "Donate to this Cause"
  };

  if (settings.length > 0) {
    try {
      takeActionContent = { ...takeActionContent, ...JSON.parse(settings[0].setting_value) };
    } catch (error) {
      console.error('Error parsing initiatives take action content:', error);
    }
  }

  res.status(200).json({
    success: true,
    data: takeActionContent
  });
}));

module.exports = router;
