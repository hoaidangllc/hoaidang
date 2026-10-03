import { NextResponse } from 'next/server';
export async function GET(request){const origin=new URL(request.url).origin;return NextResponse.json({resource:`${origin}/api/mcp`,authorization_servers:[origin],scopes_supported:['analytics.read','offline_access'],bearer_methods_supported:['header']},{headers:{'Cache-Control':'public, max-age=300'}})}
