const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const migrationSQL = `
-- Water-Wise Database Schema Migration
-- This script creates all necessary tables for the Water-Wise platform

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'moderator', 'admin') DEFAULT 'user',
  avatar VARCHAR(500),
  bio TEXT,
  location VARCHAR(255),
  country VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_active (is_active)
);

-- User profiles table (extended information)
CREATE TABLE IF NOT EXISTS user_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  organization VARCHAR(255),
  expertise TEXT,
  interests TEXT,
  social_links JSON,
  preferences JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_profile (user_id)
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  type ENUM('document', 'video', 'link', 'image') NOT NULL,
  file_path VARCHAR(1000),
  file_url VARCHAR(1000),
  file_size BIGINT,
  mime_type VARCHAR(100),
  category VARCHAR(100),
  tags JSON,
  language VARCHAR(10) DEFAULT 'en',
  is_public BOOLEAN DEFAULT TRUE,
  uploaded_by INT NOT NULL,
  download_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_type (type),
  INDEX idx_category (category),
  INDEX idx_public (is_public),
  INDEX idx_featured (is_featured),
  INDEX idx_uploaded_by (uploaded_by),
  FULLTEXT idx_title_description (title, description)
);

-- Resource translations table
CREATE TABLE IF NOT EXISTS resource_translations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resource_id INT NOT NULL,
  language VARCHAR(10) NOT NULL,
  title VARCHAR(500),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  UNIQUE KEY unique_resource_lang (resource_id, language),
  INDEX idx_language (language)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  room VARCHAR(100) DEFAULT 'general',
  message TEXT NOT NULL,
  message_type ENUM('text', 'image', 'file', 'system') DEFAULT 'text',
  attachment_url VARCHAR(1000),
  attachment_name VARCHAR(255),
  attachment_size BIGINT,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at DATETIME,
  reply_to INT,
  reactions JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reply_to) REFERENCES chat_messages(id) ON DELETE SET NULL,
  INDEX idx_room (room),
  INDEX idx_user (user_id),
  INDEX idx_created (created_at),
  FULLTEXT idx_message (message)
);

-- Chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type ENUM('public', 'private', 'group') DEFAULT 'public',
  created_by INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  member_count INT DEFAULT 0,
  last_message_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_room_name (name),
  INDEX idx_type (type),
  INDEX idx_active (is_active)
);

-- Room members table
CREATE TABLE IF NOT EXISTS room_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('member', 'moderator', 'admin') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_room_user (room_id, user_id),
  INDEX idx_user (user_id),
  INDEX idx_active (is_active)
);

-- Activities table (for tracking user activities)
CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  activity_type VARCHAR(100) NOT NULL,
  description TEXT,
  metadata JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_type (activity_type),
  INDEX idx_created (created_at)
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  event_data JSON,
  user_id INT,
  session_id VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer VARCHAR(1000),
  page_url VARCHAR(1000),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_type (event_type),
  INDEX idx_user (user_id),
  INDEX idx_session (session_id),
  INDEX idx_created (created_at)
);

-- Water conservation data table
CREATE TABLE IF NOT EXISTS water_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  location VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  data_type ENUM('consumption', 'quality', 'conservation', 'education') NOT NULL,
  value DECIMAL(15,4),
  unit VARCHAR(50),
  measurement_date DATE NOT NULL,
  source VARCHAR(255),
  notes TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_location (location),
  INDEX idx_country (country),
  INDEX idx_data_type (data_type),
  INDEX idx_date (measurement_date),
  INDEX idx_verified (verified)
);

-- Projects table (water conservation projects)
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  country VARCHAR(100),
  start_date DATE,
  end_date DATE,
  status ENUM('planning', 'active', 'completed', 'cancelled') DEFAULT 'planning',
  budget DECIMAL(15,2),
  currency VARCHAR(10) DEFAULT 'USD',
  organization VARCHAR(255),
  coordinator_id INT,
  participants JSON,
  objectives TEXT,
  outcomes TEXT,
  images JSON,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (coordinator_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_country (country),
  INDEX idx_public (is_public),
  INDEX idx_coordinator (coordinator_id),
  FULLTEXT idx_title_description (title, description)
);

-- Project updates table
CREATE TABLE IF NOT EXISTS project_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  update_type ENUM('progress', 'milestone', 'issue', 'completion') DEFAULT 'progress',
  images JSON,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_project (project_id),
  INDEX idx_type (update_type),
  INDEX idx_created_by (created_by)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSON,
  is_read BOOLEAN DEFAULT FALSE,
  read_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_type (type),
  INDEX idx_read (is_read),
  INDEX idx_created (created_at)
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value JSON,
  updated_by INT,
  setting_type ENUM('system', 'user', 'organization') DEFAULT 'system',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_key (setting_key),
  INDEX idx_type (setting_type),
  INDEX idx_public (is_public)
);



-- Insert default settings
INSERT IGNORE INTO settings (setting_key, setting_value, setting_type, is_public) VALUES
('site_name', '"Water-Wise Project"', 'system', true),
('site_description', '"Empowering communities across East Africa to protect, conserve, and sustain our most precious natural resource through education and action."', 'system', true),
('default_language', '"en"', 'system', true),
('supported_languages', '["en", "sw", "fr", "pt"]', 'system', true),
('max_file_size', '10485760', 'system', false),
('allowed_file_types', '["pdf", "doc", "docx", "mp4", "mov", "avi", "jpg", "jpeg", "png", "gif"]', 'system', false),
('chat_enabled', 'true', 'system', true),
('registration_enabled', 'true', 'system', true);

-- Create default admin user (password: admin123 - change this in production!)
-- Password hash for 'admin123' using bcrypt with saltRounds 12
-- Hash will be generated dynamically below

-- Create default chat room
INSERT IGNORE INTO chat_rooms (name, description, type, created_by) VALUES
('general', 'General discussion about water conservation', 'public', 1),
('experts', 'Discussion for water experts and specialists', 'public', 1),
('projects', 'Discussion about ongoing water conservation projects', 'public', 1);

COMMIT;
`;

