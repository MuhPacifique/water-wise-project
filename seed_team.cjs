const { getPool } = require('./backend/config/database');
require('dotenv').config({ path: './backend/.env' });

async function seedCorrectTeam() {
  try {
    const pool = getPool();
    
    // Clear existing sample members
    await pool.execute('DELETE FROM team_members');
    console.log('Cleared existing team members.');

    const team = [
      { 
        name: 'Aimable Hakizimana', 
        country: 'Rwanda', 
        role: 'Project Lead & Lead Developer',
        image_url: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=300',
        display_order: 1
      },
      { 
        name: 'Protogene HARAMBINEZA', 
        country: 'Rwanda', 
        role: 'Project Founder',
        image_url: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&q=80&w=300',
        display_order: 2
      },
      { 
        name: 'Glory Honoratus RUGEMALILA', 
        country: 'Tanzania', 
        role: 'Conservation Specialist',
        image_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=300',
        display_order: 3
      },
      { 
        name: 'Yohana MWAKATOBE', 
        country: 'Tanzania', 
        role: 'Community Outreach',
        image_url: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&q=80&w=300',
        display_order: 4
      },
      { 
        name: 'Tariro CHIDEWU', 
        country: 'Zimbabwe', 
        role: 'Environmental Engineer',
        image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
        display_order: 5
      },
      { 
        name: 'Louis Second MUGISHA', 
        country: 'Burundi', 
        role: 'Education Coordinator',
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
        display_order: 6
      }
    ];

    for (const member of team) {
      await pool.execute(
        'INSERT INTO team_members (name, country, role, image_url, display_order) VALUES (?, ?, ?, ?, ?)',
        [member.name, member.country, member.role, member.image_url, member.display_order]
      );
      console.log(`Added ${member.name}`);
    }

    console.log('✅ Correct team seeded successfully!');
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}

seedCorrectTeam();
