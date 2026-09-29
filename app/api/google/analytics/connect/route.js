import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request) {
  const clientId = process.env.GOOGLE_ANALYTICS_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'Google Analytics connection is not configured yet.' }, { status: 503 });
  }

  const origin = new URL(request.url).origin;
  const redirectUri = process.env.GOOGLE_ANALYTICS_REDIRECT_URI || `${origin}/api/google/analytics/callback`;
  const state = crypto.randomBytes(24).toString('hex');

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', [
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly',
  ].join(' '));
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('include_granted_scopes', 'true');
  url.searchParams.set('state', state);

  const response = NextResponse.redirect(url);
  response.cookies.set('google_analytics_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return response;
}
