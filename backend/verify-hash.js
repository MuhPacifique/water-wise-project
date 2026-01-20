const bcrypt = require('bcryptjs');

async function verifyHash() {
  const password = 'admin123';
  const hash = '$2a$12$JFJXh35ytfuIbLG4LXpyIuEax2vFt08/rbLCRi/lcZaga4PdA0U6W';

  const isValid = await bcrypt.compare(password, hash);
  console.log('Password admin123 matches hash:', isValid);
}

verifyHash();
