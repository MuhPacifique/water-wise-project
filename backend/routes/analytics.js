const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { catchAsync } = require('../middleware/errorHandler');
const { protect, authorize } = require('../middleware/auth');
const { getPool } = require('../config/database');

const router = express.Router();

// @desc    Track user event
// @route   POST /api/analytics/track
// @access  Private
router.post('/track', protect, [
  body('eventType').trim().isLength({ min: 1, max: 100 }).withMessage('Event type must be between 1 and 100 characters'),
  body('eventData').optional().isObject().withMessage('Event data must be an object'),
  body('pageUrl').optional().trim().isLength({ max: 1000 }).withMessage('Page URL must be less than 1000 characters'),
  body('referrer').optional().trim().isLength({ max: 1000 }).withMessage('Referrer must be less than 1000 characters')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { eventType, eventData = {}, pageUrl, referrer } = req.body;
  const pool = getPool();

  // Insert analytics event
  await pool.execute(
    `INSERT INTO analytics (event_type, event_data, user_id, session_id, ip_address, user_agent, referrer, page_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      eventType,
      JSON.stringify(eventData),
      req.user.id,
      req.sessionID || null,
      req.ip,
      req.get('User-Agent'),
      referrer || req.get('Referrer'),
      pageUrl || req.originalUrl
    ]
  );

  res.status(201).json({
    success: true,
    message: 'Event tracked successfully'
  });
}));

// @desc    Get user analytics
// @route   GET /api/analytics/user/:userId
// @access  Private (own analytics or admin)
router.get('/user/:userId', protect, [
  param('userId').isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
  query('eventType').optional().trim().isLength({ max: 100 }).withMessage('Event type must be less than 100 characters'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { userId } = req.params;
  const { days = 30, eventType, page = 1, limit = 50 } = req.query;
  const pool = getPool();

  // Check permissions
  if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this user analytics'
    });
  }

  const offset = (page - 1) * limit;

  // Build WHERE clause
  const whereConditions = ['user_id = ?', 'created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)'];
  const whereValues = [userId, days];

  if (eventType) {
    whereConditions.push('event_type = ?');
    whereValues.push(eventType);
  }

  const whereClause = whereConditions.join(' AND ');

  // Get user analytics
  const [events] = await pool.execute(`
    SELECT id, event_type, event_data, session_id, ip_address, referrer, page_url, created_at
    FROM analytics
    WHERE ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `, [...whereValues, parseInt(limit), offset]);

  // Get total count
  const [countResult] = await pool.execute(
    `SELECT COUNT(*) as total FROM analytics WHERE ${whereClause}`,
    whereValues
  );

  const total = countResult[0].total;
  const totalPages = Math.ceil(total / limit);

  // Parse event data
  events.forEach(event => {
    if (event.event_data) {
      event.event_data = JSON.parse(event.event_data);
    }
  });

  res.status(200).json({
    success: true,
    data: {
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    }
  });
}));

// @desc    Get site-wide analytics
// @route   GET /api/analytics/site
// @access  Private (admin only)
router.get('/site', protect, authorize('admin'), [
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
  query('eventType').optional().trim().isLength({ max: 100 }).withMessage('Event type must be less than 100 characters')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { days = 30, eventType } = req.query;
  const pool = getPool();

  // Build WHERE clause
  const whereConditions = ['created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)'];
  const whereValues = [days];

  if (eventType) {
    whereConditions.push('event_type = ?');
    whereValues.push(eventType);
  }

  const whereClause = whereConditions.join(' AND ');

  // Get overall statistics
  const [stats] = await pool.execute(`
    SELECT
      COUNT(*) as total_events,
      COUNT(DISTINCT user_id) as unique_users,
      COUNT(DISTINCT session_id) as unique_sessions,
      COUNT(DISTINCT ip_address) as unique_ips
    FROM analytics
    WHERE ${whereClause}
  `, whereValues);

  // Get events by type
  const [eventTypeStats] = await pool.execute(`
    SELECT event_type, COUNT(*) as count
    FROM analytics
    WHERE ${whereClause}
    GROUP BY event_type
    ORDER BY count DESC
    LIMIT 20
  `, whereValues);

  // Get daily activity
  const [dailyStats] = await pool.execute(`
    SELECT DATE(created_at) as date, COUNT(*) as events, COUNT(DISTINCT user_id) as users
    FROM analytics
    WHERE ${whereClause}
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 30
  `, whereValues);

  // Get top pages
  const [pageStats] = await pool.execute(`
    SELECT page_url, COUNT(*) as visits
    FROM analytics
    WHERE ${whereClause} AND page_url IS NOT NULL
    GROUP BY page_url
    ORDER BY visits DESC
    LIMIT 10
  `, whereValues);

  // Get referrer statistics
  const [referrerStats] = await pool.execute(`
    SELECT referrer, COUNT(*) as count
    FROM analytics
    WHERE ${whereClause} AND referrer IS NOT NULL AND referrer != ''
    GROUP BY referrer
    ORDER BY count DESC
    LIMIT 10
  `, whereValues);

  res.status(200).json({
    success: true,
    data: {
      period: `${days} days`,
      overview: {
        totalEvents: stats[0].total_events,
        uniqueUsers: stats[0].unique_users,
        uniqueSessions: stats[0].unique_sessions,
        uniqueIPs: stats[0].unique_ips,
        averageEventsPerUser: stats[0].unique_users > 0 ? (stats[0].total_events / stats[0].unique_users).toFixed(2) : 0
      },
      eventsByType: eventTypeStats,
      dailyActivity: dailyStats,
      topPages: pageStats,
      topReferrers: referrerStats
    }
  });
}));

// @desc    Get resource analytics
// @route   GET /api/analytics/resources
// @access  Private (admin only)
router.get('/resources', protect, authorize('admin'), [
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { days = 30 } = req.query;
  const pool = getPool();

  // Get resource statistics
  const [resourceStats] = await pool.execute(`
    SELECT
      r.id, r.title, r.type, r.category,
      r.view_count, r.download_count,
      COUNT(DISTINCT rv.user_id) as unique_viewers,
      COUNT(DISTINCT rd.user_id) as unique_downloaders,
      MAX(rv.created_at) as last_viewed,
      MAX(rd.created_at) as last_downloaded
    FROM resources r
    LEFT JOIN analytics rv ON rv.event_type = 'resource_view'
      AND JSON_EXTRACT(rv.event_data, '$.resourceId') = r.id
      AND rv.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    LEFT JOIN analytics rd ON rd.event_type = 'resource_download'
      AND JSON_EXTRACT(rd.event_data, '$.resourceId') = r.id
      AND rd.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY r.id, r.title, r.type, r.category, r.view_count, r.download_count
    ORDER BY (r.view_count + r.download_count) DESC
    LIMIT 50
  `, [days, days]);

  // Get category statistics
  const [categoryStats] = await pool.execute(`
    SELECT
      r.category,
      COUNT(DISTINCT r.id) as resources_count,
      SUM(r.view_count) as total_views,
      SUM(r.download_count) as total_downloads,
      AVG(r.view_count + r.download_count) as avg_engagement
    FROM resources r
    WHERE r.category IS NOT NULL
    GROUP BY r.category
    ORDER BY total_views DESC
  `);

  // Get type statistics
  const [typeStats] = await pool.execute(`
    SELECT
      r.type,
      COUNT(*) as count,
      SUM(r.view_count) as total_views,
      SUM(r.download_count) as total_downloads
    FROM resources r
    GROUP BY r.type
    ORDER BY count DESC
  `);

  res.status(200).json({
    success: true,
    data: {
      period: `${days} days`,
      topResources: resourceStats,
      categoryStats,
      typeStats
    }
  });
}));

// @desc    Get user engagement analytics
// @route   GET /api/analytics/engagement
// @access  Private (admin only)
router.get('/engagement', protect, authorize('admin'), [
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { days = 30 } = req.query;
  const pool = getPool();

  // Get user engagement metrics
  const [engagementStats] = await pool.execute(`
    SELECT
      COUNT(DISTINCT CASE WHEN event_type LIKE 'resource_%' THEN user_id END) as resource_users,
      COUNT(DISTINCT CASE WHEN event_type LIKE 'chat_%' THEN user_id END) as chat_users,
      COUNT(DISTINCT CASE WHEN event_type LIKE 'translation_%' THEN user_id END) as translation_users,
      COUNT(DISTINCT CASE WHEN event_type = 'page_view' THEN user_id END) as page_view_users,
      COUNT(DISTINCT user_id) as total_active_users
    FROM analytics
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
  `, [days]);

  // Get user activity over time
  const [activityTimeline] = await pool.execute(`
    SELECT
      DATE(created_at) as date,
      COUNT(DISTINCT user_id) as active_users,
      COUNT(*) as total_events,
      COUNT(DISTINCT CASE WHEN event_type LIKE 'resource_%' THEN user_id END) as resource_active,
      COUNT(DISTINCT CASE WHEN event_type LIKE 'chat_%' THEN user_id END) as chat_active
    FROM analytics
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 30
  `, [days]);

  // Get user retention (simplified - users active in last 7 days who were also active 7 days before)
  const [retentionStats] = await pool.execute(`
    SELECT
      COUNT(DISTINCT recent.user_id) as retained_users,
      COUNT(DISTINCT past.user_id) as past_users
    FROM (
      SELECT DISTINCT user_id
      FROM analytics
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    ) recent
    LEFT JOIN (
      SELECT DISTINCT user_id
      FROM analytics
      WHERE created_at BETWEEN DATE_SUB(NOW(), INTERVAL 14 DAY) AND DATE_SUB(NOW(), INTERVAL 7 DAY)
    ) past ON recent.user_id = past.user_id
  `);

  const retentionRate = retentionStats[0].past_users > 0
    ? ((retentionStats[0].retained_users / retentionStats[0].past_users) * 100).toFixed(2)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      period: `${days} days`,
      engagement: {
        resourceUsers: engagementStats[0].resource_users,
        chatUsers: engagementStats[0].chat_users,
        translationUsers: engagementStats[0].translation_users,
        pageViewUsers: engagementStats[0].page_view_users,
        totalActiveUsers: engagementStats[0].total_active_users
      },
      activityTimeline,
      retention: {
        retainedUsers: retentionStats[0].retained_users,
        pastUsers: retentionStats[0].past_users,
        retentionRate: `${retentionRate}%`
      }
    }
  });
}));

// @desc    Get analytics summary for dashboard
// @route   GET /api/analytics/summary
// @access  Private (admin only)
router.get('/summary', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const pool = getPool();

  // Get basic counts from various tables
  const [userStats] = await pool.execute('SELECT COUNT(*) as total FROM users');
  const [resourceStats] = await pool.execute('SELECT COUNT(*) as total FROM resources');
  const [messageStats] = await pool.execute('SELECT COUNT(*) as total FROM chat_messages');
  const [activeUsers] = await pool.execute('SELECT COUNT(*) as total FROM users WHERE is_active = true');

  res.status(200).json({
    success: true,
    data: {
      totalUsers: userStats[0].total,
      totalResources: resourceStats[0].total,
      totalMessages: messageStats[0].total,
      activeUsers: activeUsers[0].total
    }
  });
}));

// @desc    Get all database tables
// @route   GET /api/analytics/tables
// @access  Private (admin only)
router.get('/tables', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const pool = getPool();

  // Get all table names
  const [tables] = await pool.execute('SHOW TABLES');

  // Get row counts for each table
  const tableInfo = [];
  for (const table of tables) {
    const tableName = Object.values(table)[0]; // Get the first column value (table name)
    try {
      const [countResult] = await pool.execute(`SELECT COUNT(*) as row_count FROM \`${tableName}\``);
      tableInfo.push({
        name: tableName,
        rowCount: countResult[0].row_count
      });
    } catch (error) {
      // If count fails, still include the table but with null count
      tableInfo.push({
        name: tableName,
        rowCount: null
      });
    }
  }

  res.status(200).json({
    success: true,
    data: tableInfo
  });
}));

