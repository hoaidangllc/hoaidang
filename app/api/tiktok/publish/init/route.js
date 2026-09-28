import { NextResponse } from 'next/server';
import { createClient } from '../../../../../lib/supabase/server';

function uploadPlan(size) {
  const MB = 1024 * 1024;
  if (size <= 64 * MB) return { chunk_size: size, total_chunk_count: 1 };
  const chunkSize = 32 * MB;
  return { chunk_size: chunkSize, total_chunk_count: Math.floor(size / chunkSize) };
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data: connection } = await supabase.from('tiktok_connections').select('access_token').eq('user_id', user.id).maybeSingle();
  if (!connection?.access_token) return NextResponse.json({ error: 'not_connected' }, { status: 409 });

  const input = await request.json();
  const size = Number(input.video_size);
  if (!Number.isSafeInteger(size) || size <= 0) return NextResponse.json({ error: 'invalid_video_size' }, { status: 400 });
  const privacy = String(input.privacy_level || '');
  if (!privacy) return NextResponse.json({ error: 'privacy_selection_required' }, { status: 400 });
  const title = String(input.title || '').slice(0, 2200);
  const plan = uploadPlan(size);
  const payload = {
    post_info: {
      title,
      privacy_level: privacy,
      disable_comment: Boolean(input.disable_comment),
      disable_duet: Boolean(input.disable_duet),
      disable_stitch: Boolean(input.disable_stitch),
      brand_content_toggle: Boolean(input.brand_content_toggle),
      brand_organic_toggle: Boolean(input.brand_organic_toggle),
      is_aigc: Boolean(input.is_aigc),
    },
    source_info: { source: 'FILE_UPLOAD', video_size: size, ...plan },
  };
  const response = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method: 'POST',
    headers: { Authorization: `Bearer ${connection.access_token}`, 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(payload), cache: 'no-store',
  });
  const result = await response.json();
  if (response.ok && result?.data) result.data.upload_plan = plan;
  return NextResponse.json(result, { status: response.ok ? 200 : response.status });
}
