const http = require('http');

async function testCreateCampaign() {
  const campaignData = JSON.stringify({
    title: "Test Campaign " + Date.now(),
    location: "Test Location",
    date: "2026-05-01",
    participants: 10,
    status: "Upcoming",
    campaign_type: "Tree Planting",
    image_url: "http://example.com/test.jpg"
  });

  // We need an admin token. I'll use a placeholder or try to login if I knew credentials.
  // Actually, I can check the database for the admin user.
  console.log('Testing campaign creation (requires auth)...');
  
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/community/campaigns',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': campaignData.length,
      // 'Authorization': 'Bearer ' + token // Need a real token
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    console.log('Status Code:', res.statusCode);
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('Body:', data);
    });
  });

  req.on('error', (error) => { console.error('Error:', error); });
  req.write(campaignData);
  req.end();
}

testCreateCampaign();
