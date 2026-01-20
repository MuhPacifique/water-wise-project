const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function checkSchema() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'water_wise_db'
    });

    console.log('Table: resources');
    const [columns] = await connection.execute('DESCRIBE resources');
    console.table(columns);

    await connection.end();
  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkSchema();
