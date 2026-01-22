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

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, MP4, MOV, AVI, JPG, PNG, GIF files are allowed.'), false);
  }
};

const thumbnailFilter = (req, file, cb) => {
  const allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid thumbnail file type. Only JPG, PNG, GIF files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// @desc    Get all resources (Admin version)
// @route   GET /api/resources/admin
// @access  Private (Admin/Moderator)
router.get('/admin', protect, authorize('admin', 'moderator'), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('includeDeleted').optional().isBoolean()
], catchAsync(async (req, res, next) => {
  const { page = 1, limit = 50, includeDeleted = 'false' } = req.query;
  const pool = getPool();
  const offset = (page - 1) * limit;

  const whereConditions = [];
  const whereValues = [];

  if (includeDeleted !== 'true') {
    whereConditions.push('r.deleted_at IS NULL');
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  const [resources] = await pool.execute(`
    SELECT r.*, u.name as uploaded_by_name,
           COALESCE(rt.title, r.title) as translated_title,
           COALESCE(rt.description, r.description) as translated_description
    FROM resources r
    LEFT JOIN users u ON r.uploaded_by = u.id
    LEFT JOIN resource_translations rt ON r.id = rt.resource_id AND rt.language = 'en'
    ${whereClause}
    ORDER BY r.created_at DESC
    LIMIT ? OFFSET ?
  `, [...whereValues, parseInt(limit), offset]);

  const [countResult] = await pool.execute(`
    SELECT COUNT(*) as total FROM resources r ${whereClause}
  `, whereValues);

  res.status(200).json({
    success: true,
    data: {
      resources,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    }
  });
}));

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public (with optional auth for personalization)
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['document', 'video', 'link', 'image']).withMessage('Invalid resource type'),
  query('category').optional().isLength({ min: 1, max: 100 }).withMessage('Category must be between 1 and 100 characters'),
  query('language').optional().isLength({ min: 2, max: 10 }).withMessage('Language code must be between 2 and 10 characters'),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search query must be between 1 and 100 characters'),
  query('featured').optional().isBoolean().withMessage('Featured must be a boolean')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const {
    page = 1,
    limit = 12,
    type,
    category,
    language = 'en',
    search,
    featured
  } = req.query;

  const pool = getPool();
  const offset = (page - 1) * limit;

  // Build WHERE clause
  const whereConditions = ['r.is_public = ?', 'r.deleted_at IS NULL'];
  const whereValues = [true];

  if (type) {
    whereConditions.push('r.type = ?');
    whereValues.push(type);
  }

  if (category) {
    whereConditions.push('r.category = ?');
    whereValues.push(category);
  }

  if (featured !== undefined) {
    whereConditions.push('r.is_featured = ?');
    whereValues.push(featured === 'true' ? 1 : 0);
  }

  if (search) {
    whereConditions.push('(r.title LIKE ? OR r.description LIKE ?)');
    whereValues.push(`%${search}%`, `%${search}%`);
  }

  const whereClause = whereConditions.join(' AND ');

  // Get resources with translations
  const [resources] = await pool.execute(`
    SELECT r.id, r.title, r.description, r.type, r.file_url, r.thumbnail_url, r.file_size,
           r.mime_type, r.category, r.tags, r.language, r.is_featured,
           r.download_count, r.view_count, r.created_at,
           u.name as uploaded_by_name,
           COALESCE(rt.title, r.title) as translated_title,
           COALESCE(rt.description, r.description) as translated_description
    FROM resources r
    LEFT JOIN users u ON r.uploaded_by = u.id
    LEFT JOIN resource_translations rt ON r.id = rt.resource_id AND rt.language = ?
    WHERE ${whereClause}
    ORDER BY r.is_featured DESC, r.created_at DESC
    LIMIT ? OFFSET ?
  `, [language, ...whereValues, parseInt(limit), offset]);

  // Get total count
  const [countResult] = await pool.execute(`
    SELECT COUNT(*) as total FROM resources r WHERE ${whereClause} AND r.deleted_at IS NULL
  `, whereValues);

  const total = countResult[0].total;
  const totalPages = Math.ceil(total / limit);

  // Log analytics if user is authenticated
  if (req.user) {
    await pool.execute(
      'INSERT INTO analytics (event_type, event_data, user_id, ip_address, user_agent, page_url) VALUES (?, ?, ?, ?, ?, ?)',
      ['resources_browse', JSON.stringify({ page, limit, type, category, search }), req.user.id, req.ip || null, req.get('User-Agent') || null, req.originalUrl]
    );
  }

  res.status(200).json({
    success: true,
    data: {
      resources,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    }
  });
}));

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public (with optional auth)
router.get('/:id', optionalAuth, [
  param('id').isInt({ min: 1 }).withMessage('Resource ID must be a positive integer')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { id } = req.params;
  const language = req.query.language || 'en';
  const pool = getPool();

  // Get resource with translation
  const [resources] = await pool.execute(`
    SELECT r.*, u.name as uploaded_by_name,
           COALESCE(rt.title, r.title) as translated_title,
           COALESCE(rt.description, r.description) as translated_description
    FROM resources r
    LEFT JOIN users u ON r.uploaded_by = u.id
    LEFT JOIN resource_translations rt ON r.id = rt.resource_id AND rt.language = ?
    WHERE r.id = ? AND r.is_public = ? AND r.deleted_at IS NULL
  `, [language, id, true]);

  if (resources.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  const resource = resources[0];

  // Increment view count
  await pool.execute(
    'UPDATE resources SET view_count = view_count + 1 WHERE id = ?',
    [id]
  );

  // Log analytics
  if (req.user) {
    await pool.execute(
      'INSERT INTO analytics (event_type, event_data, user_id, ip_address, user_agent, page_url) VALUES (?, ?, ?, ?, ?, ?)',
      ['resource_view', JSON.stringify({ resourceId: id }), req.user.id, req.ip || null, req.get('User-Agent') || null, req.originalUrl]
    );
  }

  res.status(200).json({
    success: true,
    data: {
      resource
    }
  });
}));

