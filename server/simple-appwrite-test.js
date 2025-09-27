// Simple Appwrite test script
require('dotenv').config({ path: './.env' });
const { Client, Databases } = require('appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '689cd1da000d75fa05df');

const databases = new Databases(client);

// Database ID
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'community_db';

async function testAppwrite() {
  console.log('🔍 Testing Appwrite connection...');
  console.log('🔍 Endpoint:', process.env.APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1');
  console.log('🔍 Project ID:', process.env.APPWRITE_PROJECT_ID || '689cd1da000d75fa05df');
  console.log('🔍 Database ID:', DATABASE_ID);
  
  try {
    // Try to list collections in the database
    console.log('🔍 Attempting to list collections...');
    // Note: The method name might be different in the Node.js SDK
    // Let's try a few common method names
    
    // Try list method
    if (databases.list) {
      const response = await databases.list(DATABASE_ID);
      console.log('✅ Successfully listed collections:', response);
      return;
    }
    
    // Try listCollections method
    if (databases.listCollections) {
      const response = await databases.listCollections(DATABASE_ID);
      console.log('✅ Successfully listed collections:', response);
      return;
    }
    
    console.log('❌ Unable to find list method in databases object');
    console.log('Available methods:', Object.keys(databases));
    
  } catch (error) {
    console.error('❌ Error connecting to Appwrite:', error.message);
    console.error('Error details:', error);
  }
}

// Run the test
testAppwrite();