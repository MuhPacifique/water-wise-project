const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { catchAsync } = require('../middleware/errorHandler');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { getPool } = require('../config/database');

const router = express.Router();

// @desc    Get chat rooms
// @route   GET /api/chat/rooms
// @access  Public (authenticated users only)
router.get('/rooms', protect, [
  query('type').optional().isIn(['public', 'private', 'group']).withMessage('Invalid room type'),
  query('active').optional().isBoolean().withMessage('Active must be a boolean')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { type, active = true } = req.query;
  const pool = getPool();

  // Build WHERE clause
  const whereConditions = ['cr.is_active = ?'];
  const whereValues = [active];

  if (type) {
    whereConditions.push('cr.type = ?');
    whereValues.push(type);
  }

  // Get rooms user has access to
  const whereClause = whereConditions.join(' AND ');
  const [rooms] = await pool.execute(`
    SELECT cr.id, cr.name, cr.description, cr.type, cr.member_count,
           cr.last_message_at, cr.created_at,
           u.name as created_by_name,
           rm.role as user_role,
           rm.joined_at,
           (SELECT message FROM chat_messages WHERE room = cr.name ORDER BY created_at DESC LIMIT 1) as last_message,
           (SELECT COUNT(*) FROM chat_messages WHERE room = cr.name AND created_at > rm.last_seen) as unread_count
    FROM chat_rooms cr
    LEFT JOIN users u ON cr.created_by = u.id
    LEFT JOIN room_members rm ON cr.id = rm.room_id AND rm.user_id = ?
    WHERE ${whereClause} AND (cr.type = 'public' OR rm.user_id IS NOT NULL)
    ORDER BY cr.last_message_at DESC, cr.created_at DESC
  `, [req.user.id, ...whereValues]);

  res.status(200).json({
    success: true,
    data: {
      rooms
    }
  });
}));

// @desc    Get single chat room
// @route   GET /api/chat/rooms/:id
// @access  Private
router.get('/rooms/:id', protect, [
  param('id').isInt({ min: 1 }).withMessage('Room ID must be a positive integer')
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

  // Check if user has access to room
  const [rooms] = await pool.execute(`
    SELECT cr.*, u.name as created_by_name,
           rm.role as user_role, rm.joined_at
    FROM chat_rooms cr
    LEFT JOIN users u ON cr.created_by = u.id
    LEFT JOIN room_members rm ON cr.id = rm.room_id AND rm.user_id = ?
    WHERE cr.id = ? AND cr.is_active = ?
    AND (cr.type = 'public' OR rm.user_id IS NOT NULL)
  `, [req.user.id, id, true]);

  if (rooms.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Chat room not found or access denied'
    });
  }

  const room = rooms[0];

  // Get room members
  const [members] = await pool.execute(`
    SELECT u.id, u.name, u.avatar, rm.role, rm.joined_at, rm.last_seen
    FROM room_members rm
    JOIN users u ON rm.user_id = u.id
    WHERE rm.room_id = ? AND rm.is_active = ?
    ORDER BY rm.joined_at ASC
  `, [id, true]);

  res.status(200).json({
    success: true,
    data: {
      room,
      members
    }
  });
}));

// @desc    Get chat messages
// @route   GET /api/chat/messages/:roomName
// @access  Private
router.get('/messages/:roomName', protect, [
  param('roomName').trim().isLength({ min: 1, max: 100 }).withMessage('Room name must be between 1 and 100 characters'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('before').optional().isISO8601().withMessage('Before must be a valid date')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { roomName } = req.params;
  const { page = 1, limit = 50, before } = req.query;
  const pool = getPool();

  // Check if user has access to room
  const [rooms] = await pool.execute(`
    SELECT cr.id FROM chat_rooms cr
    LEFT JOIN room_members rm ON cr.id = rm.room_id AND rm.user_id = ?
    WHERE cr.name = ? AND cr.is_active = ?
    AND (cr.type = 'public' OR rm.user_id IS NOT NULL)
  `, [req.user.id, roomName, true]);

  if (rooms.length === 0) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this chat room'
    });
  }

  const offset = (page - 1) * limit;

  // Build WHERE clause
  const whereConditions = ['cm.room = ?'];
  const whereValues = [roomName];

  if (before) {
    whereConditions.push('cm.created_at < ?');
    whereValues.push(new Date(before));
  }

  const whereClause = whereConditions.join(' AND ');

  // Get messages with user info
  const [messages] = await pool.execute(`
    SELECT cm.id, cm.message, cm.message_type, cm.attachment_url,
           cm.attachment_name, cm.attachment_size, cm.is_edited,
           cm.edited_at, cm.reply_to, cm.reactions, cm.created_at,
           u.id as user_id, u.name as user_name, u.avatar as user_avatar,
           ru.name as reply_user_name,
           (SELECT message FROM chat_messages WHERE id = cm.reply_to) as reply_message
    FROM chat_messages cm
    JOIN users u ON cm.user_id = u.id
    LEFT JOIN chat_messages rcm ON cm.reply_to = rcm.id
    LEFT JOIN users ru ON rcm.user_id = ru.id
    WHERE ${whereClause}
    ORDER BY cm.created_at DESC
    LIMIT ? OFFSET ?
  `, [...whereValues, parseInt(limit), offset]);

  // Reverse to show oldest first
  messages.reverse();

  // Get total count
  const [countResult] = await pool.execute(
    `SELECT COUNT(*) as total FROM chat_messages cm WHERE ${whereClause}`,
    whereValues
  );

  const total = countResult[0].total;
  const totalPages = Math.ceil(total / limit);

  // Update user's last seen time for this room
  await pool.execute(
    'UPDATE room_members SET last_seen = NOW() WHERE room_id = ? AND user_id = ?',
    [rooms[0].id, req.user.id]
  );

  res.status(200).json({
    success: true,
    data: {
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    }
  });
}));

