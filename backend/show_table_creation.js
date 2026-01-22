const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { initializeDatabase, getPool } = require('./config/database');

async function check() {
  try {
    await initializeDatabase();
    const pool = getPool();
    const [rows] = await pool.execute('SHOW CREATE TABLE users');
    console.log(rows[0]['Create Table']);
    const [rows3] = await pool.execute('SHOW CREATE TABLE activities');
    console.log(rows3[0]['Create Table']);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}
check();
