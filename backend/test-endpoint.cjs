const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testEndpoint() {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    console.log('Health check response:', JSON.stringify(data, null, 2));

    const response2 = await fetch('http://localhost:5000/api/community/testimonies');
    const data2 = await response2.json();
    console.log('Community testimonies response:', JSON.stringify(data2, null, 2));

    const response3 = await fetch('http://localhost:5000/api/auth/me'); // Just to see if it 404s or 401s
    const data3 = await response3.json();
    console.log('Auth me response:', JSON.stringify(data3, null, 2));

    const response4 = await fetch('http://localhost:5000/api/test-direct');
    const data4 = await response4.json();
    console.log('Test direct response:', JSON.stringify(data4, null, 2));
  } catch (err) {
    console.error('Error testing endpoints:', err);
  }
}

testEndpoint();
