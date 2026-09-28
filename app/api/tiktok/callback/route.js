import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const error = requestUrl.searchParams.get('error');
  const cookieStore = await cookies();
  const expectedState = cookieStore.get('tiktok_oauth_state')?.value;
  cookieStore.delete('tiktok_oauth_state');

  if (error) return NextResponse.redirect(new URL(`/dashboard?tiktok_error=${encodeURIComponent(error)}`, requestUrl.origin));
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL('/dashboard?tiktok_error=invalid_oauth_state', requestUrl.origin));
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI || `${requestUrl.origin}/api/tiktok/callback`;
  if (!clientKey || !clientSecret) return NextResponse.redirect(new URL('/dashboard?tiktok_error=not_configured', requestUrl.origin));

  const body = new URLSearchParams({ client_key: clientKey, client_secret: clientSecret, code, grant_type: 'authorization_code', redirect_uri: redirectUri });
  const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });
  const token = await tokenResponse.json();
  if (!tokenResponse.ok || !token.access_token) return NextResponse.redirect(new URL(`/dashboard?tiktok_error=${encodeURIComponent(token.error || 'token_exchange_failed')}`, requestUrl.origin));

  // Token persistence is intentionally added only after the authenticated-user storage table is provisioned.
  // Never expose TikTok access or refresh tokens to the browser.
  return NextResponse.redirect(new URL('/dashboard?tiktok=authorized', requestUrl.origin));
}
