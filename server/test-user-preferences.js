// Test script to verify user preferences collection access
require('dotenv').config({ path: './.env' });
const { Client, Databases, Query } = require('appwrite');

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

async function testUserPreferencesAccess() {
  console.log('🔍 Testing access to user preferences collection...');
  console.log('🔍 Database ID:', DATABASE_ID);
  console.log('🔍 Collection ID:', USER_PREFERENCES_COLLECTION_ID);
  
  try {
    // Test if we can access the user preferences collection
    const response = await databases.listDocuments(
      DATABASE_ID,
      USER_PREFERENCES_COLLECTION_ID,
      []
    );
    
    console.log('✅ Successfully connected to Appwrite');
    console.log(`✅ Found ${response.total} documents in user preferences collection`);
    console.log(`✅ Collection has ${response.documents.length} documents in current page`);
    
    // Show first few documents (if any)
    if (response.documents.length > 0) {
      console.log('🔍 Sample documents:');
      response.documents.slice(0, 3).forEach((doc, index) => {
        console.log(`  ${index + 1}. User ID: ${doc.userId}, Email: ${doc.email}, Wants Newsletter: ${doc.wantsNewsletter}, Time: ${doc.newsletterTime}`);
      });
    } else {
      console.log('📭 No documents found in user preferences collection');
    }
    
  } catch (error) {
    console.error('❌ Error connecting to Appwrite:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    
    // Check if it's a collection not found error
    if (error.message && error.message.includes('not found')) {
      console.log('💡 The user preferences collection may not exist yet.');
      console.log('💡 Please create the collection using the database setup instructions.');
    }
  }
}

// Run the test
testUserPreferencesAccess();