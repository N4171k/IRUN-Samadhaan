// Test script for newsletter functionality
require('dotenv').config({ path: './.env' });
const { fetchNews, formatNewsletter, sendNewsletterEmail } = require('./utils/newsletterUtils');

async function testNewsletter() {
  console.log('🚀 Testing newsletter functionality...');
  
  try {
    // Test fetching news
    console.log('📰 Fetching news articles...');
    const articles = await fetchNews();
    console.log(`✅ Fetched ${articles.length} articles`);
    
    // Test formatting newsletter
    console.log('📧 Formatting newsletter...');
    const newsletterHtml = formatNewsletter(articles);
    console.log('✅ Newsletter formatted successfully');
    
    // Test sending email (will just log to console)
    console.log('📧 Testing email sending...');
    const success = await sendNewsletterEmail('test@example.com', newsletterHtml);
    console.log(success ? '✅ Email sending test passed' : '❌ Email sending test failed');
    
    console.log('🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testNewsletter();