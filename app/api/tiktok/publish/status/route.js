import { NextResponse } from 'next/server';
import { createClient } from '../../../../../lib/supabase/server';

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data: connection } = await supabase.from('tiktok_connections').select('access_token').eq('user_id', user.id).maybeSingle();
  if (!connection?.access_token) return NextResponse.json({ error: 'not_connected' }, { status: 409 });
  const { publish_id } = await request.json();
  if (!publish_id) return NextResponse.json({ error: 'missing_publish_id' }, { status: 400 });
  const response = await fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
    method: 'POST',
    headers: { Authorization: `Bearer ${connection.access_token}`, 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({ publish_id }), cache: 'no-store',
  });
  const result = await response.json();
  return NextResponse.json(result, { status: response.ok ? 200 : response.status });
}
