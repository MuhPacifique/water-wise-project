
const http = require('http');

async function testUserRegistration() {
  const userData = JSON.stringify({
    name: "New User",
    email: "newuser" + Date.now() + "@example.com",
    password: "password123",
    country: "Kenya"
  });

  const options = {
    hostname: '127.0.0.1',
    port: 5001,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': userData.length
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    console.log('Status Code:', res.statusCode);

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        console.log('Body:', JSON.parse(data));
      } catch (e) {
        console.log('Body:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.write(userData);
  req.end();
}

testUserRegistration();
