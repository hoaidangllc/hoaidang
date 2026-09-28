import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { logout } from '../auth/actions';
import Brand from '../components/Brand';
export const metadata={title:'Workspace'};

export default async function Dashboard({searchParams}){
  const params=await searchParams;
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/login');
  const {data:connection}=await supabase.from('tiktok_connections').select('open_id,scope,connected_at,access_token_expires_at').eq('user_id',user.id).maybeSingle();
  const connected=Boolean(connection);
  const name=user.user_metadata?.display_name||user.email?.split('@')[0]||'Your workspace';
  const initial=name.slice(0,1).toUpperCase();
  const authorized=params?.tiktok==='authorized';
  const oauthError=params?.tiktok_error;
  return <main className="dash"><aside className="dashSide"><Brand/><nav><b>WORKSPACE</b><span className="active">Overview</span><span>TikTok</span><span>Content</span><span>Connected accounts</span><span>Settings</span></nav><div className="dashUser"><span className="avatar">{initial}</span><div><b>{name}</b><span>{user.email}</span></div></div></aside><section className="dashMain"><header><div><small>CREATOR WORKSPACE</small><h1>Welcome back, {name}.</h1><p>Manage your connections and publishing workflow from one place.</p></div><form action={logout}><button type="submit">Log out</button></form></header>{authorized&&connected&&<div className="authNotice">TikTok authorization completed. Your creator connection is saved and ready.</div>}{oauthError&&<div className="authError">TikTok connection could not be completed ({oauthError}). Please try again.</div>}<div className="connectCard"><div className="ttMark">♪</div><div><small>PRIMARY CONNECTION</small><h2>{connected?'TikTok is connected.':'Connect your TikTok account.'}</h2><p>{connected?'Your authorized TikTok creator connection is stored securely. Publishing remains a separate, creator-initiated action.':'Authorize TikTok to load creator information and the posting options available to your account. Connecting does not publish anything.'}</p></div>{connected?<span className="connectButton">Connected ✓</span>:<a className="connectButton" href="/api/tiktok/connect">Connect TikTok →</a>}</div><h3 className="dashTitle">Workspace tools</h3><div className="toolGrid"><article><span className="toolIcon">♪</span><div><b>TikTok Publishing</b><p>Review creator identity, content and posting settings before submission.</p></div><em>{connected?'CONNECTED':'READY TO CONNECT'}</em></article><article className="locked"><span className="toolIcon">▶</span><div><b>Video Studio</b><p>Original-content preparation tools will arrive in a future release.</p></div><em>COMING SOON</em></article><article className="locked"><span className="toolIcon">＋</span><div><b>More platforms</b><p>Additional authorized publishing workflows are planned.</p></div><em>COMING SOON</em></article></div><div className="note"><b>Publishing stays creator initiated.</b><p>Authorization and publication are separate actions. HoaiStudio only starts a publishing request when you explicitly submit prepared content.</p></div></section></main>}
