const http = require('http');

async function testRegistration() {
  const campaignId = 1; 
  const registrationData = JSON.stringify({
    name: "Test User",
    email: "test" + Date.now() + "@example.com",
    role: "Conservation",
    phone: "123456789012345678901", // 21 chars
    experience: "Some experience"
  });

  const options = {
    hostname: 'localhost',
    port: 5001,
    path: `/api/community/campaigns/${campaignId}/register`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': registrationData.length
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

  req.write(registrationData);
  req.end();
}

testRegistration();
