const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

const addInitiativesTable = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'water_wise_db'
  });

  console.log('Connected to database');

  try {
    // Create initiatives table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS initiatives (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content LONGTEXT,
        icon VARCHAR(50),
        image_url VARCHAR(1000),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Initiatives table created successfully');

    // Seed initial initiatives
    const initiatives = [
      {
        title: 'Tree Planting',
        description: 'Planting trees for water resource conservation and ecosystem restoration.',
        content: '<h2>Tree Planting for Water Conservation</h2><p>Tree planting is one of the most effective ways to protect water resources. Trees help to prevent soil erosion, increase water infiltration, and maintain the natural water cycle.</p><p>Our initiative focuses on planting native tree species along riverbanks and in critical catchment areas to ensure long-term water security for communities.</p>',
        icon: '🌳',
        image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200'
      },
      {
        title: 'Plastic Collection',
        description: 'Collecting plastics from water bodies to prevent pollution and protect aquatic life.',
        content: '<h2>Plastic Collection Initiative</h2><p>Plastic pollution is a major threat to our water resources. It harms aquatic life, affects water quality, and can even enter the human food chain.</p><p>We organize community clean-up events to remove plastics and other waste from rivers, lakes, and beaches, promoting a cleaner and healthier environment.</p>',
        icon: '♻️',
        image_url: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&q=80&w=1200'
      },
      {
        title: 'Agroforestry',
        description: 'Enhancing agroforestry practices to improve soil water retention and rural livelihoods.',
        content: '<h2>Agroforestry for Sustainable Water Use</h2><p>Agroforestry combines agriculture and forestry technologies to create more diverse, productive, profitable, healthy, and sustainable land-use systems.</p><p>By integrating trees into agricultural landscapes, we can improve soil moisture retention, reduce runoff, and provide additional income sources for farmers while protecting water resources.</p>',
        icon: '🌾',
        image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200'
      }
    ];

    for (const initiative of initiatives) {
      const [rows] = await connection.query('SELECT id FROM initiatives WHERE title = ?', [initiative.title]);
      if (rows.length === 0) {
        await connection.query(
          'INSERT INTO initiatives (title, description, content, icon, image_url) VALUES (?, ?, ?, ?, ?)',
          [initiative.title, initiative.description, initiative.content, initiative.icon, initiative.image_url]
        );
        console.log(`✅ Seeded initiative: ${initiative.title}`);
      } else {
        console.log(`ℹ️ Initiative already exists: ${initiative.title}`);
      }
    }

  } catch (error) {
    console.error('❌ Error creating initiatives table:', error);
  } finally {
    await connection.end();
  }
};

addInitiativesTable();
