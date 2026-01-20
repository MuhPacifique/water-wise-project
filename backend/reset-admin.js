const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetAdmin() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'water_wise_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const saltRounds = 12;
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('Generated hash:', hashedPassword);

    // Check if user exists
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', ['admin@waterwise.org']);

    if (users.length === 0) {
      console.log('Creating admin user...');
      await pool.execute(
        'INSERT INTO users (name, email, password, role, is_active, email_verified) VALUES (?, ?, ?, ?, ?, ?)',
        ['Water-Wise Admin', 'admin@waterwise.org', hashedPassword, 'admin', true, true]
      );
    } else {
      console.log('Updating admin password...');
      await pool.execute(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, 'admin@waterwise.org']
      );
    }

    console.log('✅ Admin password reset to: admin123');
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

resetAdmin();
