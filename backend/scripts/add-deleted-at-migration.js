const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function migrate() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'water_wise_db'
    });

    console.log('Adding deleted_at column to resources table...');
    await connection.execute('ALTER TABLE resources ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL');
    
    console.log('Adding index to deleted_at...');
    await connection.execute('CREATE INDEX idx_deleted_at ON resources(deleted_at)');

    console.log('✅ Migration completed successfully');
  } catch (error) {
    if (error.code === 'ER_DUP_COLUMN_NAME') {
      console.log('ℹ️ Column deleted_at already exists');
    } else {
      console.error('❌ Migration failed:', error);
    }
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
