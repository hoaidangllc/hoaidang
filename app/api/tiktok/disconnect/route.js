import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url), 303);

  const { data: connection, error: readError } = await supabase
    .from('tiktok_connections')
    .select('access_token')
    .eq('user_id', user.id)
    .maybeSingle();

  if (readError) return NextResponse.redirect(new URL('/dashboard?tiktok_error=disconnect_read_failed', request.url), 303);
  if (!connection) return NextResponse.redirect(new URL('/dashboard?tiktok=disconnected', request.url), 303);

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  if (!clientKey || !clientSecret) return NextResponse.redirect(new URL('/dashboard?tiktok_error=not_configured', request.url), 303);

  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    token: connection.access_token,
  });

  const revokeResponse = await fetch('https://open.tiktokapis.com/v2/oauth/revoke/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });

  if (!revokeResponse.ok) {
    return NextResponse.redirect(new URL('/dashboard?tiktok_error=disconnect_revoke_failed', request.url), 303);
  }

  const { error: deleteError } = await supabase
    .from('tiktok_connections')
    .delete()
    .eq('user_id', user.id);

  if (deleteError) return NextResponse.redirect(new URL('/dashboard?tiktok_error=disconnect_delete_failed', request.url), 303);

  return NextResponse.redirect(new URL('/dashboard?tiktok=disconnected', request.url), 303);
}
