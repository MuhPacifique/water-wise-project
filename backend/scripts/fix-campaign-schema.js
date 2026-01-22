
const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'backend/.env' });

async function fixSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'water_wise_db'
  });

  try {
    console.log('Checking water_campaigns table schema...');
    const [columns] = await connection.execute('SHOW COLUMNS FROM water_campaigns');
    const hasCampaignType = columns.some(col => col.Field === 'campaign_type');

    if (!hasCampaignType) {
      console.log('Adding campaign_type column to water_campaigns table...');
      await connection.execute("ALTER TABLE water_campaigns ADD COLUMN campaign_type ENUM('Tree Planting', 'Plastic Collection', 'Agroforestry', 'Awareness', 'Other') DEFAULT 'Awareness' AFTER status");
      console.log('Column added successfully.');
    } else {
      console.log('campaign_type column already exists.');
    }

    // Also check for other potential issues mentioned in the summary
    // "Mismatch between the updated database schema requirements and the existing data or mock logic"
    
  } catch (error) {
    console.error('Error fixing schema:', error);
  } finally {
    await connection.end();
  }
}

fixSchema();
