import Link from 'next/link';
import { login } from '../auth/actions';
import Brand from '../components/Brand';
export const metadata={title:'Log in'};

export default async function Login({searchParams}){
  const params=await searchParams;
  return <main className="authPage"><Brand className="authBrand"/><section className="authCard"><div className="authCardTop"><div className="eyebrow">WELCOME BACK</div><h1>Log in to HoaiStudio.</h1><p>Return to your creator workspace and connected publishing tools.</p></div>{params?.message&&<div className="authNotice">{params.message}</div>}{params?.error&&<div className="authError">{params.error}</div>}<form action={login}><input type="hidden" name="next" value={params?.next||'/dashboard'}/><label>Email</label><input name="email" type="email" autoComplete="email" required placeholder="you@example.com"/><label>Password</label><input name="password" type="password" autoComplete="current-password" required minLength="6" placeholder="Your password"/><button type="submit">Log in →</button></form><p className="authFoot">New to HoaiStudio? <Link href="/signup">Create an account</Link></p></section></main>}
