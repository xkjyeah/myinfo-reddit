import { NextRequest, NextResponse } from 'next/server';
import Snoowrap from 'snoowrap';

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID!;
const REDDIT_REDIRECT_URI = process.env.REDDIT_REDIRECT_URI!;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subreddit = searchParams.get('subreddit');

  if (!subreddit) {
    return NextResponse.json({ error: 'Missing subreddit parameter' }, { status: 400 });
  }

  const scopes = ['modflair', 'flair'];
  const state = JSON.stringify({
    random: Math.random().toString(36).substring(16),
    scopes: scopes,
    subreddit,
  });

  const authUrl = Snoowrap.getAuthUrl({
    clientId: REDDIT_CLIENT_ID,
    scope: scopes,
    redirectUri: REDDIT_REDIRECT_URI,
    permanent: true,
    state: state,
  });

  return NextResponse.redirect(authUrl);
}
