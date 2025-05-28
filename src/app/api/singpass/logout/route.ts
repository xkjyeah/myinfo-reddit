import { NextRequest, NextResponse } from 'next/server';

import { constructForwardedForUrl } from '../../util';

export async function GET(request: NextRequest) {
  // Create response redirecting to home
  const response = NextResponse.redirect(constructForwardedForUrl(request, { pathname: '/' }));

  // Clear all auth cookies
  response.cookies.delete('auth_state');
  response.cookies.delete('code_verifier');
  response.cookies.delete('session');

  return response;
}
