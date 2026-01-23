const { initializeDatabase, getPool } = require('./config/database');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

(async () => {
  try {
    await initializeDatabase();
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM initiatives');
    console.table(rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
})();
