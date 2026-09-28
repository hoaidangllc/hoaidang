import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '../../../../lib/supabase/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const error = requestUrl.searchParams.get('error');
  const cookieStore = await cookies();
  const expectedState = cookieStore.get('tiktok_oauth_state')?.value;
  cookieStore.delete('tiktok_oauth_state');

  if (error) return NextResponse.redirect(new URL(`/dashboard?tiktok_error=${encodeURIComponent(error)}`, requestUrl.origin));
  if (!code || !state || !expectedState || state !== expectedState) return NextResponse.redirect(new URL('/dashboard?tiktok_error=invalid_oauth_state', requestUrl.origin));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login?next=/dashboard', requestUrl.origin));

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI || `${requestUrl.origin}/api/tiktok/callback`;
  if (!clientKey || !clientSecret) return NextResponse.redirect(new URL('/dashboard?tiktok_error=not_configured', requestUrl.origin));

  const body = new URLSearchParams({ client_key: clientKey, client_secret: clientSecret, code, grant_type: 'authorization_code', redirect_uri: redirectUri });
  const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body, cache: 'no-store' });
  const token = await tokenResponse.json();
  if (!tokenResponse.ok || !token.access_token) return NextResponse.redirect(new URL(`/dashboard?tiktok_error=${encodeURIComponent(token.error || 'token_exchange_failed')}`, requestUrl.origin));

  const now = Date.now();
  const { error: saveError } = await supabase.from('tiktok_connections').upsert({
    user_id: user.id,
    open_id: token.open_id,
    access_token: token.access_token,
    refresh_token: token.refresh_token || null,
    scope: token.scope || null,
    access_token_expires_at: token.expires_in ? new Date(now + Number(token.expires_in) * 1000).toISOString() : null,
    refresh_token_expires_at: token.refresh_expires_in ? new Date(now + Number(token.refresh_expires_in) * 1000).toISOString() : null,
    connected_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (saveError) return NextResponse.redirect(new URL('/dashboard?tiktok_error=connection_save_failed', requestUrl.origin));

  return NextResponse.redirect(new URL('/dashboard?tiktok=authorized', requestUrl.origin));
}
