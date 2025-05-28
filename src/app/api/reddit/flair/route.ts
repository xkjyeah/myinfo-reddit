import { NextRequest, NextResponse } from 'next/server';
import Snoowrap from 'snoowrap';

import { getRedditToken } from '@/lib/db';

import { getAuthData } from '../../auth/session';
import { StatusToTemplateClass, getStatusToFlairTemplates } from '../flairs';
import type { FlairV2 } from '../flairs';

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID!;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET!;
const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT!;

async function ensureFlairTemplatesExist(
  reddit: Snoowrap,
  subreddit: Snoowrap.Subreddit
): Promise<Record<string, FlairV2>> {
  const availableFlairTemplates = await getStatusToFlairTemplates(reddit, subreddit);

  const missingFlairs = Object.keys(StatusToTemplateClass).filter(
    (k) => !(k in availableFlairTemplates)
  );
  if (missingFlairs.length > 0) {
    throw new Error(`Missing flair templates for ${missingFlairs.join(', ')}`);
  }
  return availableFlairTemplates;
}

export async function GET(request: NextRequest) {
  const authData = await getAuthData(request);

  if (!authData.residentialStatus) {
    return NextResponse.json({ error: 'Missing residential status' }, { status: 400 });
  }
  if (!authData.redditUsername) {
    return NextResponse.json({ error: 'Missing reddit username' }, { status: 400 });
  }
  if (!authData.targetSubreddit) {
    return NextResponse.json({ error: 'Missing target subreddit' }, { status: 400 });
  }

  try {
    // Error if the subreddit is not authorized
    const refreshToken = await getRedditToken(authData.targetSubreddit);
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'This community has not allowed this app to add flair' },
        { status: 400 }
      );
    }

    // Initialize Reddit client
    const reddit = new Snoowrap({
      userAgent: REDDIT_USER_AGENT,
      clientId: REDDIT_CLIENT_ID,
      clientSecret: REDDIT_CLIENT_SECRET,
      refreshToken,
    });
    const targetSubreddit = authData.targetSubreddit!;

    // Set the user's flair in the subreddit
    const subreddit: Snoowrap.Subreddit = await (reddit.getSubreddit as any)(targetSubreddit);

    const flairTemplates = await ensureFlairTemplatesExist(reddit, subreddit);

    const flairToSet = flairTemplates[authData.residentialStatus || ''];

    if (flairToSet) {
      await (subreddit.setMultipleUserFlairs as any)([
        {
          name: authData.redditUsername,
          text: flairToSet?.text,
          cssClass: flairToSet?.css_class,
        },
      ]);
    } else {
      // Delete any verified flair, because clearly user status has changed...
      const currentFlair = await subreddit.getUserFlair(authData.redditUsername);
      if (
        Object.values(StatusToTemplateClass).some((regex) =>
          regex.test(currentFlair.flair_css_class)
        )
      ) {
        await (subreddit.deleteUserFlair as any)(authData.redditUsername);
      }
    }

    // Redirect to the subreddit
    return NextResponse.redirect(`https://reddit.com/r/${targetSubreddit}`);
  } catch (error) {
    console.error('Reddit API error:', error);
    return NextResponse.json({ error: 'Failed to set flair' }, { status: 500 });
  }
}
