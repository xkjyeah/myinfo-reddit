import { NextResponse } from 'next/server';
import Snoowrap from 'snoowrap';

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID!;
const REDDIT_REDIRECT_URI = process.env.REDDIT_REDIRECT_URI!;

export async function GET() {
  const scopes = ['identity'];
  const state = JSON.stringify({
    random: Math.random().toString(36).substring(7),
    scopes: scopes,
  });

  const authUrl = Snoowrap.getAuthUrl({
    clientId: REDDIT_CLIENT_ID,
    scope: scopes,
    redirectUri: REDDIT_REDIRECT_URI,
    permanent: false,
    state: state,
  });

  return NextResponse.redirect(authUrl);
}
