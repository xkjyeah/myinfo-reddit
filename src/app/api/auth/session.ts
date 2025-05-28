import * as crypto from 'crypto';
import * as jose from 'jose';
import { NextRequest, NextResponse } from 'next/server';

// Use pbkdf2 to derive a key
const key = await crypto.pbkdf2Sync(
  new TextEncoder().encode(process.env.SESSION_KEY!),
  new TextEncoder().encode('reddit-myinfo'),
  1000,
  32,
  'sha256'
);

export async function saveTargetSubreddit(
  request: NextRequest,
  response: NextResponse,
  subreddit: string
) {
  await setAuthData(
    response,
    {
      ...(await getAuthData(request)),
      targetSubreddit: subreddit,
    },
    60 * 5 * 1000
  );
}

export async function getAuthData(request: NextRequest): Promise<{
  redditUsername?: string;
  targetSubreddit?: string;
  residentialStatus?: string;
}> {
  const cookieData = request.cookies.get('auth');

  if (!cookieData) {
    console.log('No cookie data');
    return {};
  }

  // Decode as JWT
  try {
    const data = await jose.jwtVerify(cookieData.value, key, {
      algorithms: ['HS256'],
    });

    return data.payload as Record<string, string>;
  } catch (error) {
    console.error('Could not verify cookie data as JWT', error);
    return {};
  }
}

export async function setAuthData(
  response: NextResponse,
  data: {
    redditUsername?: string;
    targetSubreddit?: string;
    residentialStatus?: string;
  },
  expiresInMs: number
) {
  const jwt = await new jose.SignJWT(data)
    .setExpirationTime(new Date(Date.now() + expiresInMs))
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .sign(key);

  response.cookies.set('auth', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(Date.now() + expiresInMs),
  });
}
