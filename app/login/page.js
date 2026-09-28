import Link from 'next/link';
import { login } from '../auth/actions';
export const metadata={title:'Log in'};

export default async function Login({searchParams}){
  const params=await searchParams;
  return <main className="authPage"><Link className="brand authBrand" href="/">Hoai<span>Studio</span></Link><section className="authCard"><div className="eyebrow">WELCOME BACK</div><h1>Log in to your workspace.</h1><p>Manage your connected accounts and publishing activity.</p>{params?.message&&<div className="authNotice">{params.message}</div>}{params?.error&&<div className="authError">{params.error}</div>}<form action={login}><input type="hidden" name="next" value={params?.next||'/dashboard'}/><label>Email</label><input name="email" type="email" autoComplete="email" required placeholder="you@example.com"/><label>Password</label><input name="password" type="password" autoComplete="current-password" required minLength="6" placeholder="Your password"/><button type="submit">Log in</button></form><p className="authFoot">New to HoaiStudio? <Link href="/signup">Create an account</Link></p></section></main>}
