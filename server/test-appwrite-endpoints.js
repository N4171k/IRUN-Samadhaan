// Test script to try multiple Appwrite endpoints
require('dotenv').config({ path: './.env' });
const { Client, Databases } = require('appwrite');

// List of possible endpoints to try
const endpoints = [
  process.env.APPWRITE_ENDPOINT,
  process.env.VITE_APPWRITE_ENDPOINT,
  'https://cloud.appwrite.io/v1',      // Global endpoint
  'https://us.cloud.appwrite.io/v1',    // US endpoint
  'https://eu.cloud.appwrite.io/v1',    // EU endpoint
  'https://au.cloud.appwrite.io/v1',    // Australia endpoint
  'https://in.cloud.appwrite.io/v1',    // India endpoint
  'https://sg.cloud.appwrite.io/v1',    // Singapore endpoint
  'https://syd.cloud.appwrite.io/v1'    // Sydney endpoint
].filter(Boolean); // Remove undefined/null values

const projectId = process.env.APPWRITE_PROJECT_ID || 
                 process.env.VITE_APPWRITE_PROJECT_ID || 
                 '689cd1da000d75fa05df';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'community_db';
const USER_PREFERENCES_COLLECTION_ID = 'user_preferences';

async function testEndpoints() {
  console.log('🔍 Testing multiple Appwrite endpoints...');
  console.log('🔍 Project ID:', projectId);
  console.log('🔍 Database ID:', DATABASE_ID);
  console.log('🔍 Collection ID:', USER_PREFERENCES_COLLECTION_ID);
  console.log('🔍 Endpoints to test:', endpoints);
  
  for (const endpoint of endpoints) {
    console.log(`\n🔧 Testing endpoint: ${endpoint}`);
    
    try {
      // Initialize Appwrite client with this endpoint
      const client = new Client();
      client
        .setEndpoint(endpoint)
        .setProject(projectId);
      
      const databases = new Databases(client);
      
      // Test if we can access the user preferences collection
      const response = await databases.listDocuments(
        DATABASE_ID,
        USER_PREFERENCES_COLLECTION_ID,
        []
      );
      
      console.log(`✅ SUCCESS: Connected to Appwrite using endpoint: ${endpoint}`);
      console.log(`✅ Found ${response.total} documents in user preferences collection`);
      return endpoint; // Return the working endpoint
    } catch (error) {
      console.log(`❌ FAILED: ${endpoint} - ${error.message}`);
    }
  }
  
  console.log('\n❌ All endpoints failed. Please check your Appwrite project settings.');
  return null;
}

// Run the test
testEndpoints().then(workingEndpoint => {
  if (workingEndpoint) {
    console.log(`\n🎉 Working endpoint: ${workingEndpoint}`);
    console.log('📝 Update your APPWRITE_ENDPOINT in server/.env with this value');
  }
});