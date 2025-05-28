import { NextRequest, NextResponse } from 'next/server';

import { getAuthData } from '../auth/session';

export async function GET(request: NextRequest) {
  const authData = await getAuthData(request);

  return NextResponse.json({
    residentialStatus: authData.residentialStatus,
    redditUsername: authData.redditUsername,
    targetSubreddit: authData.targetSubreddit,
  });
}