// @desc    Get table schema
// @route   GET /api/analytics/tables/:tableName/schema
// @access  Private (admin only)
router.get('/tables/:tableName/schema', protect, authorize('admin'), [
  param('tableName').trim().isLength({ min: 1, max: 64 }).matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/).withMessage('Invalid table name')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { tableName } = req.params;
  const pool = getPool();

  // Get table schema
  const [columns] = await pool.execute(`DESCRIBE \`${tableName}\``);

  res.status(200).json({
    success: true,
    data: {
      tableName,
      columns: columns.map(col => ({
        name: col.Field,
        type: col.Type,
        nullable: col.Null === 'YES',
        key: col.Key,
        default: col.Default,
        extra: col.Extra
      }))
    }
  });
}));

// @desc    Get table data
// @route   GET /api/analytics/tables/:tableName
// @access  Private (admin only)
router.get('/tables/:tableName', protect, authorize('admin'), [
  param('tableName').trim().isLength({ min: 1, max: 64 }).matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/).withMessage('Invalid table name'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { tableName } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const pool = getPool();

  const offset = (page - 1) * limit;

  // Get data
  const [rows] = await pool.execute(`SELECT * FROM \`${tableName}\` LIMIT ? OFFSET ?`, [parseInt(limit), offset]);

  // Get total count
  const [countResult] = await pool.execute(`SELECT COUNT(*) as total FROM \`${tableName}\``, []);

  const total = countResult[0].total;
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: {
      tableName,
      rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    }
  });
}));

