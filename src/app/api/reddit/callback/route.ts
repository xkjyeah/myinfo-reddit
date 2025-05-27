import { NextRequest, NextResponse } from 'next/server';
import Snoowrap from 'snoowrap';

import { getAuthData, setAuthData } from '../../auth/session';

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID!;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET!;
const REDDIT_REDIRECT_URI = process.env.REDDIT_REDIRECT_URI!;
const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT!;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const reddit = await Snoowrap.fromAuthCode({
      code,
      userAgent: REDDIT_USER_AGENT,
      clientId: REDDIT_CLIENT_ID,
      clientSecret: REDDIT_CLIENT_SECRET,
      redirectUri: REDDIT_REDIRECT_URI,
    });

    const user: Snoowrap.RedditUser = await (reddit.getMe as any)();

    const response = NextResponse.redirect(new URL('/api/reddit/flair', request.url));
    await setAuthData(
      response,
      {
        ...(await getAuthData(request)),
        redditUsername: user.name,
      },
      60 * 5e3
    );

    return response;
  } catch (error) {
    console.error('Reddit authentication error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
