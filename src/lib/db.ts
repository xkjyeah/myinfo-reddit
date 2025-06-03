import admin from 'firebase-admin';

// Initialize Firebase Admin SDK with service account
let app: admin.app.App | null = null;
let database: admin.database.Database | null = null;

function initializeFirebaseAdmin() {
  if (app && database) {
    return { app, database };
  }

  // Check if Firebase Admin is already initialized
  if (admin.apps.length > 0) {
    app = admin.apps[0] as admin.app.App;
    database = admin.database(app);
    return { app, database };
  }

  // Service account configuration
  const serviceAccountKey = Buffer.from(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64!,
    'base64'
  ).toString('utf-8');
  const databaseURL = process.env.FIREBASE_DATABASE_URL;

  if (!serviceAccountKey || !databaseURL) {
    throw new Error(
      'Missing Firebase configuration: FIREBASE_SERVICE_ACCOUNT_KEY and FIREBASE_DATABASE_URL are required. Please check your environment variables.'
    );
  }

  let serviceAccount;
  try {
    // Parse the service account key (should be a JSON string)
    serviceAccount = JSON.parse(serviceAccountKey);
  } catch (error) {
    throw new Error(
      `Invalid FIREBASE_SERVICE_ACCOUNT_KEY: Must be a valid JSON string containing the service account credentials. ${(error as Error).message}`
    );
  }

  // Initialize Firebase Admin
  app = admin.initializeApp(
    {
      credential: admin.credential.cert(serviceAccount),
      databaseURL: databaseURL,
    },
    'SOME-APP'
  );
  database = admin.database(app);

  return { app, database };
}

export async function saveRedditToken(subreddit: string, refreshToken: string): Promise<void> {
  const { database } = initializeFirebaseAdmin();
  const tokenRef = database.ref(`subreddit_tokens/${subreddit}`);

  await tokenRef.set({
    refresh_token: refreshToken,
    created_at: admin.database.ServerValue.TIMESTAMP,
    updated_at: admin.database.ServerValue.TIMESTAMP,
  });
}

export async function getRedditToken(subreddit: string): Promise<string | null> {
  const { database } = initializeFirebaseAdmin();
  const tokenRef = database.ref(`subreddit_tokens/${subreddit}/refresh_token`);
  const snapshot = await tokenRef.once('value');

  return snapshot.exists() ? snapshot.val() : null;
}

export async function deleteRedditToken(subreddit: string): Promise<void> {
  const { database } = initializeFirebaseAdmin();
  const tokenRef = database.ref(`subreddit_tokens/${subreddit}`);
  await tokenRef.remove();
}

export async function getTokenInfo(subreddit: string): Promise<{ refreshToken: string } | null> {
  const { database } = initializeFirebaseAdmin();
  const tokenRef = database.ref(`subreddit_tokens/${subreddit}/refresh_token`);
  const snapshot = await tokenRef.once('value');

  if (snapshot.exists()) {
    return {
      refreshToken: snapshot.val(),
    };
  }

  return null;
}

// Firebase Realtime Database doesn't require table initialization like SQL databases
// This function is kept for compatibility but doesn't need to do anything
export async function initDatabase(): Promise<void> {
  try {
    initializeFirebaseAdmin();
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.log('Firebase initialization skipped:', (error as Error).message);
  }
}
