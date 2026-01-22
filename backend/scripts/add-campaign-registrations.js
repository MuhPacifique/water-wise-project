
const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'backend/.env' });

const registrationMigrationSQL = `
CREATE TABLE IF NOT EXISTS campaign_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id INT NOT NULL,
  user_id INT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(100) NOT NULL,
  experience TEXT,
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES water_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_campaign (campaign_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status)
);
`;

async function runRegistrationMigration() {
  let connection;

  try {
    console.log('🔄 Starting campaign registrations table migration...');

    const dbName = process.env.DB_NAME || 'water_wise_db';
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName
    };

    connection = await mysql.createConnection(dbConfig);
    console.log(`📊 Connected to database '${dbName}'`);

    await connection.execute(registrationMigrationSQL);

    console.log('✅ Campaign registrations table migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runRegistrationMigration();
