import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

// Validate environment variables
if (!import.meta.env.VITE_APPWRITE_ENDPOINT) {
    console.error('VITE_APPWRITE_ENDPOINT is not defined. Please check your .env file.');
    throw new Error('Missing Appwrite endpoint configuration');
}

if (!import.meta.env.VITE_APPWRITE_PROJECT_ID) {
    console.error('VITE_APPWRITE_PROJECT_ID is not defined. Please check your .env file.');
    throw new Error('Missing Appwrite project ID configuration');
}

const client = new Client();
client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, Query }; // Export ID and Query for creating unique user IDs and queries

// Database and Collection IDs
export const DATABASE_ID = 'community_db';
export const POSTS_COLLECTION_ID = 'posts';
export const COMMENTS_COLLECTION_ID = 'comments';

// Storage Bucket ID
export const STORAGE_BUCKET_ID = 'community_files';
