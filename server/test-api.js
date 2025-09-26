const { default: fetch } = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing TAT API...');
    const response = await fetch('http://localhost:3001/api/tat/topic');
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI();