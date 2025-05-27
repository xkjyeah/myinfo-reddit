import { NextRequest, NextResponse } from 'next/server';

import { saveTargetSubreddit } from '../../auth/session';

export async function POST(request: NextRequest) {
  const { targetSubreddit } = Object.fromEntries((await request.formData()).entries());

  if (!targetSubreddit || typeof targetSubreddit !== 'string') {
    return NextResponse.json({ error: 'Missing target subreddit' }, { status: 400 });
  }

  const response = NextResponse.json({});
  await saveTargetSubreddit(request, response, targetSubreddit.toString());
  return response;
}
