
const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'backend/.env' });

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'water_wise_db'
    });
    
    const [rows] = await connection.execute('SHOW TABLES');
    const tables = rows.map(r => Object.values(r)[0]);
    console.log('Existing tables:', tables);
    
    const expectedTables = [
      'users', 'user_profiles', 'resources', 'resource_translations', 
      'chat_messages', 'chat_rooms', 'room_members', 'activities', 
      'analytics', 'water_data', 'professional_trainings', 'tutorials', 
      'tutorial_steps', 'settings', 'community_testimonies', 'water_campaigns',
      'campaign_registrations'
    ];
    
    const missing = expectedTables.filter(t => !tables.includes(t));
    if (missing.length > 0) {
      console.log('Missing tables:', missing);
    } else {
      console.log('All expected tables exist.');
    }
    
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
