import { NextRequest, NextResponse } from 'next/server';
import Snoowrap from 'snoowrap';

export async function GET(request: NextRequest) {
  const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID!;
  const REDDIT_REDIRECT_URI = process.env.REDDIT_REDIRECT_URI!;

  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get('subreddit');

  const scopes = ['identity'];
  const state = JSON.stringify({
    random: Math.random().toString(36).substring(15),
    scopes: scopes,
    subreddit: subreddit,
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
