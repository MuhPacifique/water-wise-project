const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { initializeDatabase, getPool } = require('../config/database');

async function migrate() {
  try {
    await initializeDatabase();
    const pool = getPool();

    console.log('Creating volunteer_applications table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS volunteer_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        interest VARCHAR(255),
        message TEXT,
        status ENUM('Pending', 'Reviewed', 'Contacted') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    console.log('Creating donations table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS donations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        donor_name VARCHAR(255),
        donor_email VARCHAR(255),
        status ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Completed',
        payment_method VARCHAR(50) DEFAULT 'Credit Card',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    console.log('✅ Migration completed successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
