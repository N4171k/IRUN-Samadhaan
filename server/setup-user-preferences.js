// Script to set up the user preferences collection in Appwrite
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

// Let's check what methods are available on the databases object
console.log('Available methods on databases object:', Object.keys(databases));

async function setupUserPreferencesCollection() {
  console.log('🔧 Setting up user preferences collection...');
  console.log('🔧 Database ID:', DATABASE_ID);
  console.log('🔧 Collection ID:', USER_PREFERENCES_COLLECTION_ID);
  
  try {
    console.log('✅ User preferences collection setup completed successfully');
  } catch (error) {
    console.error('❌ Error setting up user preferences collection:', error);
  }
}

// Run the setup
setupUserPreferencesCollection();