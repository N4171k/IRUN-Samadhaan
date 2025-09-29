import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

const missingConfig = [];

if (!import.meta.env.VITE_APPWRITE_ENDPOINT) {
    missingConfig.push('VITE_APPWRITE_ENDPOINT');
}

if (!import.meta.env.VITE_APPWRITE_PROJECT_ID) {
    missingConfig.push('VITE_APPWRITE_PROJECT_ID');
}

const hasValidConfig = missingConfig.length === 0;
const configErrorMessage = hasValidConfig
    ? null
    : `Appwrite configuration missing. Please set: ${missingConfig.join(', ')}`;

if (!hasValidConfig) {
    console.error(configErrorMessage);
}

const client = hasValidConfig
    ? new Client()
        .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
        .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)
    : null;

const createUnavailableService = (serviceName) => new Proxy({}, {
    get: (_, prop) => {
        if (prop === '__isProxy') return true;

        return (...args) => {
            const message = `${serviceName}.${String(prop)} is unavailable: ${configErrorMessage}`;
            console.error(message, { args });
            return Promise.reject(new Error(message));
        };
    }
});

export const account = hasValidConfig ? new Account(client) : createUnavailableService('account');
export const databases = hasValidConfig ? new Databases(client) : createUnavailableService('databases');
export const storage = hasValidConfig ? new Storage(client) : createUnavailableService('storage');
export { ID, Query }; // Export ID and Query for creating unique user IDs and queries

export const APPWRITE_CONFIG_READY = hasValidConfig;
export const APPWRITE_CONFIG_ERROR = configErrorMessage;
export const APPWRITE_MISSING_KEYS = missingConfig;

// Database and Collection IDs
export const DATABASE_ID = 'community_db';
export const POSTS_COLLECTION_ID = 'posts';
export const COMMENTS_COLLECTION_ID = 'comments';
export const USER_PREFERENCES_COLLECTION_ID = 'user_preferences';

// Storage Bucket ID
export const STORAGE_BUCKET_ID = 'community_files';
