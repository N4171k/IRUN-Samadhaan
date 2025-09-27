// Script to update existing user preferences with email addresses
// Note: This is a placeholder script. In a real implementation, you would need to 
// fetch the actual email addresses for each user from the Appwrite users collection.

require('dotenv').config({ path: './.env' });
const { Client, Databases } = require('appwrite');

// Initialize Appwrite client
const client = new Client();

// Try to determine the correct endpoint
const endpoint = process.env.APPWRITE_ENDPOINT || 
  process.env.VITE_APPWRITE_ENDPOINT || 
  'https://cloud.appwrite.io/v1'; // Fallback to global endpoint

const projectId = process.env.APPWRITE_PROJECT_ID || 
  process.env.VITE_APPWRITE_PROJECT_ID || 
  '689cd1da000d75fa05df';

client
  .setEndpoint(endpoint)
  .setProject(projectId);

const databases = new Databases(client);

// Database and Collection IDs
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'community_db';
const USER_PREFERENCES_COLLECTION_ID = 'user_preferences';

// Placeholder function - in a real implementation, you would fetch the actual email
// addresses for each user from the Appwrite users collection
function getUserEmail(userId) {
  // This is a placeholder implementation
  // In a real implementation, you would use the Appwrite Users API to fetch the email
  // For now, we'll return a placeholder email
  return `user-${userId}@example.com`;
}

async function updateUserPreferences() {
  console.log('🔧 Updating user preferences with email addresses...');
  
  try {
    // Fetch all user preferences
    const response = await databases.listDocuments(
      DATABASE_ID,
      USER_PREFERENCES_COLLECTION_ID,
      []
    );
    
    console.log(`🔧 Found ${response.documents.length} user preferences to update`);
    
    // Update each user preference with an email address
    for (const userPreference of response.documents) {
      try {
        // Skip if email already exists
        if (userPreference.email && typeof userPreference.email === 'string' && userPreference.email.includes('@')) {
          console.log(`✅ Email already exists for user ${userPreference.userId}`);
          continue;
        }
        
        // Get the user's email (placeholder implementation)
        const userEmail = getUserEmail(userPreference.userId);
        
        // Update the user preference document with the email
        await databases.updateDocument(
          DATABASE_ID,
          USER_PREFERENCES_COLLECTION_ID,
          userPreference.$id,
          {
            email: userEmail
          }
        );
        
        console.log(`✅ Updated user preference for ${userPreference.userId} with email ${userEmail}`);
      } catch (updateError) {
        console.error(`❌ Failed to update user preference for ${userPreference.userId}:`, updateError);
      }
    }
    
    console.log('✅ User preferences update completed');
  } catch (error) {
    console.error('❌ Error updating user preferences:', error);
  }
}

// Run the update
updateUserPreferences();