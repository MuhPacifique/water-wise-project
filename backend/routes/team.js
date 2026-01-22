const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/auth');
const { getPool } = require('../config/database');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'team-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all team members (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM team_members ORDER BY display_order ASC, created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch team members' });
  }
});

// Get active team members (public)
router.get('/public', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, name, country, role, image_url, bio FROM team_members WHERE is_active = true ORDER BY display_order ASC, created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching public team members:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch team members' });
  }
});

// Add new team member
router.post('/', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    const { name, country, role, bio, display_order, social_links } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;
    const pool = getPool();

    const [result] = await pool.execute(
      'INSERT INTO team_members (name, country, role, image_url, bio, social_links, display_order, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, country, role || null, image_url || null, bio || null, social_links || null, display_order || 0, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Team member added successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ success: false, message: 'Failed to add team member' });
  }
});

// Update team member
router.put('/:id', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, country, role, bio, display_order, is_active, social_links } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;
    const pool = getPool();

    const [result] = await pool.execute(
      'UPDATE team_members SET name = ?, country = ?, role = ?, image_url = ?, bio = ?, social_links = ?, display_order = ?, is_active = ? WHERE id = ?',
      [name, country, role || null, image_url || null, bio || null, social_links || null, display_order || 0, is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    res.json({ success: true, message: 'Team member updated successfully' });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ success: false, message: 'Failed to update team member' });
  }
});

// Delete team member
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [result] = await pool.execute(
      'DELETE FROM team_members WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    res.json({ success: true, message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ success: false, message: 'Failed to delete team member' });
  }
});

// Update display order
router.put('/:id/order', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { display_order } = req.body;
    const pool = getPool();

    await pool.execute(
      'UPDATE team_members SET display_order = ? WHERE id = ?',
      [display_order, id]
    );

    res.json({ success: true, message: 'Display order updated successfully' });
  } catch (error) {
    console.error('Error updating display order:', error);
    res.status(500).json({ success: false, message: 'Failed to update display order' });
  }
});

module.exports = router;
