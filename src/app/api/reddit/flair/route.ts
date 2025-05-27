import { NextRequest, NextResponse } from 'next/server';
import Snoowrap from 'snoowrap';

import { getAuthData } from '../../auth/session';
import { StatusToTemplateClass, getStatusToFlairTemplates } from '../flairs';
import type { FlairTemplate } from '../flairs';

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID!;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET!;
const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT!;

async function ensureFlairTemplatesExist(
  subreddit: Snoowrap.Subreddit
): Promise<Record<string, FlairTemplate>> {
  const availableFlairTemplates = await getStatusToFlairTemplates(subreddit);

  const missingFlairs = Object.keys(StatusToTemplateClass).filter(
    (k) => !(k in availableFlairTemplates)
  );
  if (missingFlairs.length > 0) {
    throw new Error(`Missing flair templates for ${missingFlairs.join(', ')}`);
  }
  return availableFlairTemplates;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const flair = searchParams.get('flair');
  const accessToken = searchParams.get('access_token');

  if (!flair || !accessToken) {
    return NextResponse.json({ error: 'Missing flair or access token' }, { status: 400 });
  }

  const authData = await getAuthData(request);

  if (!authData.residentialStatus) {
    return NextResponse.json({ error: 'Missing residential status' }, { status: 400 });
  }

  try {
    // Initialize Reddit client
    const reddit = new Snoowrap({
      userAgent: REDDIT_USER_AGENT,
      clientId: REDDIT_CLIENT_ID,
      clientSecret: REDDIT_CLIENT_SECRET,
      accessToken,
    });
    const targetSubreddit = authData.targetSubreddit;

    // Set the user's flair in the subreddit
    const subreddit: Snoowrap.Subreddit = await (reddit.getSubreddit as any)(targetSubreddit);

    const flairTemplates = await ensureFlairTemplatesExist(subreddit);

    const flairToSet = flairTemplates[authData.residentialStatus || ''];

    if (flairToSet) {
      await (subreddit.setMultipleUserFlairs as any)([
        {
          name: authData.redditUsername,
          text: flairToSet?.flair_text,
          cssClass: flairToSet?.flair_css_class,
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
