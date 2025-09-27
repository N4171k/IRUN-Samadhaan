# Daily Current Affairs Newsletter Setup

This document explains how to set up and configure the daily current affairs newsletter feature for CDS aspirants.

## Overview

The newsletter feature allows users to receive daily current affairs emails relevant to CDS preparation, including:
- Military news
- Defense technology updates
- Geopolitical insights
- General current affairs

## Prerequisites

1. Appwrite server configured and running
2. API keys for news services
3. Email sending service configured

## Setup Instructions

### 1. Configure Environment Variables

Add the following environment variables to your `.env` files:

**Frontend (.env in root directory):**
```env
# Appwrite Configuration
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_ENDPOINT=https://your-appwrite-instance/v1
VITE_APPWRITE_DATABASE_ID=community_db

# News API Keys (at least one required)
VITE_NEWS_API_KEY=your_newsapi_org_key
VITE_GNEWS_API_KEY=your_gnews_io_key
VITE_CURRENTS_API_KEY=your_currentsapi_services_key
VITE_MEDIASTACK_API_KEY=your_mediastack_com_key
```

**Backend (server/.env):**
```env
# Appwrite Configuration
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_ENDPOINT=https://your-appwrite-instance/v1
APPWRITE_DATABASE_ID=community_db

# News API Keys (at least one required)
NEWS_API_KEY=your_newsapi_org_key
GNEWS_API_KEY=your_gnews_io_key
CURRENTS_API_KEY=your_currentsapi_services_key
MEDIASTACK_API_KEY=your_mediastack_com_key
```

### 2. Set up Appwrite Database

Run the database setup script or manually create the following collection:

**User Preferences Collection:**
- Collection ID: `user_preferences`
- Attributes:
  - `userId` (string, required)
  - `wantsNewsletter` (boolean, required)
  - `newsletterTime` (string, optional, format: HH:MM)
  - `createdAt` (datetime, required)
  - `updatedAt` (datetime, required)

### 3. Install Dependencies

In the server directory, run:
```bash
npm install node-cron nodemailer
```

### 4. Configure Email Service

The newsletter service currently logs emails to the console. To send real emails, you need to integrate with an email service:

**Option 1: Nodemailer with Gmail SMTP (Recommended for Gmail)**
1. Install nodemailer: `npm install nodemailer`
2. Uncomment the nodemailer code in `server/utils/newsletterUtils.js`
3. Add the following environment variables to `server/.env`:
   ```env
   EMAIL_USER=utakarsh.agent001013@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```
4. For Gmail, you'll need to generate an App Password:
   - Enable 2-factor authentication on your Gmail account
   - Go to Google Account settings > Security > App passwords
   - Generate a new app password for "Mail"
   - Use this password as `EMAIL_PASS`

**Option 2: SendGrid**
1. Install SendGrid: `npm install @sendgrid/mail`
2. Update the `sendNewsletterEmail` function in `server/utils/newsletterUtils.js`
3. Add your SendGrid API key to `server/.env`:
   ```env
   SENDGRID_API_KEY=your_sendgrid_api_key
   ```

**Option 3: AWS SES**
1. Install AWS SDK: `npm install @aws-sdk/client-ses`
2. Update the `sendNewsletterEmail` function in `server/utils/newsletterUtils.js`
3. Configure AWS credentials in `server/.env`:
   ```env
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   ```

### 5. Test the Feature

1. Start the development server: `npm run dev`
2. Navigate to the signup page
3. Create a new account with newsletter preference enabled
4. Check the console for confirmation that preferences were saved
5. Test the scheduler by manually triggering newsletter functions

## How It Works

1. **User Registration**: During signup, users can opt-in for the newsletter and choose a delivery time
2. **Preference Storage**: User preferences are stored in the Appwrite database
3. **News Fetching**: The scheduler fetches news from multiple APIs every day
4. **Email Sending**: Formatted newsletters are sent to subscribed users at their preferred time
5. **Fallback Handling**: If no news is available, a fallback message is sent

## API Sources

The newsletter service fetches news from the following APIs:
1. **News API** (https://newsapi.org/)
2. **GNews API** (https://gnews.io/)
3. **Currents API** (https://currentsapi.services/)
4. **MediaStack API** (https://mediastack.com/)

## Customization

You can customize the newsletter by modifying:
- `server/utils/newsletterUtils.js` - News fetching and formatting logic
- `src/services/newsletterService.js` - Frontend service functions
- `src/components/NewsletterPreference.jsx` - UI component
- `server/services/newsletterScheduler.js` - Scheduling logic

## Troubleshooting

1. **No emails sent**: Check that API keys are correctly configured
2. **Empty newsletters**: Verify that at least one news API is working
3. **Scheduler not running**: Ensure the server is running and cron jobs are initialized
4. **Database errors**: Verify Appwrite configuration and collection setup
5. **Appwrite connection issues**: Use diagnostic tools to test connection:
   - Run `npm run test-appwrite` to verify Appwrite connection
   - Run `npm run setup-user-preferences` to create the required collection
   - If the automated setup fails, refer to `MANUAL_COLLECTION_SETUP.md` for manual setup instructions
   - Check that all environment variables are correctly set in `server/.env`

## Support

For issues with the newsletter feature, please check:
1. API key configurations
2. Network connectivity to news APIs
3. Appwrite database permissions
4. Email service configuration