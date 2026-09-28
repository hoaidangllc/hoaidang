import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  if (!clientKey) return NextResponse.json({ error: 'TikTok connection is not configured yet.' }, { status: 503 });

  const origin = new URL(request.url).origin;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI || `${origin}/api/tiktok/callback`;
  const state = crypto.randomBytes(24).toString('hex');
  const scopes = ['user.info.basic', 'video.publish'];
  const url = new URL('https://www.tiktok.com/v2/auth/authorize/');
  url.searchParams.set('client_key', clientKey);
  url.searchParams.set('scope', scopes.join(','));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);

  const response = NextResponse.redirect(url);
  response.cookies.set('tiktok_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return response;
}
