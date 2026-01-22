const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testResources() {
  try {
    const response = await fetch('http://localhost:5001/api/resources');
    const data = await response.json();
    console.log('Resources response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error testing resources endpoint:', err);
  }
}

testResources();
