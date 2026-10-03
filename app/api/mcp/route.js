import { NextResponse } from 'next/server';

const MCP_VERSION='2025-06-18';
function unauthorized(request){const origin=new URL(request.url).origin;return NextResponse.json({error:'unauthorized'},{status:401,headers:{'WWW-Authenticate':`Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource"`,'Cache-Control':'private, no-store'}})}
function tokenOk(request){const auth=request.headers.get('authorization')||'';const token=auth.startsWith('Bearer ')?auth.slice(7):'';return verifyToken(token,'access')}
async function verifyToken(token,kind){try{const [body,sig]=token.split('.');if(!body||!sig)return false;const secret=process.env.HOAI_ANALYTICS_API_KEY;if(!secret)return false;const expected=await hmac(body,secret);if(!safeEqual(sig,expected))return false;const data=JSON.parse(Buffer.from(body,'base64url').toString());return data.kind===kind&&data.exp>Date.now()}catch{return false}}
async function hmac(value,secret){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Buffer.from(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value))).toString('base64url')}
function safeEqual(a,b){if(a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0}
async function analytics(request,site,days){const origin=new URL(request.url).origin;const key=process.env.HOAI_ANALYTICS_API_KEY;const r=await fetch(`${origin}/api/google/analytics/report?site=${encodeURIComponent(site)}&days=${days}`,{headers:{'x-hoai-analytics-key':key||''},cache:'no-store'});const data=await r.json();if(!r.ok)throw new Error(data?.error||'Analytics request failed');return data}
function rpc(id,result){return NextResponse.json({jsonrpc:'2.0',id,result},{headers:{'Cache-Control':'private, no-store'}})}
export async function POST(request){if(!(await tokenOk(request)))return unauthorized(request);let msg;try{msg=await request.json()}catch{return NextResponse.json({jsonrpc:'2.0',id:null,error:{code:-32700,message:'Parse error'}},{status:400})}
 const id=msg.id??null;
 if(msg.method==='initialize')return rpc(id,{protocolVersion:MCP_VERSION,capabilities:{tools:{}},serverInfo:{name:'HoaiDang Analytics',version:'1.0.0'}});
 if(msg.method==='notifications/initialized')return new NextResponse(null,{status:202});
 if(msg.method==='tools/list')return rpc(id,{tools:[{name:'get_analytics_report',description:"Read-only GA4 report for PhoneNumberSale.com or Annie's Nails & Spa. Returns live/recent traffic, sources, channels, campaigns and landing pages.",inputSchema:{type:'object',properties:{site:{type:'string',enum:['pns','annie'],description:'pns = PhoneNumberSale.com; annie = Annie’s Nails & Spa'},days:{type:'integer',minimum:1,maximum:90,default:7}},required:['site']},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}}]});
 if(msg.method==='tools/call'){if(msg.params?.name!=='get_analytics_report')return NextResponse.json({jsonrpc:'2.0',id,error:{code:-32601,message:'Unknown tool'}});const a=msg.params?.arguments||{},site=a.site,days=Math.min(Math.max(Number(a.days||7),1),90);if(!['pns','annie'].includes(site))return rpc(id,{content:[{type:'text',text:'Invalid site'}],isError:true});try{const data=await analytics(request,site,days);return rpc(id,{content:[{type:'text',text:JSON.stringify(data)}],structuredContent:data})}catch(e){return rpc(id,{content:[{type:'text',text:e.message}],isError:true})}}
 if(msg.method==='ping')return rpc(id,{});
 return NextResponse.json({jsonrpc:'2.0',id,error:{code:-32601,message:'Method not found'}});
}
export async function GET(request){if(!(await tokenOk(request)))return unauthorized(request);return NextResponse.json({name:'HoaiDang Analytics MCP',readOnly:true},{headers:{'Cache-Control':'private, no-store'}})}
