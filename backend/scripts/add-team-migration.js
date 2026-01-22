const mysql = require('mysql2/promise');
require('dotenv').config();

const createTableSQL = `
CREATE TABLE IF NOT EXISTS team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  role VARCHAR(100),
  image_url VARCHAR(1000),
  bio TEXT,
  social_links JSON,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_active (is_active),
  INDEX idx_order (display_order)
);
`;

const insertSamplesSQL = `
INSERT IGNORE INTO team_members (name, country, role, image_url, bio, display_order, is_active, created_by) VALUES
('Dr. Sarah Johnson', 'Kenya', 'Water Conservation Specialist', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face', 'Leading expert in sustainable water management with over 15 years of experience in East African communities.', 1, true, NULL),
('Prof. Michael Chen', 'Tanzania', 'Environmental Engineer', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', 'Professor specializing in water infrastructure and community-based conservation projects.', 2, true, NULL),
('Grace Njoroge', 'Kenya', 'Community Outreach Coordinator', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', 'Dedicated to empowering local communities with water conservation education and sustainable practices.', 3, true, NULL),
('Dr. Ahmed Hassan', 'Uganda', 'Hydrologist', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', 'Researcher focusing on groundwater protection and sustainable water resource management.', 4, true, NULL),
('Maria Rodriguez', 'Rwanda', 'Project Manager', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face', 'Experienced project manager coordinating international water conservation initiatives across East Africa.', 5, true, NULL),
('James Oduya', 'Kenya', 'Field Coordinator', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face', 'On-the-ground coordinator working directly with communities to implement water conservation solutions.', 6, true, NULL);
`;

async function runTeamMigration() {
  let connection;

  try {
    console.log('🔄 Starting team table migration...');

    const dbName = process.env.DB_NAME || 'water_wise_db';
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName
    };

    connection = await mysql.createConnection(dbConfig);
    console.log(`📊 Connected to database '${dbName}'`);

    // Execute the team migration SQL
    console.log('🏗️ Creating team_members table...');
    await connection.query(createTableSQL);
    
    console.log('👥 Adding sample team members...');
    await connection.query(insertSamplesSQL);

    console.log('✅ Team table migration completed successfully!');
    console.log('📋 Created table: team_members');
    console.log('👥 Added sample team members');

  } catch (error) {
    console.error('❌ Team migration failed:', error);
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
  runTeamMigration();
}

module.exports = { runTeamMigration };
