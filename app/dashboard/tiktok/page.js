import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase/server';
import TikTokPublisher from './TikTokPublisher';
export const metadata={title:'TikTok Publishing'};
export default async function TikTokPage(){
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user) redirect('/login');
 const {data:connection}=await supabase.from('tiktok_connections').select('user_id').eq('user_id',user.id).maybeSingle();
 if(!connection) redirect('/dashboard');
 return <main className="publishPage"><div className="publishTop"><div><small>TIKTOK PUBLISHING</small><h1>Review. Confirm. Publish.</h1><p>A creator-controlled publishing workspace for original content.</p></div><Link href="/dashboard">Workspace</Link></div><TikTokPublisher/></main>;
}
