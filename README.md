# MyInfo Reddit Integration

This is a [Next.js](https://nextjs.org) project that integrates Singapore's MyInfo with Reddit for user verification and flair management.

## Database Migration to Firebase

This project has been migrated from PostgreSQL to **Firebase Realtime Database** for cost-effectiveness (Firebase has a generous free tier!). The integration uses Firebase Admin SDK with service account authentication for secure server-side operations.

### Required Environment Variables

Create a `.env.local` file with the following Firebase configuration:

```bash
# Firebase Configuration (service account)
FIREBASE_SERVICE_ACCOUNT_KEY_BASE64=base64_encoded_service_account_json
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/

# MyInfo Configuration
MYINFO_APP_REDIRECT_URL=your_myinfo_redirect_url
MYINFO_HOST=https://stg-id.singpass.gov.sg
MYINFO_APP_ID=your_myinfo_app_id
MYINFO_PRIVATE_ENC_KEY=your_private_encryption_key
MYINFO_PRIVATE_SIG_KEY=your_private_signing_key

# Reddit Configuration
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_REDIRECT_URI=your_reddit_redirect_uri
REDDIT_USER_AGENT=your_reddit_user_agent

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
```

### Firebase Setup

1. **Create a Firebase project** at [Firebase Console](https://console.firebase.google.com/)
2. **Enable Realtime Database** in your Firebase project
3. **Set up database rules** (start with test mode for development):
   ```json
   {
     "rules": {
       ".read": false,
       ".write": false,
       "subreddit_tokens": {
         ".read": "auth != null",
         ".write": "auth != null"
       }
     }
   }
   ```
4. **Create a service account**:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Base64 encode the JSON content: `cat service-account.json | base64`
   - Set `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64` to the base64-encoded string
5. **Set the database URL** in `FIREBASE_DATABASE_URL`

### Service Account Security

The Firebase integration uses a service account for authentication, which provides:

- **Server-side security**: No client-side API keys exposed
- **Fine-grained permissions**: Service account can be restricted to specific operations
- **Production ready**: Suitable for deployment environments

**Important**: Keep your service account key secure and never commit it to version control. Use environment variables or secure secret management.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Initialization

Unlike PostgreSQL, Firebase Realtime Database doesn't require table creation. The database structure is created automatically when data is first written. You can still run the init command for compatibility:

```bash
npm run init-db
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Firebase Realtime Database Documentation](https://firebase.google.com/docs/database) - learn about Firebase Realtime Database.
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup) - learn about Firebase Admin SDK.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Make sure to add all your environment variables to your Vercel deployment settings. For the service account key, you can either:

1. Add the entire JSON as a single environment variable
2. Use Vercel's secret management features for enhanced security
