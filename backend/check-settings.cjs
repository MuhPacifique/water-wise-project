const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function checkSettings() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'water_wise_db'
    });

    console.log('Table: settings');
    const [columns] = await connection.execute('DESCRIBE settings');
    console.table(columns);

    const [rows] = await connection.execute('SELECT * FROM settings');
    console.log('Current Settings:');
    console.table(rows);

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSettings();
