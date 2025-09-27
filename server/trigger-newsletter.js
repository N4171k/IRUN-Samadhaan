// Manual trigger script for newsletter sending
require('dotenv').config({ path: './.env' });
const { sendNewsletterToAllSubscribers } = require('./services/newsletterScheduler');

async function triggerNewsletter() {
  console.log('🚀 Manually triggering newsletters to all subscribers...');
  
  try {
    await sendNewsletterToAllSubscribers();
    console.log('✅ Manual newsletter trigger completed!');
  } catch (error) {
    console.error('❌ Manual newsletter trigger failed:', error);
  }
}

// Run the trigger
triggerNewsletter();