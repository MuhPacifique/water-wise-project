const mysql = require('mysql2/promise');
require('dotenv').config();

async function addThumbnailColumn() {
  let connection;

  try {
    console.log('🔄 Adding thumbnail_url column to resources table...');

    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'water_wise_db'
    };

    connection = await mysql.createConnection(dbConfig);
    console.log('📊 Connected to database');

    // Add thumbnail_url column to resources table
    await connection.execute(`
      ALTER TABLE resources
      ADD COLUMN thumbnail_url VARCHAR(1000) AFTER file_url
    `);

    console.log('✅ Successfully added thumbnail_url column to resources table');

  } catch (error) {
    console.error('❌ Migration failed:', error);
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
  addThumbnailColumn();
}

module.exports = { addThumbnailColumn };
