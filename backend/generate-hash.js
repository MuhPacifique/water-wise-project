const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123';
  const saltRounds = 12;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Password hash for admin123:', hash);
  return hash;
}

generateHash().then(hash => {
  console.log('Generated hash:', hash);
}).catch(err => {
  console.error('Error:', err);
});
