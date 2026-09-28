import Link from 'next/link';
import { signup } from '../auth/actions';
export const metadata={title:'Create account'};

export default async function Signup({searchParams}){
  const params=await searchParams;
  return <main className="authPage"><Link className="brand authBrand" href="/">Hoai<span>Studio</span></Link><section className="authCard"><div className="eyebrow">GET STARTED</div><h1>Create your workspace.</h1><p>Set up your HoaiStudio account. Connect a supported social account when you are ready.</p>{params?.error&&<div className="authError">{params.error}</div>}<form action={signup}><label>Name</label><input name="name" autoComplete="name" required placeholder="Your name"/><label>Email</label><input name="email" type="email" autoComplete="email" required placeholder="you@example.com"/><label>Password</label><input name="password" type="password" autoComplete="new-password" required minLength="8" placeholder="At least 8 characters"/><button type="submit">Create account</button></form><p className="authFoot">By creating an account, you agree to our <Link href="/terms">Terms</Link> and acknowledge our <Link href="/privacy">Privacy Policy</Link>.</p><p className="authFoot">Already have an account? <Link href="/login">Log in</Link></p></section></main>}
