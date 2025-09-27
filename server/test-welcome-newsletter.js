// Test script to send welcome newsletter
const { sendWelcomeNewsletter } = require('./services/welcomeNewsletter');

async function testWelcomeNewsletter() {
  console.log('📧 Testing welcome newsletter...');
  
  try {
    const user = {
      name: 'Test User',
      email: 'utakarsh.agent001013@gmail.com' // Using the specified email
    };
    
    const success = await sendWelcomeNewsletter(user);
    if (success) {
      console.log('✅ Welcome newsletter sent successfully');
    } else {
      console.log('❌ Failed to send welcome newsletter');
    }
  } catch (error) {
    console.error('❌ Error sending welcome newsletter:', error);
  }
}

// Run the test
testWelcomeNewsletter();