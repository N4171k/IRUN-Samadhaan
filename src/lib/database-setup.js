// Database Setup Instructions for Appwrite

/*
To set up the community database in Appwrite:

1. Go to your Appwrite Console (https://cloud.appwrite.io)
2. Navigate to your project
3. Go to Databases tab
4. Create a new database with ID: "community_db"

5. Create Collections:

POSTS COLLECTION (ID: "posts"):
- Attributes:
  * content (String, required, 500 chars)
  * author (String, required, 100 chars) 
  * userId (String, required, 100 chars)

- Permissions:
  * Read: Any
  * Create: Users
  * Update: Users
  * Delete: Users

COMMENTS COLLECTION (ID: "comments"):
- Attributes:
  * content (String, required, 300 chars)
  * author (String, required, 100 chars)
  * userId (String, required, 100 chars)
  * postId (String, required, 100 chars)

- Permissions:
  * Read: Any
  * Create: Users
  * Update: Users
  * Delete: Users

6. Update your .env file with:
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id

*/

export const DATABASE_SCHEMA = {
  database: {
    id: 'community_db',
    name: 'Community Database'
  },
  collections: {
    posts: {
      id: 'posts',
      name: 'Posts',
      attributes: [
        { key: 'content', type: 'string', size: 500, required: true },
        { key: 'author', type: 'string', size: 100, required: true },
        { key: 'userId', type: 'string', size: 100, required: true }
      ]
    },
    comments: {
      id: 'comments', 
      name: 'Comments',
      attributes: [
        { key: 'content', type: 'string', size: 300, required: true },
        { key: 'author', type: 'string', size: 100, required: true },
        { key: 'userId', type: 'string', size: 100, required: true },
        { key: 'postId', type: 'string', size: 100, required: true }
      ]
    }
  }
};