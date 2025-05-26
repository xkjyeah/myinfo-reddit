import { NextResponse } from 'next/server';
import Snoowrap from 'snoowrap';

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID!;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET!;
const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT!;
const SUBREDDIT_NAME = process.env.SUBREDDIT_NAME!;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const flair = searchParams.get('flair');
  const accessToken = searchParams.get('access_token');

  if (!flair || !accessToken) {
    return NextResponse.json({ error: 'Missing flair or access token' }, { status: 400 });
  }

  try {
    // Initialize Reddit client
    const reddit = new Snoowrap({
      userAgent: REDDIT_USER_AGENT,
      clientId: REDDIT_CLIENT_ID,
      clientSecret: REDDIT_CLIENT_SECRET,
      accessToken,
    });

    // Get the authenticated user's username
    const me = await reddit.getMe().fetch();
    const username = me.name;

    console.log(!!username);

    // Set the user's flair in the subreddit
    const subreddit = await reddit.getSubreddit(SUBREDDIT_NAME);
    await subreddit.selectUserFlair({
      flair_template_id: '', // Leave empty for text flair
      text: flair,
    });

    // Redirect to the subreddit
    return NextResponse.redirect(`https://reddit.com/r/${SUBREDDIT_NAME}`);
  } catch (error) {
    console.error('Reddit API error:', error);
    return NextResponse.json({ error: 'Failed to set flair' }, { status: 500 });
  }
}
