# Manual Collection Setup Guide

Since the automated setup script is having issues with the Appwrite SDK, you can manually create the user preferences collection through the Appwrite Console.

## Steps to Create User Preferences Collection

1. **Log in to Appwrite Console**
   - Go to https://cloud.appwrite.io/
   - Log in with your credentials
   - Select your project (ID: 689cd1da000d75fa05df)

2. **Navigate to Database**
   - Click on "Databases" in the left sidebar
   - Select the "community_db" database (or create it if it doesn't exist)

3. **Create User Preferences Collection**
   - Click "Add Collection"
   - Set Collection ID: `user_preferences`
   - Set Collection Name: `User Preferences`
   - Click "Create"

4. **Set Collection Permissions**
   - In the collection settings, set these permissions:
     - Read: Any
     - Create: Users
     - Update: Users
     - Delete: Users

5. **Add Attributes**
   Add the following attributes to the collection:

   **userId** (string)
   - Key: `userId`
   - Size: 100
   - Required: Yes

   **wantsNewsletter** (boolean)
   - Key: `wantsNewsletter`
   - Required: Yes

   **newsletterTime** (string)
   - Key: `newsletterTime`
   - Size: 10
   - Required: No

   **createdAt** (datetime)
   - Key: `createdAt`
   - Required: Yes

   **updatedAt** (datetime)
   - Key: `updatedAt`
   - Required: Yes

6. **Test the Connection**
   After creating the collection, test the connection:
   ```bash
   cd server
   npm run test-appwrite
   ```

## Alternative: Use Appwrite CLI

If you prefer to use the command line, you can install the Appwrite CLI and create the collection that way:

1. Install Appwrite CLI:
   ```bash
   npm install -g appwrite-cli
   ```

2. Initialize the CLI:
   ```bash
   appwrite client --endpoint https://syd.cloud.appwrite.io/v1 --projectId 689cd1da000d75fa05df --key YOUR_API_KEY
   ```

3. Create the collection:
   ```bash
   appwrite database create-collection --databaseId community_db --collectionId user_preferences --name "User Preferences"
   ```

4. Add attributes:
   ```bash
   appwrite database create-string-attribute --databaseId community_db --collectionId user_preferences --key userId --size 100 --required true
   appwrite database create-boolean-attribute --databaseId community_db --collectionId user_preferences --key wantsNewsletter --required true
   appwrite database create-string-attribute --databaseId community_db --collectionId user_preferences --key newsletterTime --size 10 --required false
   appwrite database create-datetime-attribute --databaseId community_db --collectionId user_preferences --key createdAt --required true
   appwrite database create-datetime-attribute --databaseId community_db --collectionId user_preferences --key updatedAt --required true
   ```

## Verification

After setting up the collection, you can verify it works by:

1. Running the test script:
   ```bash
   npm run test-appwrite
   ```

2. Registering a new user with newsletter preference enabled

3. Checking that the user preference is saved in the collection

This manual setup should resolve the AppwriteException errors you were encountering with the newsletter feature.