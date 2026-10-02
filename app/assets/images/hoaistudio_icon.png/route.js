const SOURCE = 'https://raw.githubusercontent.com/hoaidangllc/hoaidang/main/assets/images/hoaistudio_icon.png';

export const revalidate = 86400;

export async function GET() {
  const response = await fetch(SOURCE, { next: { revalidate: 86400 } });

  if (!response.ok) {
    return new Response('Logo unavailable', { status: 502 });
  }

  return new Response(await response.arrayBuffer(), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