// @desc    Send chat message
// @route   POST /api/chat/messages
// @access  Private
router.post('/messages', protect, [
  body('room').trim().isLength({ min: 1, max: 100 }).withMessage('Room name must be between 1 and 100 characters'),
  body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters'),
  body('messageType').optional().isIn(['text', 'image', 'file', 'system']).withMessage('Invalid message type'),
  body('replyTo').optional().isInt({ min: 1 }).withMessage('Reply to must be a valid message ID')
], catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { room, message, messageType = 'text', replyTo } = req.body;
  const pool = getPool();

  // Check if user has access to room
  const [rooms] = await pool.execute(`
    SELECT cr.id FROM chat_rooms cr
    LEFT JOIN room_members rm ON cr.id = rm.room_id AND rm.user_id = ?
    WHERE cr.name = ? AND cr.is_active = ?
    AND (cr.type = 'public' OR rm.user_id IS NOT NULL)
  `, [req.user.id, room, true]);

  if (rooms.length === 0) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this chat room'
    });
  }

  // Validate reply_to if provided
  if (replyTo) {
    const [replyMessages] = await pool.execute(
      'SELECT id FROM chat_messages WHERE id = ? AND room = ?',
      [replyTo, room]
    );
    if (replyMessages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply message not found in this room'
      });
    }
  }

  // Insert message
  const [result] = await pool.execute(
    `INSERT INTO chat_messages (user_id, room, message, message_type, reply_to)
     VALUES (?, ?, ?, ?, ?)`,
    [req.user.id, room, message, messageType, replyTo || null]
  );

  const messageId = result.insertId;

  // Update room's last message time
  await pool.execute(
    'UPDATE chat_rooms SET last_message_at = NOW() WHERE name = ?',
    [room]
  );

  // Get created message with user info
  const [messages] = await pool.execute(`
    SELECT cm.id, cm.message, cm.message_type, cm.reply_to,
           cm.reactions, cm.created_at,
           u.id as user_id, u.name as user_name, u.avatar as user_avatar
    FROM chat_messages cm
    JOIN users u ON cm.user_id = u.id
    WHERE cm.id = ?
  `, [messageId]);

  // Log activity
  await pool.execute(
    'INSERT INTO activities (user_id, activity_type, description, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, 'chat_message_sent', `Sent message in ${room}`, JSON.stringify({ messageId, room }), req.ip, req.get('User-Agent')]
  );

  res.status(201).json({
    success: true,
    data: {
      message: messages[0]
    }
  });
}));

// @desc    Update chat message
// @route   PUT /api/chat/messages/:id
// @access  Private (message owner only)
router.put('/messages/:id', protect, [
  param('id').isInt({ min: 1 }).withMessage('Message ID must be a positive integer'),
  body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters')
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
  const { message } = req.body;
  const pool = getPool();

  // Check if message exists and user owns it
  const [messages] = await pool.execute(
    'SELECT * FROM chat_messages WHERE id = ?',
    [id]
  );

  if (messages.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  const chatMessage = messages[0];

  if (chatMessage.user_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to edit this message'
    });
  }

  // Update message
  await pool.execute(
    'UPDATE chat_messages SET message = ?, is_edited = ?, edited_at = NOW() WHERE id = ?',
    [message, true, id]
  );

  // Get updated message
  const [updatedMessages] = await pool.execute(
    'SELECT * FROM chat_messages WHERE id = ?',
    [id]
  );

  res.status(200).json({
    success: true,
    data: {
      message: updatedMessages[0]
    }
  });
}));

