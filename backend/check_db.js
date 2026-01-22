const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'backend/.env' });

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'water_wise_db'
    });
    
    console.log('Connected to database');

    try {
      console.log('--- water_campaigns ---');
      const [cRows] = await connection.execute('DESCRIBE water_campaigns');
      console.table(cRows);
    } catch (err) {
      console.error('water_campaigns table not found or error:', err.message);
    }

    try {
      console.log('--- campaign_registrations ---');
      const [rRows] = await connection.execute('DESCRIBE campaign_registrations');
      console.table(rRows);
    } catch (err) {
      console.error('campaign_registrations table not found or error:', err.message);
    }

    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
