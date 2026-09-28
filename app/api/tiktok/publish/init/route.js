import { NextResponse } from 'next/server';
import { createClient } from '../../../../../lib/supabase/server';

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data: connection } = await supabase.from('tiktok_connections').select('access_token').eq('user_id', user.id).maybeSingle();
  if (!connection?.access_token) return NextResponse.json({ error: 'not_connected' }, { status: 409 });

  const input = await request.json();
  const size = Number(input.video_size);
  if (!Number.isFinite(size) || size <= 0) return NextResponse.json({ error: 'invalid_video_size' }, { status: 400 });
  const privacy = String(input.privacy_level || 'SELF_ONLY');
  const title = String(input.title || '').slice(0, 2200);
  const payload = {
    post_info: {
      title,
      privacy_level: privacy,
      disable_comment: Boolean(input.disable_comment),
      disable_duet: Boolean(input.disable_duet),
      disable_stitch: Boolean(input.disable_stitch),
      brand_organic_toggle: Boolean(input.brand_organic_toggle),
      is_aigc: Boolean(input.is_aigc),
    },
    source_info: { source: 'FILE_UPLOAD', video_size: size, chunk_size: size, total_chunk_count: 1 },
  };
  const response = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method: 'POST',
    headers: { Authorization: `Bearer ${connection.access_token}`, 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(payload), cache: 'no-store',
  });
  const result = await response.json();
  return NextResponse.json(result, { status: response.ok ? 200 : response.status });
}
