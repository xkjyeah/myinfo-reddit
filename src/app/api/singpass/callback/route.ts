import { get } from 'lodash';
import { NextRequest, NextResponse } from 'next/server';
import * as oidClient from 'openid-client';

import { getAuthData, setAuthData } from '../../auth/session';
import { getConfiguration } from '../keys';

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

    const configuration = await getConfiguration();

    const tokenSet = await oidClient
      .authorizationCodeGrant(configuration, new URL(request.url), {
        pkceCodeVerifier: codeVerifier,
        expectedState: storedState,
        expectedNonce: nonce,
      })
      .catch((e) => {
        console.log('Failed to get access token', e.message);
        throw e;
      });

    // If we ever want to store the entire JWT token (e.g. for *provable*
    // identity verification). But doing so runs the risk of deanonymizing
    // the reddit user based on the sub, timestamps and the government's internal server
    // logs. Therefore, for now, we do not store the timestamp
    //
    // Exchange code for Person tokens
    // const userInfoResponse = await oidClient.fetchProtectedResource(
    //   configuration,
    //   tokenSet.access_token,
    //   // tokenSet.claims()?.sub!
    //   new URL(configuration.serverMetadata().userinfo_endpoint!),
    //   'GET'
    // );
    // const userInfoText = await userInfoResponse.text();

    // console.log(userInfoText);

    // // Decrypt JWE, TODO: should verify kid
    // const decrypted = await jose.compactDecrypt(userInfoText, await ourPrivateEncKey());
    // // Decode signed JWT. TODO: should verify kid and signature

    const sub = tokenSet.claims()?.sub;
    const userInfo = await oidClient
      .fetchUserInfo(configuration, tokenSet.access_token, sub!)
      .catch((e) => {
        console.log('Failed to get user info', e.message);
        throw e;
      });

    // Create response
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/reddit-auth';
    const response = NextResponse.redirect(redirectUrl);

    // Clear auth cookies
    response.cookies.delete('auth_state');
    response.cookies.delete('code_verifier');
    response.cookies.delete('nonce');

    // Set session cookie with user info
    await setAuthData(
      response,
      {
        ...(await getAuthData(request)),
        residentialStatus: get(userInfo, 'residentialstatus.code') as string,
      },
      60 * 5 * 1000
    );

    return response;
  } catch (error) {
    console.error('Callback error:', error, (error as Error).message);
    console.log((error as Error).cause);
    return NextResponse.json(
      { error: 'Failed to process callback', message: (error as Error).message },
      { status: 500 }
    );
  }
}
