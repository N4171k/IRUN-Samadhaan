// Newsletter Scheduler Service
const cron = require('node-cron');
const { Client, Databases, Query } = require('appwrite');
const { fetchNews, formatNewsletter, sendNewsletterEmail } = require('../utils/newsletterUtils');

// Initialize Appwrite client
const client = new Client();

// Try to determine the correct endpoint
const endpoint = process.env.APPWRITE_ENDPOINT || 
  process.env.VITE_APPWRITE_ENDPOINT || 
  'https://cloud.appwrite.io/v1'; // Fallback to global endpoint

const projectId = process.env.APPWRITE_PROJECT_ID || 
  process.env.VITE_APPWRITE_PROJECT_ID || 
  '689cd1da000d75fa05df';

console.log('🔧 Attempting to connect to Appwrite with:');
console.log('🔧 Endpoint:', endpoint);
console.log('🔧 Project ID:', projectId);

client
  .setEndpoint(endpoint)
  .setProject(projectId);

const databases = new Databases(client);

// Database and Collection IDs
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'community_db';
const USER_PREFERENCES_COLLECTION_ID = 'user_preferences';

/**
 * Fetch users who want newsletters at a specific time
 * @param {string} time - Time in HH:MM format
 * @returns {Promise<Array>} Array of user preferences
 */
async function fetchUsersForNewsletter(time) {
  try {
    console.log(`🔍 Fetching users for newsletter at ${time}`);
    console.log(`🔍 Database ID: ${DATABASE_ID}`);
    console.log(`🔍 Collection ID: ${USER_PREFERENCES_COLLECTION_ID}`);
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      USER_PREFERENCES_COLLECTION_ID,
      [
        Query.equal('wantsNewsletter', true),
        Query.equal('newsletterTime', time)
      ]
    );
    
    console.log(`✅ Found ${response.documents.length} users for newsletter at ${time}`);
    return response.documents;
  } catch (error) {
    console.error('Error fetching users for newsletter:', error);
    console.error('Database ID:', DATABASE_ID);
    console.error('Collection ID:', USER_PREFERENCES_COLLECTION_ID);
    console.error('Appwrite Endpoint:', process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1');
    console.error('Appwrite Project ID:', process.env.APPWRITE_PROJECT_ID || '689cd1da000d75fa05df');
    return [];
  }
}

/**
 * Send newsletters to all users who want it at 8:00 AM
 */
