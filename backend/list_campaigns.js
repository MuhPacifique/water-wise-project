const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { initializeDatabase, getPool } = require('./config/database');

async function check() {
  try {
    await initializeDatabase();
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM water_campaigns');
    console.log('Campaigns:', rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}
check();
