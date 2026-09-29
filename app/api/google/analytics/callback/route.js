import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

function page(title, body, ok = false) {
  return new NextResponse(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{font-family:system-ui,-apple-system,sans-serif;background:#090b10;color:#f5f7fa;margin:0;padding:48px}main{max-width:760px;margin:auto;background:#11151d;border:1px solid #293142;border-radius:18px;padding:32px}h1{margin-top:0;color:${ok ? '#62d394' : '#ff7b7b'}}code{background:#1a2030;padding:3px 7px;border-radius:6px}li{margin:10px 0}</style></head><body><main><h1>${title}</h1>${body}</main></body></html>`, { status: ok ? 200 : 400, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const error = requestUrl.searchParams.get('error');
  const cookieStore = await cookies();
  const expectedState = cookieStore.get('google_analytics_oauth_state')?.value;
  cookieStore.delete('google_analytics_oauth_state');

  if (error) return page('Google authorization failed', `<p>${error}</p>`);
  if (!code || !state || !expectedState || state !== expectedState) return page('Google authorization failed', '<p>Invalid OAuth state. Start the connection again.</p>');

  const clientId = process.env.GOOGLE_ANALYTICS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ANALYTICS_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_ANALYTICS_REDIRECT_URI || `${requestUrl.origin}/api/google/analytics/callback`;
  if (!clientId || !clientSecret) return page('Google authorization failed', '<p>OAuth credentials are missing in Vercel.</p>');

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code, grant_type: 'authorization_code', redirect_uri: redirectUri }),
    cache: 'no-store',
  });
  const token = await tokenResponse.json();
  if (!tokenResponse.ok || !token.access_token) {
    const detail = token.error_description || token.error || 'token_exchange_failed';
    return page('Google token exchange failed', `<p>${detail}</p><p>Check the Client ID, Client Secret and exact redirect URI in Google Cloud and Vercel.</p>`);
  }

  const headers = { Authorization: `Bearer ${token.access_token}` };
  const [analyticsResponse, searchConsoleResponse] = await Promise.all([
    fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries', { headers, cache: 'no-store' }),
    fetch('https://www.googleapis.com/webmasters/v3/sites', { headers, cache: 'no-store' }),
  ]);
  const analytics = await analyticsResponse.json();
  const searchConsole = await searchConsoleResponse.json();

  const properties = (analytics.accountSummaries || []).flatMap((account) =>
    (account.propertySummaries || []).map((property) => `${property.displayName || property.property} (${property.property})`)
  );
  const sites = (searchConsole.siteEntry || []).map((site) => `${site.siteUrl} — ${site.permissionLevel}`);

  return page('Google Analytics + Search Console connected', `
    <p>OAuth credentials and both read-only scopes are working.</p>
    <p><strong>Refresh token:</strong> ${token.refresh_token ? 'received' : 'not returned'}</p>
    <h2>GA4 properties visible</h2><ul>${properties.length ? properties.map((x) => `<li>${x}</li>`).join('') : '<li>None visible to this Google account.</li>'}</ul>
    <h2>Search Console properties visible</h2><ul>${sites.length ? sites.map((x) => `<li>${x}</li>`).join('') : '<li>None visible to this Google account.</li>'}</ul>
    <p>This test intentionally does not display or store access/refresh tokens.</p>
  `, true);
}
