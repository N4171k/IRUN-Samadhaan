// Manual trigger script for newsletter sending to specific test emails
require('dotenv').config({ path: './.env' });
const { fetchNews, formatNewsletter, sendNewsletterEmail } = require('./utils/newsletterUtils');

// Specific test emails for testing purposes only
const TEST_EMAILS = [
  'utakarsh.agent001013@gmail.com',
  'tiwarinaitik9@gmail.com',
  'iamriya1711@gmail.com',
  'utut11935@gmail.com',
  'utakarshsinghthakur@gmail.com',
  'info@calmchase.com'
];

async function triggerNewsletter() {
  console.log('🚀 Manually triggering newsletters to specific test emails...');
  console.log('📧 Test emails:', TEST_EMAILS);
  
  try {
    // Fetch news articles
    console.log('🔍 Fetching news articles...');
    const articles = await fetchNews();
    
    if (articles.length === 0) {
      console.log('❌ No news articles available');
      // Send a fallback newsletter with a message
      const fallbackContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c3e50; text-align: center;">🎯 Daily Current Affairs for CDS Aspirants</h1>
          <p style="color: #7f8c8d; text-align: center;">Your daily dose of military news and defense insights</p>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
            <h2 style="color: #e74c3c; text-align: center;">📰 No New Articles Today</h2>
            <p style="color: #34495e; text-align: center;">
              We couldn't fetch new articles at this moment, but we're working on it!<br>
              Please check back later or try refreshing the page.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #7f8c8d; font-size: 14px;">
            <p>This newsletter is sent daily to help you stay updated with relevant current affairs for CDS preparation.</p>
            <p>Best of luck with your preparation! 🎖️</p>
            <p><a href="https://www.irun.co.in" style="color: #3498db; text-decoration: none;">Visit our website: www.irun.co.in</a></p>
          </div>
        </div>
      `;
      
      // Send fallback newsletter to all test emails
      for (const email of TEST_EMAILS) {
        try {
          await sendNewsletterEmail(email, fallbackContent);
          console.log(`✅ Fallback newsletter sent to ${email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send fallback newsletter to ${email}:`, emailError);
        }
      }
      
      console.log('✅ Manual newsletter trigger completed!');
      return;
    }
    
    // Format newsletter content
    console.log('📄 Formatting newsletter content...');
    const newsletterContent = formatNewsletter(articles);
    
    // Send newsletter to each test email
    console.log('📬 Sending newsletters to test emails...');
    for (const email of TEST_EMAILS) {
      try {
        await sendNewsletterEmail(email, newsletterContent);
        console.log(`✅ Newsletter sent to ${email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send newsletter to ${email}:`, emailError);
      }
    }
    
    console.log('✅ Manual newsletter trigger completed!');
  } catch (error) {
    console.error('❌ Manual newsletter trigger failed:', error);
  }
}

// Run the trigger
triggerNewsletter();