// @desc    Update table record
// @route   PUT /api/analytics/tables/:tableName/:id
// @access  Private (admin only)
router.put('/tables/:tableName/:id', protect, authorize('admin'), [
  param('tableName').trim().isLength({ min: 1, max: 64 }).matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/).withMessage('Invalid table name'),
  param('id').notEmpty().withMessage('ID is required'),
  body().isObject().withMessage('Request body must be an object')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { tableName, id } = req.params;
  const updateData = req.body;
  const pool = getPool();

  // Get primary key column name and schema for type conversion
  const [columns] = await pool.execute(`DESCRIBE \`${tableName}\``);
  const primaryKey = columns.find(col => col.Key === 'PRI');

  if (!primaryKey) {
    return res.status(400).json({
      success: false,
      message: 'Table does not have a primary key'
    });
  }

  // Convert data types based on column schema
  const convertedData = {};
  for (const [key, value] of Object.entries(updateData)) {
    const column = columns.find(col => col.Field === key);
    if (column) {
      const columnType = column.Type.toLowerCase();
      if (value === null || value === undefined) {
        convertedData[key] = null;
      } else if (columnType.includes('int') || columnType.includes('tinyint') || columnType.includes('smallint') || columnType.includes('mediumint') || columnType.includes('bigint')) {
        const numValue = parseInt(value);
        if (isNaN(numValue)) {
          return res.status(400).json({
            success: false,
            message: `Invalid integer value for column '${key}': ${value}`
          });
        }
        convertedData[key] = numValue;
      } else if (columnType.includes('decimal') || columnType.includes('float') || columnType.includes('double')) {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return res.status(400).json({
            success: false,
            message: `Invalid numeric value for column '${key}': ${value}`
          });
        }
        convertedData[key] = numValue;
      } else if (columnType.includes('json')) {
        try {
          convertedData[key] = typeof value === 'string' ? JSON.parse(value) : value;
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: `Invalid JSON value for column '${key}': ${value}`
          });
        }
      } else if (columnType.includes('tinyint(1)') || columnType.includes('boolean')) {
        convertedData[key] = value === 'true' || value === '1' || value === 1 || value === true ? 1 : 0;
      } else if (columnType.includes('datetime') || columnType.includes('timestamp')) {
        // Keep as string for MySQL datetime format
        convertedData[key] = value;
      } else {
        // VARCHAR, TEXT, etc. - keep as string
        convertedData[key] = String(value);
      }
    } else {
      // Column not found in schema, keep as-is
      convertedData[key] = value;
    }
  }

  // Build update query
  const setClause = Object.keys(convertedData).map(key => `${key} = ?`).join(', ');
  const values = Object.values(convertedData);

  const [result] = await pool.execute(`UPDATE \`${tableName}\` SET ${setClause} WHERE \`${primaryKey.Field}\` = ?`, [...values, id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      message: 'Record not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Record updated successfully'
  });
}));

