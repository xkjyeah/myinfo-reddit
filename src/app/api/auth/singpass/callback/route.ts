import { NextRequest, NextResponse } from 'next/server';

// import * as oidClient from 'openid-client';

import { getClient } from '../keys';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code and state from query parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    // Get stored state and code verifier from cookies
    const storedState = request.cookies.get('auth_state')?.value;
    const codeVerifier = request.cookies.get('code_verifier')?.value;
    const nonce = request.cookies.get('nonce')?.value;

    // Validate state
    if (!code || !storedState || !nonce || !state || state !== storedState) {
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
    }

    const client = await getClient();

    console.log(Object.fromEntries(searchParams.entries()));
    debugger;

    const tokenSet = await client.callback(
      process.env.MYINFO_APP_REDIRECT_URL!,
      Object.fromEntries(searchParams.entries()),
      {
        code_verifier: codeVerifier,
        nonce,
        state,
      }
    );
    debugger;

    const userInfo = await client.userinfo(tokenSet);
    console.log(userInfo);

    console.log('User Info', userInfo);

    // Create response
    const response = NextResponse.json(userInfo);

    // Clear auth cookies
    response.cookies.delete('auth_state');
    response.cookies.delete('code_verifier');

    // Set session cookie with user info
    response.cookies.set('session', JSON.stringify(userInfo), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.log('Whtf');
    debugger;
    // console.error('Callback error:', error.stack);
    // console.log(error.cause);
    return NextResponse.json(
      { error: 'Failed to process callback', message: (error as Error).message },
      { status: 500 }
    );
  }
}
