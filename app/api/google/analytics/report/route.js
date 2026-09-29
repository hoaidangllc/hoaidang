import { NextResponse } from 'next/server';

const PROPERTY_ID = '553973685';
const GSC_SITE = 'sc-domain:phonenumbersale.com';

async function getStoredConnection() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) throw new Error('Server storage is not configured');
  const r = await fetch(`${base}/rest/v1/server_integrations?provider=eq.google_analytics&select=refresh_token,ga4_property_id,gsc_site_url&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store'
  });
  if (!r.ok) throw new Error('Could not read stored Google connection');
  const rows = await r.json();
  if (!rows[0]?.refresh_token) throw new Error('Google refresh token is not stored');
  return rows[0];
}

async function getAccessToken(refreshToken) {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: process.env.GOOGLE_ANALYTICS_CLIENT_ID || '', client_secret: process.env.GOOGLE_ANALYTICS_CLIENT_SECRET || '', refresh_token: refreshToken, grant_type: 'refresh_token' }),
    cache: 'no-store'
  });
  const data = await r.json();
  if (!r.ok || !data.access_token) throw new Error('Could not refresh Google access token');
  return data.access_token;
}

async function ga4(accessToken, body) {
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`, {
    method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store'
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`GA4: ${data?.error?.message || r.status}`);
  return data;
}

async function gsc(accessToken, body) {
  const r = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/searchAnalytics/query`, {
    method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store'
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`GSC: ${data?.error?.message || r.status}`);
  return data;
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const days = Math.min(Math.max(Number(url.searchParams.get('days') || 7), 1), 90);
    const connection = await getStoredConnection();
    const accessToken = await getAccessToken(connection.refresh_token);
    const dateRanges = [{ startDate: `${days}daysAgo`, endDate: 'today' }];
    const [summary, channels, pages, search] = await Promise.all([
      ga4(accessToken, { dateRanges, metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }, { name: 'engagedSessions' }] }),
      ga4(accessToken, { dateRanges, dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }, { name: 'activeUsers' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 10 }),
      ga4(accessToken, { dateRanges, dimensions: [{ name: 'landingPagePlusQueryString' }], metrics: [{ name: 'sessions' }, { name: 'activeUsers' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 15 }),
      gsc(accessToken, { startDate: new Date(Date.now() - days * 86400000).toISOString().slice(0,10), endDate: new Date().toISOString().slice(0,10), dimensions: ['query'], rowLimit: 25 })
    ]);
    return NextResponse.json({ ok: true, site: 'PhoneNumberSale.com', days, propertyId: PROPERTY_ID, gscSite: GSC_SITE, ga4: { summary, channels, landingPages: pages }, gsc: { queries: search.rows || [] } }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500, headers: { 'Cache-Control': 'private, no-store' } });
  }
}
