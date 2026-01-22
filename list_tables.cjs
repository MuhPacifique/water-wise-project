
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
    
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('Tables:', rows.map(r => Object.values(r)[0]));
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
