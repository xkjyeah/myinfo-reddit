import { NextResponse } from 'next/server';
import Snoowrap from 'snoowrap';

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID!;
const REDDIT_REDIRECT_URI = process.env.REDDIT_REDIRECT_URI!;

export async function GET() {
  const authUrl = Snoowrap.getAuthUrl({
    clientId: REDDIT_CLIENT_ID,
    scope: ['identity'],
    redirectUri: REDDIT_REDIRECT_URI,
    permanent: false,
    state: Math.random().toString(36).substring(7),
  });

  return NextResponse.redirect(authUrl);
}
