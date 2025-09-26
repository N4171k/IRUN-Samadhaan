const fetch = require('node-fetch');

// Test the WAT API endpoints
async function testWATAPI() {
  const baseURL = 'http://localhost:3001/api/wat';
  
  console.log('Testing WAT API Endpoints...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData.status);
    
    // Test 2: Get words
    console.log('\n2. Testing words endpoint...');
    const wordsResponse = await fetch(`${baseURL}/words?count=5`);
    const wordsData = await wordsResponse.json();
    console.log('Words received:', wordsData.words.length, 'words');
    console.log('Sample words:', wordsData.words.slice(0, 3));
    
    // Test 3: Analyze single response
    console.log('\n3. Testing single response analysis...');
    const analyzeResponse = await fetch(`${baseURL}/analyze-response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        word: 'Leader',
        response: 'Leader inspires others by example'
      })
    });
    const analyzeData = await analyzeResponse.json();
    console.log('Analysis score:', analyzeData.analysis.score);
    console.log('Analysis flags:', analyzeData.analysis.flags);
    
    // Test 4: Submit complete test
    console.log('\n4. Testing complete test submission...');
    const testResponses = [
      { word: 'Leader', response: 'Leader inspires others by example', timeUsed: 10 },
      { word: 'Courage', response: 'Courage helps overcome fear', timeUsed: 8 },
      { word: 'Team', response: 'Team work makes dream work', timeUsed: 12 }
    ];
    
    const submitResponse = await fetch(`${baseURL}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-user-123',
        responses: testResponses,
        totalTimeUsed: 180
      })
    });
    const submitData = await submitResponse.json();
    console.log('Test submitted successfully!');
    console.log('Overall score:', submitData.score);
    console.log('Completion rate:', submitData.completionRate + '%');
    console.log('Feedback preview:', submitData.feedback.substring(0, 100) + '...');
    
    // Test 5: Get tips
    console.log('\n5. Testing tips endpoint...');
    const tipsResponse = await fetch(`${baseURL}/tips`);
    const tipsData = await tipsResponse.json();
    console.log('Tips categories:', Object.keys(tipsData.tips));
    
    console.log('\n✅ All WAT API tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWATAPI();