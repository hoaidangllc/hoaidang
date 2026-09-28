'use client';

import { useEffect, useMemo, useState } from 'react';

const label = { PUBLIC_TO_EVERYONE:'Public', MUTUAL_FOLLOW_FRIENDS:'Friends', FOLLOWER_OF_CREATOR:'Followers', SELF_ONLY:'Only me' };

async function jsonFetch(url, options) {
  const r = await fetch(url, options);
  const j = await r.json().catch(()=>({}));
  if (!r.ok || (j.error?.code && j.error.code !== 'ok')) throw new Error(j.error?.message || j.error?.code || j.error || `Request failed (${r.status})`);
  return j;
}

export default function TikTokPublisher(){
  const [creator,setCreator]=useState(null), [loading,setLoading]=useState(true), [error,setError]=useState('');
  const [file,setFile]=useState(null), [title,setTitle]=useState(''), [privacy,setPrivacy]=useState('');
  const [comment,setComment]=useState(true), [duet,setDuet]=useState(true), [stitch,setStitch]=useState(true);
  const [brand,setBrand]=useState(false), [aigc,setAigc]=useState(false), [consent,setConsent]=useState(false);
  const [busy,setBusy]=useState(false), [progress,setProgress]=useState(0), [publishId,setPublishId]=useState(''), [status,setStatus]=useState('');
  useEffect(()=>{(async()=>{try{const j=await jsonFetch('/api/tiktok/creator',{cache:'no-store'}); const c=j.data; setCreator(c); const opts=c?.privacy_level_options||[]; setPrivacy(opts.includes('SELF_ONLY')?'SELF_ONLY':(opts[0]||'')); setComment(!c?.comment_disabled); setDuet(!c?.duet_disabled); setStitch(!c?.stitch_disabled);}catch(e){setError(e.message)}finally{setLoading(false)}})()},[]);
  const maxDuration=creator?.max_video_post_duration_sec;
  const ready=useMemo(()=>Boolean(file&&privacy&&consent&&!busy),[file,privacy,consent,busy]);

  async function uploadChunks(uploadUrl, plan){
    const chunk=plan.chunk_size, count=plan.total_chunk_count, total=file.size;
    let start=0;
    for(let i=0;i<count;i++){
      const isLast=i===count-1;
      const end=isLast?total:Math.min(start+chunk,total);
      const blob=file.slice(start,end);
      const r=await fetch(uploadUrl,{method:'PUT',headers:{'Content-Type':file.type||'video/mp4','Content-Length':String(blob.size),'Content-Range':`bytes ${start}-${end-1}/${total}`},body:blob});
      if(!(r.status===206||r.status===201||r.ok)) throw new Error(`TikTok upload failed (${r.status})`);
      start=end; setProgress(Math.round((start/total)*100));
    }
  }
  async function publish(){
    setBusy(true); setError(''); setStatus('Initializing secure upload…'); setProgress(0);
    try{
      const j=await jsonFetch('/api/tiktok/publish/init',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({video_size:file.size,title,privacy_level:privacy,disable_comment:!comment,disable_duet:!duet,disable_stitch:!stitch,brand_organic_toggle:brand,is_aigc:aigc})});
      const d=j.data; if(!d?.upload_url||!d?.publish_id) throw new Error('TikTok did not return an upload session.');
      setPublishId(d.publish_id); setStatus('Uploading directly to TikTok…'); await uploadChunks(d.upload_url,d.upload_plan); setStatus('Upload complete. TikTok is processing the post.');
    }catch(e){setError(e.message);setStatus('')}finally{setBusy(false)}
  }
  async function checkStatus(){try{setBusy(true);const j=await jsonFetch('/api/tiktok/publish/status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({publish_id:publishId})});setStatus(j.data?.status||'Status received from TikTok.');}catch(e){setError(e.message)}finally{setBusy(false)}}

  if(loading)return <div className="publisherCard"><p>Loading latest TikTok creator settings…</p></div>;
  if(error&&!creator)return <div className="publisherCard"><h2>TikTok connection needs attention</h2><p>{error}</p><a className="connectButton" href="/api/tiktok/connect">Reconnect TikTok →</a></div>;
  return <div className="publisherGrid">
    <section className="publisherCard"><small>AUTHORIZED CREATOR</small><div className="creatorRow">{creator?.creator_avatar_url&&<img src={creator.creator_avatar_url} alt=""/>}<div><h2>{creator?.creator_nickname||'TikTok creator'}</h2><p>@{creator?.creator_username||'connected account'}</p></div><b>CONNECTED ✓</b></div><p>HoaiStudio loads TikTok's latest posting permissions before every publishing session.</p></section>
    <section className="publisherCard"><small>1 · ORIGINAL CONTENT</small><h2>Select a video</h2><input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={e=>{setFile(e.target.files?.[0]||null);setProgress(0);setPublishId('');setStatus('')}}/>{file&&<p><b>{file.name}</b> · {(file.size/1048576).toFixed(1)} MB</p>}{maxDuration&&<p>TikTok allows up to {maxDuration} seconds for this creator.</p>}</section>
    <section className="publisherCard"><small>2 · POST DETAILS</small><h2>Review before publishing</h2><label>Caption<textarea value={title} maxLength={2200} onChange={e=>setTitle(e.target.value)} placeholder="Write your caption, hashtags and mentions…"/></label><p>{title.length}/2200</p><label>Who can view<select value={privacy} onChange={e=>setPrivacy(e.target.value)}>{(creator?.privacy_level_options||[]).map(x=><option key={x} value={x}>{label[x]||x}</option>)}</select></label><div className="publishChecks"><label><input type="checkbox" checked={comment} disabled={creator?.comment_disabled} onChange={e=>setComment(e.target.checked)}/> Allow comments</label><label><input type="checkbox" checked={duet} disabled={creator?.duet_disabled} onChange={e=>setDuet(e.target.checked)}/> Allow Duet</label><label><input type="checkbox" checked={stitch} disabled={creator?.stitch_disabled} onChange={e=>setStitch(e.target.checked)}/> Allow Stitch</label><label><input type="checkbox" checked={brand} onChange={e=>setBrand(e.target.checked)}/> This promotes my own business</label><label><input type="checkbox" checked={aigc} onChange={e=>setAigc(e.target.checked)}/> This content is AI-generated</label></div></section>
    <section className="publisherCard publisherFinal"><small>3 · FINAL REVIEW</small><h2>Publish to TikTok</h2><p>Nothing is sent until you explicitly publish. Your video uploads directly from this browser to TikTok; HoaiStudio does not proxy the video through Vercel.</p><label className="consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> I reviewed the video, caption, audience and interaction settings and want to send this content to TikTok.</label><button className="connectButton" disabled={!ready} onClick={publish}>{busy?'Working…':'Publish to TikTok →'}</button>{(busy||progress>0)&&<div><progress max="100" value={progress}/><p>{progress}%</p></div>}{status&&<div className="authNotice">{status}</div>}{error&&creator&&<div className="authError">{error}</div>}{publishId&&<button disabled={busy} onClick={checkStatus}>Check TikTok status</button>}</section>
  </div>;
}
