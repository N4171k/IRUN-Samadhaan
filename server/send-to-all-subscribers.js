// Script to send newsletters to all subscribers regardless of their preferred time
require('dotenv').config({ path: './.env' });
const { sendNewsletterToAllSubscribers } = require('./services/newsletterScheduler');

async function sendToAllSubscribers() {
  console.log('🚀 Sending newsletters to all subscribers...');
  
  try {
    await sendNewsletterToAllSubscribers();
    console.log('✅ Newsletter sent to all subscribers!');
  } catch (error) {
    console.error('❌ Failed to send newsletter to all subscribers:', error);
  }
}

// Run the script
sendToAllSubscribers();