const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function seedContent() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'water_wise_db'
    });

    const siteContent = {
      hero_title: 'Protecting water resources',
      site_name: 'Water-Wise Project',
      hero_subtitle: 'Save the Water',
      site_description: 'Empowering communities across East Africa to protect, conserve, and sustain our most precious natural resource through education and action.'
    };

    await connection.execute(
      'INSERT IGNORE INTO settings (setting_key, setting_value, setting_type, is_public) VALUES (?, ?, ?, ?)',
      ['site_content', JSON.stringify(siteContent), 'system', 1]
    );

    console.log('✅ Site content seeded successfully');
    await connection.end();
  } catch (error) {
    console.error('Error seeding content:', error);
  }
}

seedContent();