async function sendMorningNewsletters() {
  console.log('📬 Starting morning newsletter distribution...');
  
  try {
    // Fetch users who want newsletters at 8:00 AM
    const users = await fetchUsersForNewsletter('08:00');
    
    if (users.length === 0) {
      console.log('📭 No users subscribed to morning newsletters');
      return;
    }
    
    console.log(`📬 Sending newsletters to ${users.length} users`);
    
    // Fetch news articles
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
          </div>
        </div>
      `;
      
      // Send fallback newsletter to all users
      for (const userPreference of users) {
        try {
          // Use the email stored in the user preferences collection
          const userEmail = userPreference.email;
          if (userEmail && typeof userEmail === 'string' && userEmail.includes('@')) {
            await sendNewsletterEmail(userEmail, fallbackContent);
            console.log(`✅ Fallback newsletter sent to ${userEmail}`);
          } else {
            console.log(`❌ Invalid or missing email for user ${userPreference.userId}. Email: ${userEmail}`);
          }
        } catch (emailError) {
          console.error(`❌ Failed to send fallback newsletter to user ${userPreference.userId}:`, emailError);
        }
      }
      
      return;
    }
    
    // Format newsletter content
    const newsletterContent = formatNewsletter(articles);
    
    // Send newsletter to each user
    for (const userPreference of users) {
      try {
        // Use the email stored in the user preferences collection
        const userEmail = userPreference.email;
        if (userEmail && typeof userEmail === 'string' && userEmail.includes('@')) {
          await sendNewsletterEmail(userEmail, newsletterContent);
          console.log(`✅ Newsletter sent to ${userEmail}`);
        } else {
          console.log(`❌ Invalid or missing email for user ${userPreference.userId}. Email: ${userEmail}`);
        }
      } catch (emailError) {
        console.error(`❌ Failed to send newsletter to user ${userPreference.userId}:`, emailError);
      }
    }
    
    console.log('📬 Morning newsletter distribution completed');
  } catch (error) {
    console.error('Error in morning newsletter distribution:', error);
  }
}

/**
 * Send newsletters to users with custom times
 */
async function sendCustomTimeNewsletters() {
  console.log('📬 Checking for custom time newsletters...');
  
  try {
    // Get current time in HH:MM format
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Fetch users who want newsletters at this specific time
    const users = await fetchUsersForNewsletter(currentTime);
    
    if (users.length === 0) {
      console.log(`📭 No users subscribed to newsletters at ${currentTime}`);
      return;
    }
    
    console.log(`📬 Sending newsletters to ${users.length} users at ${currentTime}`);
    
    // Fetch news articles
    const articles = await fetchNews();
    
    // Format newsletter content
    const newsletterContent = formatNewsletter(articles);
    
    // Send newsletter to each user
    for (const userPreference of users) {
      try {
        // Use the email stored in the user preferences collection
        const userEmail = userPreference.email;
        if (userEmail && typeof userEmail === 'string' && userEmail.includes('@')) {
          await sendNewsletterEmail(userEmail, newsletterContent);
          console.log(`✅ Newsletter sent to ${userEmail} at custom time ${currentTime}`);
        } else {
          console.log(`❌ Invalid or missing email for user ${userPreference.userId}. Email: ${userEmail}`);
        }
      } catch (emailError) {
        console.error(`❌ Failed to send newsletter to user ${userPreference.userId}:`, emailError);
      }
    }
    
    console.log(`📬 Custom time newsletter distribution completed for ${currentTime}`);
  } catch (error) {
    console.error('Error in custom time newsletter distribution:', error);
  }
}

/**
 * Send newsletters to all users who have opted in (regardless of time preference)
 */
async function sendNewsletterToAllSubscribers() {
  console.log('📬 Sending newsletters to all subscribers...');
  
  try {
    // Fetch all users who want newsletters (regardless of time)
    const response = await databases.listDocuments(
      DATABASE_ID,
      USER_PREFERENCES_COLLECTION_ID,
      [
        Query.equal('wantsNewsletter', true)
      ]
    );
    
    const users = response.documents;
    
    if (users.length === 0) {
      console.log('📭 No users subscribed to newsletters');
      return;
    }
    
    console.log(`📬 Sending newsletters to ${users.length} subscribers`);
    
    // Fetch news articles
    const articles = await fetchNews();
    
    // Format newsletter content
    const newsletterContent = formatNewsletter(articles);
    
    // Send newsletter to each user
    for (const userPreference of users) {
      try {
        // Use the email stored in the user preferences collection
        const userEmail = userPreference.email;
        if (userEmail && typeof userEmail === 'string' && userEmail.includes('@')) {
          await sendNewsletterEmail(userEmail, newsletterContent);
          console.log(`✅ Newsletter sent to ${userEmail}`);
        } else {
          console.log(`❌ Invalid or missing email for user ${userPreference.userId}. Email: ${userEmail}`);
        }
      } catch (emailError) {
        console.error(`❌ Failed to send newsletter to user ${userPreference.userId}:`, emailError);
      }
    }
    
    console.log('📬 Newsletter distribution to all subscribers completed');
  } catch (error) {
    console.error('Error in newsletter distribution to all subscribers:', error);
  }
}

/**
 * Initialize newsletter scheduler
 */
function initializeScheduler() {
  console.log('⏰ Initializing newsletter scheduler...');
  console.log('⏰ Appwrite Endpoint:', process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1');
  console.log('⏰ Appwrite Project ID:', process.env.APPWRITE_PROJECT_ID || '689cd1da000d75fa05df');
  console.log('⏰ Database ID:', DATABASE_ID);
  console.log('⏰ User Preferences Collection ID:', USER_PREFERENCES_COLLECTION_ID);
  
  try {
    // Schedule morning newsletters at 8:00 AM daily
    cron.schedule('0 8 * * *', sendMorningNewsletters, {
      timezone: 'Asia/Kolkata' // Indian Standard Time
    });
    
    // Check for custom times every minute
    cron.schedule('* * * * *', sendCustomTimeNewsletters, {
      timezone: 'Asia/Kolkata' // Indian Standard Time
    });
    
    console.log('✅ Newsletter scheduler initialized successfully');
    console.log('⏰ Morning newsletters scheduled for 8:00 AM IST');
    console.log('⏰ Custom time newsletters checked every minute');
  } catch (error) {
    console.error('❌ Failed to initialize newsletter scheduler:', error);
  }
}

module.exports = {
  initializeScheduler,
  sendMorningNewsletters,
  sendCustomTimeNewsletters,
  sendNewsletterToAllSubscribers
};