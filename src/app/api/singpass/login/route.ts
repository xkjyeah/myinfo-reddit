import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import * as oidClient from 'openid-client';

import { getAuthData, setAuthData } from '../../auth/session';
import { getConfiguration } from '../oidConfiguration';

export async function GET(request: NextRequest) {
  try {
    // Generate code verifier
    const codeVerifier = await oidClient.randomPKCECodeVerifier();

    // Generate code challenge
    const codeChallenge = await oidClient.calculatePKCECodeChallenge(codeVerifier);

    // Generate state
    const state = crypto.randomBytes(16).toString('hex');

    // Generate nonce
    const nonce = crypto.randomBytes(16).toString('hex');

    // Build authorization URL
    const authUrl = oidClient.buildAuthorizationUrl(await getConfiguration(), {
      response_type: 'code',
      scope: 'openid residentialstatus',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      redirect_uri: process.env.MYINFO_APP_REDIRECT_URL!,
      state,
      nonce,
    });

    // Create response with cookies
    const response = NextResponse.redirect(authUrl.toString());

    // Subreddit from search params -- if it exists, add it to the authData
    const { searchParams } = new URL(request.url);
    const subreddit = searchParams.get('subreddit');
    if (subreddit) {
      await setAuthData(
        response,
        {
          ...(await getAuthData(request)),
          targetSubreddit: subreddit,
        },
        60 * 5e3
      );
    }

    // Set cookies with the response
    response.cookies.set('code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });

    response.cookies.set('auth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });

    // Save the nonce too
    response.cookies.set('nonce', nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Failed to initiate login' }, { status: 500 });
  }
}
