const { getPool } = require('./backend/config/database');
require('dotenv').config({ path: './backend/.env' });

async function run() {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM team_members');
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
run();