async function runMigration() {
  let connection;

  try {
    console.log('🔄 Starting database migration...');

    const dbName = process.env.DB_NAME || 'water_wise_db';
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    };

    // First connect without database to create it if needed
    connection = await mysql.createConnection(dbConfig);
    console.log('📊 Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`📁 Database '${dbName}' created or already exists`);

    // Close connection and reconnect to the specific database
    await connection.end();

    // Now connect to the specific database
    connection = await mysql.createConnection({
      ...dbConfig,
      database: dbName
    });

    console.log(`📊 Connected to database '${dbName}'`);

    // Split the migration SQL into individual statements and execute them one by one
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement + ';');
        } catch (error) {
          console.error('❌ Error executing statement:', statement.substring(0, 100) + '...');
          throw error;
        }
      }
    }

    // Generate hash for admin password
    const saltRounds = 12;
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Insert default admin user
    await connection.execute(
      'INSERT IGNORE INTO users (name, email, password, role, is_active, email_verified) VALUES (?, ?, ?, ?, ?, ?)',
      ['Water-Wise Admin', 'admin@waterwise.org', hashedPassword, 'admin', true, true]
    );

    // Insert sample resources
    const sampleResources = [
      {
        title: 'Water Conservation Training Manual',
        description: 'Comprehensive guide for community water conservation practices in East Africa',
        type: 'document',
        category: 'Training Materials',
        tags: JSON.stringify(['water conservation', 'training', 'community']),
        language: 'en',
        is_public: true,
        uploaded_by: 1,
        file_url: '/uploads/sample-manual.pdf',
        file_size: 2048576, // 2MB
        mime_type: 'application/pdf'
      },
      {
        title: 'Sustainable Water Management Video',
        description: 'Educational video demonstrating sustainable water management techniques',
        type: 'video',
        category: 'Educational Videos',
        tags: JSON.stringify(['sustainable', 'management', 'video']),
        language: 'en',
        is_public: true,
        uploaded_by: 1,
        file_url: '/uploads/sample-video.mp4',
        file_size: 52428800, // 50MB
        mime_type: 'video/mp4'
      },
      {
        title: 'Groundwater Protection Guidelines',
        description: 'Technical guidelines for protecting groundwater sources from contamination',
        type: 'document',
        category: 'Technical Guides',
        tags: JSON.stringify(['groundwater', 'protection', 'contamination']),
        language: 'en',
        is_public: true,
        uploaded_by: 1,
        file_url: '/uploads/groundwater-guide.pdf',
        file_size: 1536000, // 1.5MB
        mime_type: 'application/pdf'
      },
      {
        title: 'Community Water Testing Tutorial',
        description: 'Step-by-step tutorial for testing water quality in local communities',
        type: 'video',
        category: 'Tutorials',
        tags: JSON.stringify(['water testing', 'quality', 'tutorial']),
        language: 'en',
        is_public: true,
        uploaded_by: 1,
        file_url: '/uploads/water-testing-tutorial.mp4',
        file_size: 31457280, // 30MB
        mime_type: 'video/mp4'
      },
      {
        title: 'Rainwater Harvesting Systems',
        description: 'Guide to implementing effective rainwater harvesting systems',
        type: 'document',
        category: 'Implementation Guides',
        tags: JSON.stringify(['rainwater', 'harvesting', 'systems']),
        language: 'en',
        is_public: true,
        uploaded_by: 1,
        file_url: '/uploads/rainwater-guide.pdf',
        file_size: 1024000, // 1MB
        mime_type: 'application/pdf'
      }
    ];

    for (const resource of sampleResources) {
      await connection.execute(
        `INSERT IGNORE INTO resources (title, description, type, category, tags, language, is_public,
                                     uploaded_by, file_url, file_size, mime_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          resource.title,
          resource.description,
          resource.type,
          resource.category,
          resource.tags,
          resource.language,
          resource.is_public,
          resource.uploaded_by,
          resource.file_url,
          resource.file_size,
          resource.mime_type
        ]
      );
    }

    console.log('✅ Database migration completed successfully!');
    console.log('📋 Created tables:');
    console.log('  - users');
    console.log('  - user_profiles');
    console.log('  - resources');
    console.log('  - resource_translations');
    console.log('  - chat_messages');
    console.log('  - chat_rooms');
    console.log('  - room_members');
    console.log('  - activities');
    console.log('  - analytics');
    console.log('  - water_data');
    console.log('  - projects');
    console.log('  - project_updates');
    console.log('  - notifications');
    console.log('  - settings');
    console.log('🎯 Default admin user created: admin@waterwise.org / admin123');
    console.log('💬 Default chat rooms created');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
