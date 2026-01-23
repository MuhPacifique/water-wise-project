const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('Tables in database:');
    console.log(rows.map(row => Object.values(row)[0]));
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
