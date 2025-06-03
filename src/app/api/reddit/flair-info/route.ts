import { NextRequest, NextResponse } from 'next/server';
import Snoowrap from 'snoowrap';

import { getRedditToken } from '@/lib/db';

import { getStatusToFlairTemplates } from '../flairs';

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID!;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET!;
const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT!;

// Returns a mapping of status to flair
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetSubreddit = searchParams.get('subreddit');

  if (!targetSubreddit) {
    return NextResponse.json({ error: 'Subreddit is required' }, { status: 400 });
  }

  const refreshToken = await getRedditToken(targetSubreddit);
  if (!refreshToken) {
    return NextResponse.json(
      { error: 'Subreddit is not configured. Please ask the moderator to set it up' },
      { status: 400 }
    );
  }

  try {
    // Initialize Reddit client
    const reddit = new Snoowrap({
      userAgent: REDDIT_USER_AGENT,
      clientId: REDDIT_CLIENT_ID,
      clientSecret: REDDIT_CLIENT_SECRET,
      refreshToken,
    });
    // Set the user's flair in the subreddit
    const subreddit: Snoowrap.Subreddit = await (reddit.getSubreddit as any)(targetSubreddit);

    const flairTemplates = await getStatusToFlairTemplates(reddit, subreddit);

    return NextResponse.json(flairTemplates);
  } catch (error) {
    console.error('Reddit API error:', error);
    return NextResponse.json(
      { error: 'Failed to set flair', message: (error as Error)?.message },
      { status: 500 }
    );
  }
}
