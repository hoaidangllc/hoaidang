import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { logout } from '../auth/actions';
export const metadata={title:'Workspace'};

export default async function Dashboard({searchParams}){
  const params=await searchParams;
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/login');
  const name=user.user_metadata?.display_name||user.email?.split('@')[0]||'Your workspace';
  const initial=name.slice(0,1).toUpperCase();
  const authorized=params?.tiktok==='authorized';
  const oauthError=params?.tiktok_error;
  return <main className="dash"><aside className="dashSide"><Link className="brand" href="/">Hoai<span>Studio</span></Link><nav><b>Workspace</b><span className="active">Overview</span><span>TikTok</span><span>Content</span><span>Connected accounts</span><span>Settings</span></nav><div className="dashUser"><span className="avatar">{initial}</span><div><b>{name}</b><span>{user.email}</span></div></div></aside><section className="dashMain"><header><div><small>WORKSPACE</small><h1>Good to see you, {name}.</h1></div><form action={logout}><button type="submit">Log out</button></form></header>{authorized&&<div className="authNotice">TikTok authorization completed. Account storage will be enabled with the publishing integration.</div>}{oauthError&&<div className="authError">TikTok connection could not be completed. Please try again.</div>}<div className="connectCard"><div className="ttMark">♪</div><div><small>TIKTOK</small><h2>Connect TikTok to begin publishing.</h2><p>Authorize your TikTok account to load creator information, available privacy settings and publishing controls.</p></div><a className="connectButton" href="/api/tiktok/connect">Connect TikTok</a></div><h3 className="dashTitle">Your tools</h3><div className="toolGrid"><article><span className="toolIcon">♪</span><div><b>TikTok Publishing</b><p>Connect an authorized account to continue.</p></div><em>READY TO CONNECT</em></article><article className="locked"><span className="toolIcon">▶</span><div><b>Video Studio</b><p>Creation tools are planned for a future release.</p></div><em>COMING SOON</em></article><article className="locked"><span className="toolIcon">＋</span><div><b>More platforms</b><p>Additional publishing workflows are on the roadmap.</p></div><em>COMING SOON</em></article></div><div className="note"><b>You stay in control.</b><p>HoaiStudio does not publish to a social account until it has been authorized and you initiate the available publishing workflow.</p></div></section></main>}
