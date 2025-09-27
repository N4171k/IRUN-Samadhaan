// Test script to send welcome back newsletter
const { sendWelcomeBackNewsletter } = require('./services/welcomeNewsletter');

async function testWelcomeBackNewsletter() {
  console.log('📧 Testing welcome back newsletter...');
  
  try {
    const user = {
      name: 'Returning User',
      email: 'utakarsh.agent001013@gmail.com' // Using the specified email
    };
    
    const success = await sendWelcomeBackNewsletter(user);
    if (success) {
      console.log('✅ Welcome back newsletter sent successfully');
    } else {
      console.log('❌ Failed to send welcome back newsletter');
    }
  } catch (error) {
    console.error('❌ Error sending welcome back newsletter:', error);
  }
}

// Run the test
testWelcomeBackNewsletter();