import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase/server';

const OWNER_EMAIL = 'ddh2755@gmail.com';

export const metadata = { title: 'Analytics | HoaiStudio' };

function value(report, index) {
  return report?.rows?.[0]?.metricValues?.[index]?.value || '0';
}

export default async function AnalyticsPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  if ((user.email || '').toLowerCase() !== OWNER_EMAIL) redirect('/dashboard');

  const site = params?.site === 'annie' ? 'annie' : 'pns';
  const days = Math.min(Math.max(Number(params?.days || 7), 1), 90);
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://hoaidang.com';

  let data = null;
  let error = null;
  try {
    const r = await fetch(`${base}/api/google/analytics/report?site=${site}&days=${days}&internal=1`, {
      headers: { 'x-hoai-owner': OWNER_EMAIL },
      cache: 'no-store'
    });
    data = await r.json();
    if (!r.ok || !data?.ok) error = data?.error || `Report failed (${r.status})`;
  } catch (e) {
    error = e.message;
  }

  const summary = data?.ga4?.summary;
  const channels = data?.ga4?.channels?.rows || [];
  const pages = data?.ga4?.landingPages?.rows || [];

  return <main style={{maxWidth:1100,margin:'0 auto',padding:'40px 24px',fontFamily:'system-ui'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap'}}>
      <div><small>OWNER ONLY</small><h1 style={{margin:'6px 0'}}>Analytics</h1><p style={{margin:0}}>GA4 reports for your properties.</p></div>
      <Link href="/dashboard">← Workspace</Link>
    </div>
    <div style={{display:'flex',gap:10,margin:'28px 0',flexWrap:'wrap'}}>
      <Link href={`/dashboard/analytics?site=pns&days=${days}`}>PhoneNumberSale</Link>
      <Link href={`/dashboard/analytics?site=annie&days=${days}`}>Annie's Nails</Link>
      <span>•</span><Link href={`/dashboard/analytics?site=${site}&days=1`}>1 day</Link><Link href={`/dashboard/analytics?site=${site}&days=7`}>7 days</Link><Link href={`/dashboard/analytics?site=${site}&days=30`}>30 days</Link>
    </div>
    {error ? <div style={{padding:18,border:'1px solid currentColor',borderRadius:12}}><b>Report unavailable</b><p>{error}</p></div> : <>
      <h2>{data?.site} · last {days} day{days===1?'':'s'}</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,margin:'20px 0 32px'}}>
        {[['Active users',value(summary,0)],['Sessions',value(summary,1)],['Page views',value(summary,2)],['Engaged sessions',value(summary,3)]].map(([k,v])=><div key={k} style={{padding:18,border:'1px solid #4444',borderRadius:12}}><small>{k}</small><div style={{fontSize:30,fontWeight:700,marginTop:6}}>{v}</div></div>)}
      </div>
      <h3>Traffic channels</h3>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr><th align="left">Channel</th><th align="right">Sessions</th><th align="right">Users</th></tr></thead><tbody>{channels.map((r,i)=><tr key={i}><td style={{padding:'8px 0'}}>{r.dimensionValues?.[0]?.value}</td><td align="right">{r.metricValues?.[0]?.value}</td><td align="right">{r.metricValues?.[1]?.value}</td></tr>)}</tbody></table></div>
      <h3 style={{marginTop:30}}>Landing pages</h3>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr><th align="left">Page</th><th align="right">Sessions</th><th align="right">Users</th></tr></thead><tbody>{pages.map((r,i)=><tr key={i}><td style={{padding:'8px 0'}}>{r.dimensionValues?.[0]?.value}</td><td align="right">{r.metricValues?.[0]?.value}</td><td align="right">{r.metricValues?.[1]?.value}</td></tr>)}</tbody></table></div>
    </>}
  </main>;
}