// Configure multer for thumbnail uploads
const thumbnailUpload = multer({
  storage: storage,
  fileFilter: thumbnailFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for thumbnails
  }
});

// @desc    Upload resource
// @route   POST /api/resources
// @access  Private
router.post('/', protect, (req, res, next) => {
  // Use multer middleware with fields for both file and thumbnail
  const uploadFields = upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]);

  uploadFields(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    // Validate that file is provided for non-link resources
    if (!req.files.file && req.body.type !== 'link') {
      return res.status(400).json({
        success: false,
        message: 'File is required for document, video, and image resources'
      });
    }

    next();
  });
}, [
  body('title').trim().isLength({ min: 1, max: 500 }).withMessage('Title must be between 1 and 500 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters'),
  body('type').isIn(['document', 'video', 'link', 'image']).withMessage('Invalid resource type'),
  body('category').optional().trim().isLength({ max: 100 }).withMessage('Category must be less than 100 characters'),
  body('tags').optional().isString().withMessage('Tags must be a string'),
  body('isPublic').optional().isIn(['true', 'false']).toBoolean().withMessage('isPublic must be true or false'),
  body('isFeatured').optional().isIn(['true', 'false']).toBoolean().withMessage('isFeatured must be true or false'),
  body('language').optional().isLength({ min: 2, max: 10 }).withMessage('Language code must be between 2 and 10 characters')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  if (!req.files.file && req.body.type !== 'link') {
    return res.status(400).json({
      success: false,
      message: 'File is required for document, video, and image resources'
    });
  }

  const {
    title,
    description,
    type,
    category,
    tags,
    isPublic = true,
    isFeatured = false,
    language = 'en',
    file_url: body_file_url,
    thumbnail_url: body_thumbnail_url
  } = req.body;

  const pool = getPool();

  // Parse tags - handle both array and comma-separated string
  let parsedTags = null;
  if (tags) {
    if (Array.isArray(tags)) {
      parsedTags = tags;
    } else if (typeof tags === 'string') {
      parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
  }

  // Prepare resource data
  const resourceData = {
    title,
    description: description || '',
    type,
    file_path: req.files.file ? req.files.file[0].path : null,
    file_url: req.files.file ? `/uploads/${req.files.file[0].filename}` : (body_file_url || null),
    thumbnail_url: req.files.thumbnail ? `/uploads/${req.files.thumbnail[0].filename}` : (body_thumbnail_url || null),
    file_size: req.files.file ? req.files.file[0].size : null,
    mime_type: req.files.file ? req.files.file[0].mimetype : null,
    category: category || null,
    tags: parsedTags ? JSON.stringify(parsedTags) : null,
    language,
    is_public: isPublic,
    is_featured: isFeatured,
    uploaded_by: req.user.id
  };

  // Insert resource
  console.log('Inserting resource with data:', resourceData);
  const [result] = await pool.execute(
    `INSERT INTO resources (title, description, type, file_path, file_url, thumbnail_url, file_size, mime_type,
                           category, tags, language, is_public, is_featured, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      resourceData.title,
      resourceData.description,
      resourceData.type,
      resourceData.file_path,
      resourceData.file_url,
      resourceData.thumbnail_url,
      resourceData.file_size,
      resourceData.mime_type,
      resourceData.category,
      resourceData.tags,
      resourceData.language,
      resourceData.is_public,
      resourceData.is_featured,
      resourceData.uploaded_by
    ]
  );
  console.log('Resource inserted successfully with ID:', result.insertId);

  const resourceId = result.insertId;

  // Log activity
  await pool.execute(
    'INSERT INTO activities (user_id, activity_type, description, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, 'resource_uploaded', `Uploaded resource: ${title}`, JSON.stringify({ resourceId, type }), req.ip || null, req.get('User-Agent') || null]
  );

  // Get created resource
  const [resources] = await pool.execute(
    'SELECT * FROM resources WHERE id = ?',
    [resourceId]
  );

  res.status(201).json({
    success: true,
    data: {
      resource: resources[0]
    }
  });
}));

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private (owner or admin)
router.put('/:id', protect, (req, res, next) => {
  const uploadFields = upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]);

  uploadFields(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
}, [
  param('id').isInt({ min: 1 }).withMessage('Resource ID must be a positive integer'),
  body('title').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Title must be between 1 and 500 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters'),
  body('category').optional().trim().isLength({ max: 100 }).withMessage('Category must be less than 100 characters'),
  body('tags').optional().custom((value) => {
    if (value === undefined) return true;
    if (typeof value === 'string') return true; // Accept string from multipart/form-data
    if (Array.isArray(value)) return true;
    return false;
  }).withMessage('Tags must be a string or array'),
  body('isPublic').optional().isIn(['true', 'false', true, false]).withMessage('isPublic must be a boolean or boolean string'),
  body('isFeatured').optional().isIn(['true', 'false', true, false]).withMessage('isFeatured must be a boolean or boolean string')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { id } = req.params;
  const { title, description, category, tags, isPublic, isFeatured, file_url, thumbnail_url } = req.body;
  const pool = getPool();

  // Check if resource exists and user has permission
  const [resources] = await pool.execute(
    'SELECT * FROM resources WHERE id = ?',
    [id]
  );

  if (resources.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  const resource = resources[0];

  // Check ownership or admin role
  if (resource.uploaded_by !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this resource'
    });
  }

  // Build update query
  const updateFields = [];
  const updateValues = [];

  if (title !== undefined) {
    updateFields.push('title = ?');
    updateValues.push(title);
  }
  if (description !== undefined) {
    updateFields.push('description = ?');
    updateValues.push(description);
  }
  if (category !== undefined) {
    updateFields.push('category = ?');
    updateValues.push(category);
  }
  
  if (tags !== undefined) {
    let parsedTags = null;
    if (Array.isArray(tags)) {
      parsedTags = tags;
    } else if (typeof tags === 'string') {
      parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    updateFields.push('tags = ?');
    updateValues.push(parsedTags ? JSON.stringify(parsedTags) : null);
  }

  if (isPublic !== undefined) {
    updateFields.push('is_public = ?');
    updateValues.push(isPublic === 'true' || isPublic === true);
  }
  if (isFeatured !== undefined && req.user.role === 'admin') {
    updateFields.push('is_featured = ?');
    updateValues.push(isFeatured === 'true' || isFeatured === true);
  }

  // Handle new file upload
  if (req.files && req.files.file) {
    // Delete old file if it exists
    if (resource.file_path && fs.existsSync(resource.file_path)) {
      try {
        fs.unlinkSync(resource.file_path);
      } catch (err) {
        console.error('Error deleting old file:', err);
      }
    }
    
    updateFields.push('file_path = ?');
    updateValues.push(req.files.file[0].path);
    updateFields.push('file_url = ?');
    updateValues.push(`/uploads/${req.files.file[0].filename}`);
    updateFields.push('file_size = ?');
    updateValues.push(req.files.file[0].size);
    updateFields.push('mime_type = ?');
    updateValues.push(req.files.file[0].mimetype);
  }

  // Handle new thumbnail upload
  if (req.files && req.files.thumbnail) {
    // Delete old thumbnail if it exists
    if (resource.thumbnail_url) {
      const oldThumbnailPath = path.join(__dirname, '..', resource.thumbnail_url);
      if (fs.existsSync(oldThumbnailPath)) {
        try {
          fs.unlinkSync(oldThumbnailPath);
        } catch (err) {
          console.error('Error deleting old thumbnail:', err);
        }
      }
    }
    
    updateFields.push('thumbnail_url = ?');
    updateValues.push(`/uploads/${req.files.thumbnail[0].filename}`);
  } else if (thumbnail_url !== undefined) {
    updateFields.push('thumbnail_url = ?');
    updateValues.push(thumbnail_url);
  }

  // Handle new file URL if no file uploaded
  if (!req.files || !req.files.file) {
    if (file_url !== undefined) {
      updateFields.push('file_url = ?');
      updateValues.push(file_url);
      // If it's a URL, we might want to clear file_path or set it to null
      updateFields.push('file_path = ?');
      updateValues.push(null);
    }
  }

  if (updateFields.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields to update'
    });
  }

  updateValues.push(id);
  await pool.execute(
    `UPDATE resources SET ${updateFields.join(', ')} WHERE id = ?`,
    updateValues
  );

  // Log activity
  await pool.execute(
    'INSERT INTO activities (user_id, activity_type, description, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, 'resource_updated', `Updated resource: ${resource.title}`, JSON.stringify({ resourceId: id }), req.ip || null, req.get('User-Agent') || null]
  );

  // Get updated resource
  const [updatedResources] = await pool.execute(
    'SELECT * FROM resources WHERE id = ?',
    [id]
  );

  res.status(200).json({
    success: true,
    data: {
      resource: updatedResources[0]
    }
  });
}));

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (owner or admin)
router.delete('/:id', protect, [
  param('id').isInt({ min: 1 }).withMessage('Resource ID must be a positive integer')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { id } = req.params;
  const pool = getPool();

  // Check if resource exists and user has permission
  const [resources] = await pool.execute(
    'SELECT * FROM resources WHERE id = ?',
    [id]
  );

  if (resources.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  const resource = resources[0];

  // Check ownership or admin role
  if (resource.uploaded_by !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this resource'
    });
  }

  // Perform soft delete
  await pool.execute('UPDATE resources SET deleted_at = CURRENT_TIMESTAMP, is_public = false WHERE id = ?', [id]);

  // Log activity
  await pool.execute(
    'INSERT INTO activities (user_id, activity_type, description, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, 'resource_deleted', `Deleted (archived) resource: ${resource.title}`, JSON.stringify({ resourceId: id, softDelete: true }), req.ip || null, req.get('User-Agent') || null]
  );

  res.status(200).json({
    success: true,
    message: 'Resource archived successfully'
  });
}));

// @desc    Restore resource
// @route   POST /api/resources/:id/restore
// @access  Private (admin)
router.post('/:id/restore', protect, authorize('admin'), [
  param('id').isInt({ min: 1 }).withMessage('Resource ID must be a positive integer')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { id } = req.params;
  const pool = getPool();

  // Check if resource exists
  const [resources] = await pool.execute(
    'SELECT * FROM resources WHERE id = ?',
    [id]
  );

  if (resources.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  const resource = resources[0];

  // Perform restore
  await pool.execute('UPDATE resources SET deleted_at = NULL, is_public = true WHERE id = ?', [id]);

  // Log activity
  await pool.execute(
    'INSERT INTO activities (user_id, activity_type, description, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, 'resource_restored', `Restored resource: ${resource.title}`, JSON.stringify({ resourceId: id }), req.ip || null, req.get('User-Agent') || null]
  );

  res.status(200).json({
    success: true,
    message: 'Resource restored successfully'
  });
}));

// @desc    Download resource
// @route   GET /api/resources/:id/download
// @access  Public
router.get('/:id/download', optionalAuth, [
  param('id').isInt({ min: 1 }).withMessage('Resource ID must be a positive integer')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { id } = req.params;
  const pool = getPool();

  // Get resource
  const [resources] = await pool.execute(
    'SELECT * FROM resources WHERE id = ? AND is_public = ?',
    [id, true]
  );

  if (resources.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  const resource = resources[0];

  if (!resource.file_path || !fs.existsSync(resource.file_path)) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }

  // Increment download count
  await pool.execute(
    'UPDATE resources SET download_count = download_count + 1 WHERE id = ?',
    [id]
  );

  // Log analytics
  if (req.user) {
    await pool.execute(
      'INSERT INTO analytics (event_type, event_data, user_id, ip_address, user_agent, page_url) VALUES (?, ?, ?, ?, ?, ?)',
      ['resource_download', JSON.stringify({ resourceId: id }), req.user.id, req.ip || null, req.get('User-Agent') || null, req.originalUrl]
    );
  }

  // Send file
  res.download(resource.file_path, resource.title + path.extname(resource.file_path));
}));

// @desc    View resource in browser
// @route   GET /api/resources/:id/view
// @access  Public
router.get('/:id/view', optionalAuth, [
  param('id').isInt({ min: 1 }).withMessage('Resource ID must be a positive integer')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { id } = req.params;
  const pool = getPool();

  // Get resource
  const [resources] = await pool.execute(
    'SELECT * FROM resources WHERE id = ?',
    [id]
  );

  if (resources.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  const resource = resources[0];

  // Check if resource is public or user is owner/admin
  if (!resource.is_public && (!req.user || (resource.uploaded_by !== req.user.id && req.user.role !== 'admin'))) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this resource'
    });
  }

  if (!resource.file_path || !fs.existsSync(resource.file_path)) {
    return res.status(404).json({
      success: false,
      message: 'File not found on server'
    });
  }

  // Increment view count
  await pool.execute(
    'UPDATE resources SET view_count = view_count + 1 WHERE id = ?',
    [id]
  );

  // Set proper content type and send file
  res.set('Content-Type', resource.mime_type || 'application/octet-stream');
  res.sendFile(resource.file_path);
}));

// @desc    Get resource categories
// @route   GET /api/resources/categories
// @access  Public
router.get('/categories', catchAsync(async (req, res, next) => {
  const pool = getPool();

  const [categories] = await pool.execute(`
    SELECT category, COUNT(*) as count
    FROM resources
    WHERE is_public = ? AND category IS NOT NULL
    GROUP BY category
    ORDER BY count DESC
  `, [true]);

  res.status(200).json({
    success: true,
    data: {
      categories
    }
  });
}));

module.exports = router;
