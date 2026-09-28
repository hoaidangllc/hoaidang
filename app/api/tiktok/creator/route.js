import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data: connection } = await supabase.from('tiktok_connections').select('access_token,scope').eq('user_id', user.id).maybeSingle();
  if (!connection?.access_token) return NextResponse.json({ error: 'not_connected' }, { status: 409 });

  const response = await fetch('https://open.tiktokapis.com/v2/post/publish/creator_info/query/', {
    method: 'POST',
    headers: { Authorization: `Bearer ${connection.access_token}`, 'Content-Type': 'application/json; charset=UTF-8' },
    body: '{}',
    cache: 'no-store',
  });
  const payload = await response.json();
  return NextResponse.json(payload, { status: response.ok ? 200 : response.status });
}