// @desc    Delete table record
// @route   DELETE /api/analytics/tables/:tableName/:id
// @access  Private (admin only)
router.delete('/tables/:tableName/:id', protect, authorize('admin'), [
  param('tableName').trim().isLength({ min: 1, max: 64 }).matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/).withMessage('Invalid table name'),
  param('id').notEmpty().withMessage('ID is required')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { tableName, id } = req.params;
  const pool = getPool();

  // Get primary key column name
  const [columns] = await pool.execute(`DESCRIBE \`${tableName}\``);
  const primaryKey = columns.find(col => col.Key === 'PRI');

  if (!primaryKey) {
    return res.status(400).json({
      success: false,
      message: 'Table does not have a primary key'
    });
  }

  // If deleting from analytics table, handle resource count updates
  if (tableName === 'analytics') {
    // Get the record before deleting to check event_type
    const [records] = await pool.execute(`SELECT event_type, event_data FROM \`${tableName}\` WHERE \`${primaryKey.Field}\` = ?`, [id]);

    if (records.length > 0) {
      const record = records[0];
      const eventType = record.event_type;
      const eventData = record.event_data ? JSON.parse(record.event_data) : {};

      // If it's a resource view or download event, decrement the corresponding count
      if ((eventType === 'resource_view' || eventType === 'resource_download') && eventData.resourceId) {
        const countField = eventType === 'resource_view' ? 'view_count' : 'download_count';
        await pool.execute(
          `UPDATE resources SET ${countField} = GREATEST(${countField} - 1, 0) WHERE id = ?`,
          [eventData.resourceId]
        );
      }
    }
  }

  const [result] = await pool.execute(`DELETE FROM \`${tableName}\` WHERE \`${primaryKey.Field}\` = ?`, [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      message: 'Record not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Record deleted successfully'
  });
}));

// @desc    Insert table record
// @route   POST /api/analytics/tables/:tableName
// @access  Private (admin only)
router.post('/tables/:tableName', protect, authorize('admin'), [
  param('tableName').trim().isLength({ min: 1, max: 64 }).matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/).withMessage('Invalid table name'),
  body().isObject().withMessage('Request body must be an object')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { tableName } = req.params;
  const insertData = req.body;
  const pool = getPool();

  // Build insert query
  const columns = Object.keys(insertData);
  const placeholders = columns.map(() => '?').join(', ');
  const values = Object.values(insertData);

  const [result] = await pool.execute(
    `INSERT INTO \`${tableName}\` (${columns.join(', ')}) VALUES (${placeholders})`,
    values
  );

  res.status(201).json({
    success: true,
    message: 'Record inserted successfully',
    data: {
      id: result.insertId
    }
  });
}));

module.exports = router;
