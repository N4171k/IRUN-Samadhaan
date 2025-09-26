# Database Setup for File Attachments

## Step 1: Add File Attributes to BOTH Collections

Go to your Appwrite Console and follow these steps:

### A. Posts Collection (for post images)
1. **Navigate to Database:**
   - Go to https://syd.cloud.appwrite.io/console
   - Select your project "irun"
   - Go to Databases → community_db → **posts** collection

2. **Add these attributes to posts collection:**

   #### fileId (Optional String)
   - **Attribute Key:** `fileId`
   - **Type:** String
   - **Size:** 255
   - **Required:** No (unchecked)
   - **Array:** No (unchecked)
   - **Default Value:** (leave empty)

   #### fileName (Optional String)
   - **Attribute Key:** `fileName`
   - **Type:** String
   - **Size:** 255
   - **Required:** No (unchecked)
   - **Array:** No (unchecked)
   - **Default Value:** (leave empty)

   #### fileType (Optional String)
   - **Attribute Key:** `fileType`
   - **Type:** String
   - **Size:** 100
   - **Required:** No (unchecked)
   - **Array:** No (unchecked)
   - **Default Value:** (leave empty)

### B. Comments Collection (for comment attachments)
1. **Navigate to:** Databases → community_db → **comments** collection

2. **Add the same three attributes:**
   - `fileId` (String, 255, Optional)
   - `fileName` (String, 255, Optional)
   - `fileType` (String, 100, Optional)

## Step 2: Create Storage Bucket (if not already created)

1. **Navigate to Storage:**
   - Go to Storage in your Appwrite Console
   - Click "Create Bucket"

2. **Bucket Configuration:**
   - **Bucket ID:** `community_files`
   - **Name:** Community Files
   - **Permissions:** 
     - Read: `users` (any authenticated user)
     - Create: `users` (any authenticated user)
     - Update: `users` (any authenticated user)
     - Delete: `users` (any authenticated user)
   - **File Security:** Enabled
   - **Maximum File Size:** 10MB (or as needed)
   - **Allowed File Extensions:** jpg, jpeg, png, gif, pdf, doc, docx (or as needed)

## Step 3: Test the Image Upload

1. **After adding the attributes**, create a new post with an image
2. **Go to "What's on your mind?" section**
3. **Type some text and attach an image**
4. **Click "Post"**
5. **Click on the new post to expand it**
6. **The image should now appear in the "image if any" section**

## Expected Result

- ✅ New posts with images will show the image in the expanded view
- ✅ New comments with attachments will display files
- ✅ Old posts without images will still show "image if any" placeholder

## Troubleshooting

- **"Unknown attribute" errors:** Make sure all three attributes are added to BOTH posts AND comments collections
- **Images not showing:** Verify the Storage bucket permissions allow authenticated users to read files
- **Upload fails:** Check file size limits and allowed extensions in Storage settings