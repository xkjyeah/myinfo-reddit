import { NextResponse } from 'next/server';

export async function GET() {
  // Create response redirecting to home
  const response = NextResponse.redirect('/');

  // Clear all auth cookies
  response.cookies.delete('auth_state');
  response.cookies.delete('code_verifier');
  response.cookies.delete('session');

  return response;
}