// @desc    Delete chat message
// @route   DELETE /api/chat/messages/:id
// @access  Private (message owner or moderator)
router.delete('/messages/:id', protect, [
  param('id').isInt({ min: 1 }).withMessage('Message ID must be a positive integer')
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

  // Check if message exists
  const [messages] = await pool.execute(
    'SELECT cm.*, cr.created_by as room_creator FROM chat_messages cm JOIN chat_rooms cr ON cm.room = cr.name WHERE cm.id = ?',
    [id]
  );

  if (messages.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  const chatMessage = messages[0];

  // Check permissions (owner, room creator, or admin)
  const hasPermission = chatMessage.user_id === req.user.id ||
                       chatMessage.room_creator === req.user.id ||
                       req.user.role === 'admin';

  if (!hasPermission) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this message'
    });
  }

  // Delete message
  await pool.execute('DELETE FROM chat_messages WHERE id = ?', [id]);

  // Log activity
  await pool.execute(
    'INSERT INTO activities (user_id, activity_type, description, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, 'chat_message_deleted', `Deleted message in ${chatMessage.room}`, JSON.stringify({ messageId: id, room: chatMessage.room }), req.ip, req.get('User-Agent')]
  );

  res.status(200).json({
    success: true,
    message: 'Message deleted successfully'
  });
}));

// @desc    Add reaction to message
// @route   POST /api/chat/messages/:id/reactions
// @access  Private
router.post('/messages/:id/reactions', protect, [
  param('id').isInt({ min: 1 }).withMessage('Message ID must be a positive integer'),
  body('emoji').trim().isLength({ min: 1, max: 10 }).withMessage('Emoji must be between 1 and 10 characters')
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
  const { emoji } = req.body;
  const pool = getPool();

  // Get current reactions
  const [messages] = await pool.execute(
    'SELECT reactions FROM chat_messages WHERE id = ?',
    [id]
  );

  if (messages.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  let reactions = messages[0].reactions ? JSON.parse(messages[0].reactions) : {};

  // Add or increment reaction
  if (!reactions[emoji]) {
    reactions[emoji] = [];
  }

  const userIndex = reactions[emoji].indexOf(req.user.id);
  if (userIndex === -1) {
    reactions[emoji].push(req.user.id);
  } else {
    // Remove reaction if already exists
    reactions[emoji].splice(userIndex, 1);
    if (reactions[emoji].length === 0) {
      delete reactions[emoji];
    }
  }

  // Update message
  await pool.execute(
    'UPDATE chat_messages SET reactions = ? WHERE id = ?',
    [JSON.stringify(reactions), id]
  );

  res.status(200).json({
    success: true,
    data: {
      reactions
    }
  });
}));

// @desc    Join chat room
// @route   POST /api/chat/rooms/:id/join
// @access  Private
router.post('/rooms/:id/join', protect, [
  param('id').isInt({ min: 1 }).withMessage('Room ID must be a positive integer')
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

  // Check if room exists and is accessible
  const [rooms] = await pool.execute(
    'SELECT * FROM chat_rooms WHERE id = ? AND is_active = ?',
    [id, true]
  );

  if (rooms.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Chat room not found'
    });
  }

  const room = rooms[0];

  // Check if user is already a member
  const [existingMembers] = await pool.execute(
    'SELECT * FROM room_members WHERE room_id = ? AND user_id = ?',
    [id, req.user.id]
  );

  if (existingMembers.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Already a member of this room'
    });
  }

  // Add user to room
  await pool.execute(
    'INSERT INTO room_members (room_id, user_id, role) VALUES (?, ?, ?)',
    [id, req.user.id, 'member']
  );

  // Update member count
  await pool.execute(
    'UPDATE chat_rooms SET member_count = member_count + 1 WHERE id = ?',
    [id]
  );

  // Log activity
  await pool.execute(
    'INSERT INTO activities (user_id, activity_type, description, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, 'chat_room_joined', `Joined chat room: ${room.name}`, JSON.stringify({ roomId: id, roomName: room.name }), req.ip, req.get('User-Agent')]
  );

  res.status(200).json({
    success: true,
    message: 'Successfully joined chat room'
  });
}));

// @desc    Leave chat room
// @route   POST /api/chat/rooms/:id/leave
// @access  Private
router.post('/rooms/:id/leave', protect, [
  param('id').isInt({ min: 1 }).withMessage('Room ID must be a positive integer')
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

  // Check if user is a member
  const [members] = await pool.execute(
    'SELECT * FROM room_members WHERE room_id = ? AND user_id = ? AND is_active = ?',
    [id, req.user.id, true]
  );

  if (members.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Not a member of this room'
    });
  }

  // Remove user from room
  await pool.execute(
    'UPDATE room_members SET is_active = ? WHERE room_id = ? AND user_id = ?',
    [false, id, req.user.id]
  );

  // Update member count
  await pool.execute(
    'UPDATE chat_rooms SET member_count = member_count - 1 WHERE id = ?',
    [id]
  );

  // Log activity
  await pool.execute(
    'INSERT INTO activities (user_id, activity_type, description, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, 'chat_room_left', `Left chat room`, JSON.stringify({ roomId: id }), req.ip, req.get('User-Agent')]
  );

  res.status(200).json({
    success: true,
    message: 'Successfully left chat room'
  });
}));

module.exports = router;
