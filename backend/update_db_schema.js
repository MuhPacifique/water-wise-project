const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { initializeDatabase, getPool } = require('./config/database');

async function update() {
  try {
    await initializeDatabase();
    const pool = getPool();
    await pool.execute('ALTER TABLE campaign_registrations MODIFY COLUMN phone VARCHAR(50)');
    console.log('✅ Updated phone column length to 50');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}
update();
