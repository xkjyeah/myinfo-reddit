import { NextRequest, NextResponse } from 'next/server';
import Snoowrap from 'snoowrap';

import { saveRedditToken } from '@/lib/db';

import { getAuthData, setAuthData } from '../../auth/session';

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID!;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET!;
const REDDIT_REDIRECT_URI = process.env.REDDIT_REDIRECT_URI!;
const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT!;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  // Extract scopes from state parameter
  let requestedScopes: string[] = [];
  let targetSubredditFromState: string | null = null;
  if (state) {
    try {
      const stateData = JSON.parse(state);
      requestedScopes = stateData.scopes || [];
      targetSubredditFromState = stateData.targetSubreddit || null;
    } catch (error) {
      console.error('Failed to parse state parameter:', error);
      return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
    }
  }

  let reddit: Snoowrap;
  try {
    reddit = await Snoowrap.fromAuthCode({
      code,
      userAgent: REDDIT_USER_AGENT,
      clientId: REDDIT_CLIENT_ID,
      clientSecret: REDDIT_CLIENT_SECRET,
      redirectUri: REDDIT_REDIRECT_URI,
    });
  } catch (error) {
    console.error('Reddit authentication error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }

  // There are two cases --
  // 1/ Subreddit moderator is authorizing the app to add flair to their users.
  //    In this case refresh token is present
  //    Only store refresh token if user has modflair scope and refresh token exists
  // 2/ User is authorizing the app to get their identity, so that the app can set their flair
  //    In this case we do not store the refresh token.
  if (reddit.refreshToken && requestedScopes.includes('modflair') && targetSubredditFromState) {
    // // Get list of subreddits the user moderates
    // const moderatedSubreddits = await reddit.getModeratedSubreddits();

    // // Check if the user moderates the target subreddit
    // const moderatesTarget = moderatedSubreddits.some(
    //   (subreddit) =>
    //     subreddit.display_name.toLowerCase() === targetSubredditFromState.toLowerCase()
    // );

    // Check if a user is indeed the subreddit mod, by fetching the flair templates
    try {
      await reddit.getSubreddit(targetSubredditFromState).getUserFlairTemplates();
    } catch {
      return NextResponse.json(
        { error: 'User is not a moderator of the target subreddit' },
        { status: 400 }
      );
    }

    // Store the refresh token only for the target subreddit
    await saveRedditToken(targetSubredditFromState, reddit.refreshToken);
    return NextResponse.redirect(
      new URL(
        `/post-moderator-auth?subreddit=${encodeURIComponent(targetSubredditFromState)}`,
        request.url
      )
    );
  } else if (requestedScopes.includes('identity')) {
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
  } else {
    return NextResponse.json(
      {
        error: 'App does not know how to handle this case',
        scopes: requestedScopes,
        refreshTokenPresent: !!reddit.refreshToken,
      },
      { status: 400 }
    );
  }
}
