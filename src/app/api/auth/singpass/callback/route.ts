import { NextRequest, NextResponse } from 'next/server';
import * as oidClient from 'openid-client';

import { getConfiguration } from '../keys';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code and state from query parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    // Get stored state and code verifier from cookies
    const storedState = request.cookies.get('auth_state')?.value;
    const codeVerifier = request.cookies.get('code_verifier')?.value;
    const nonce = request.cookies.get('nonce')?.value;

    // Validate state
    if (!code || !storedState || !nonce) {
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
    }

    const configuration = await getConfiguration();

    const tokenSet = await oidClient.authorizationCodeGrant(configuration, new URL(request.url), {
      pkceCodeVerifier: codeVerifier,
      expectedState: storedState,
      expectedNonce: nonce,
    });

    // Exchange code for tokens
    const userInfoResponse = await oidClient.fetchProtectedResource(
      configuration,
      tokenSet.access_token,
      new URL(configuration.serverMetadata().userinfo_endpoint!),
      'GET'
    );

    if (!userInfoResponse.ok) {
      throw new Error(`Token endpoint error: ${userInfoResponse.statusText}`);
    }

    const userInfo = await userInfoResponse.json();

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
    console.error('Callback error:', error);
    return NextResponse.json({ error: 'Failed to process callback' }, { status: 500 });
  }
}
