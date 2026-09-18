'use client'

export const dynamic = 'force-dynamic'

import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Eye, EyeSlash, FacebookLogo, GoogleLogo, LockKey, ShieldCheck, Sparkle } from '@phosphor-icons/react'
import { createClient } from '@/utils/supabase/client'
import { useAuthStore } from '@/store/useAuthStore'
import {
  type AuthMode,
  type OAuthProvider,
  getSafeAuthMessage,
  sendPasswordReset,
  signInWithEmail,
  signInWithOAuth,
  signUpWithEmail,
  validateAuthInput,
} from '@/lib/auth/auth-utils'
import UltraAqueousBackground from '@/components/ultra/UltraAqueousBackground'

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const resetFailedAttempts = useAuthStore((state) => state.resetFailedAttempts)
  const [mode, setMode] = useState<AuthMode>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let mounted = true
    const checkSession = async () => {
      const { data: { session } } = await createClient().auth.getSession()
      if (!mounted) return
      if (session) {
        setAuth(session)
        router.replace('/home')
        return
      }
      const callbackError = new URLSearchParams(window.location.search).get('error')
      if (callbackError) setError(callbackError)
      setCheckingSession(false)
    }
    void checkSession()
    return () => { mounted = false }
  }, [router, setAuth, supabase])

  const clear = () => { setError(''); setMessage('') }
  const busy = loading || oauthLoading !== null

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clear()
    const validationError = validateAuthInput({ mode, email, password, fullName })
    if (validationError) { setError(validationError); return }
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await signUpWithEmail({ supabase: createClient(), email, password, fullName })
        if (signUpError) throw signUpError
        if (data.session) {
          setAuth(data.session)
          resetFailedAttempts()
          router.replace('/intro')
          return
        }
        setMode('login')
        setPassword('')
        setMessage('Account created. Confirm your email, then sign in.')
        return
      }
      const { data, error: signInError } = await signInWithEmail({ supabase: createClient(), email, password })
      if (signInError) throw signInError
      if (!data.session) throw new Error('Login session could not be created.')
      setAuth(data.session)
      resetFailedAttempts()
      router.replace('/intro')
    } catch (authError: unknown) {
      setError(authError instanceof Error ? getSafeAuthMessage(authError.message) : 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const oauth = async (provider: OAuthProvider) => {
    clear()
    setOauthLoading(provider)
    try {
      const { error: oauthError } = await signInWithOAuth({ supabase: createClient(), provider, origin: window.location.origin })
      if (oauthError) throw oauthError
    } catch (authError: unknown) {
      setError(authError instanceof Error ? getSafeAuthMessage(authError.message) : 'Social login could not be started.')
      setOauthLoading(null)
    }
  }

  const forgot = async () => {
    clear()
    if (!email.trim()) { setError('Enter your email first to reset your password.'); return }
    setLoading(true)
    try {
      const { error: resetError } = await sendPasswordReset({ supabase: createClient(), email, origin: window.location.origin })
      if (resetError) throw resetError
      setMessage('Password reset instructions have been sent to your email.')
    } catch (resetError: unknown) {
      setError(resetError instanceof Error ? getSafeAuthMessage(resetError.message) : 'Password reset could not be started.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return <main className="grid min-h-dvh place-items-center bg-[#06080c] text-white"><div className="h-9 w-9 animate-spin rounded-full border border-white/10 border-t-cyan-200/70" role="status" aria-label="Checking session" /></main>
  }

  return (
    <main className="relative min-h-dvh overflow-x-clip bg-[#06080c] text-white">
      <UltraAqueousBackground />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1500px] items-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] shadow-[0_30px_120px_rgba(0,0,0,0.42)] backdrop-blur-2xl" style={{ animation: 'fxLoginEnter 700ms cubic-bezier(.25,1,.5,1) both' }}>
          <div className="grid min-h-[650px] lg:grid-cols-[.9fr_1.1fr]">
            <section className="relative hidden overflow-hidden border-r border-white/[0.07] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
              <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-cyan-300/[0.045] blur-3xl" />
              <div className="relative flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.055] text-sm font-black">FX</span>
                <div><div className="font-bold tracking-[0.18em]">FeniX</div><div className="text-[9px] uppercase tracking-[0.22em] text-white/30">Business Ecosystem</div></div>
              </div>
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100/10 bg-cyan-300/[0.045] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-cyan-100/60"><Sparkle size={14} /> One identity · many opportunities</div>
                <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-0.045em] xl:text-6xl">Enter once.<br /><span className="text-white/35">Move everywhere.</span></h1>
                <p className="mt-6 max-w-lg text-sm leading-7 text-white/45">Business discovery, investment, commerce and Feni Brain — connected through one FeniX account.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><ShieldCheck size={19} className="text-cyan-100/60" /><div className="mt-3 text-xs font-semibold text-white/70">Trust-first</div><div className="mt-1 text-[11px] leading-5 text-white/30">Presentation changes do not change access rules.</div></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><LockKey size={19} className="text-cyan-100/60" /><div className="mt-3 text-xs font-semibold text-white/70">Protected access</div><div className="mt-1 text-[11px] leading-5 text-white/30">Supabase Auth and RLS remain the security layer.</div></div>
              </div>
            </section>

            <section className="flex items-center justify-center p-5 sm:p-8 lg:p-12 xl:p-16">
              <div className="w-full max-w-[470px]">
                <div className="lg:hidden"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.055] text-sm font-black">FX</span><div><div className="font-bold tracking-[0.18em]">FeniX</div><div className="text-[9px] uppercase tracking-[0.2em] text-white/30">Business Ecosystem</div></div></div></div>
                <div className="mt-8 lg:mt-0">
                  <div className="text-xs uppercase tracking-[0.2em] text-cyan-100/45">{mode === 'login' ? 'Welcome back' : 'Create your identity'}</div>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{mode === 'login' ? 'Enter FeniX.' : 'Join FeniX.'}</h2>
                  <p className="mt-3 text-sm leading-6 text-white/40">{mode === 'login' ? 'Continue to your connected FeniX workspace.' : 'Create a secure FeniX account to get started.'}</p>
                </div>

                {(error || message) && <div className={`mt-6 rounded-2xl border p-3 text-sm leading-6 ${error ? 'border-red-300/15 bg-red-400/[0.045] text-red-100/75' : 'border-cyan-200/15 bg-cyan-300/[0.045] text-cyan-100/70'}`}>{error || message}</div>}

                <div className="mt-6 grid grid-cols-2 gap-2">
                  <button type="button" disabled={busy} onClick={() => void oauth('google')} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] disabled:opacity-45"><GoogleLogo size={18} />{oauthLoading === 'google' ? 'Opening…' : 'Google'}</button>
                  <button type="button" disabled={busy} onClick={() => void oauth('facebook')} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] disabled:opacity-45"><FacebookLogo size={18} />{oauthLoading === 'facebook' ? 'Opening…' : 'Facebook'}</button>
                </div>

                <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-white/[0.07]" /><span className="text-[9px] uppercase tracking-[0.22em] text-white/20">or email</span><div className="h-px flex-1 bg-white/[0.07]" /></div>

                <form onSubmit={submit} className="space-y-3">
                  {mode === 'signup' && <label className="block"><span className="mb-2 block text-[11px] text-white/40">Full name</span><input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" disabled={busy} className="min-h-13 w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 text-sm outline-none focus:border-cyan-100/30" placeholder="Your name" /></label>}
                  <label className="block"><span className="mb-2 block text-[11px] text-white/40">Email</span><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" disabled={busy} required className="min-h-13 w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 text-sm outline-none focus:border-cyan-100/30" placeholder="you@example.com" /></label>
                  <label className="block"><span className="mb-2 block text-[11px] text-white/40">Password</span><div className="relative"><input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} disabled={busy} required className="min-h-13 w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 pr-12 text-sm outline-none focus:border-cyan-100/30" placeholder="••••••••" /><button type="button" onClick={() => setShowPassword((v) => !v)} disabled={busy} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl text-white/30 hover:bg-white/[0.05]">{showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}</button></div></label>
                  {mode === 'login' && <div className="flex justify-end"><button type="button" onClick={() => void forgot()} disabled={busy} className="text-xs text-white/35 hover:text-cyan-100/70">Forgot password?</button></div>}
                  <button type="submit" disabled={busy} className="group mt-2 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-bold text-[#071018] transition hover:scale-[1.005] disabled:opacity-50">{loading ? 'Please wait…' : mode === 'login' ? 'Continue securely' : 'Create account'}<ArrowRight size={18} /></button>
                </form>

                <div className="mt-6 text-center text-xs text-white/35">{mode === 'login' ? 'New to FeniX?' : 'Already have an account?'}{' '}<button type="button" disabled={busy} onClick={() => { clear(); setMode((v) => v === 'login' ? 'signup' : 'login'); setPassword('') }} className="font-semibold text-cyan-100/65 hover:text-cyan-100">{mode === 'login' ? 'Create account' : 'Sign in'}</button></div>
                <p className="mt-8 text-center text-[10px] leading-5 text-white/20">Authentication remains handled by Supabase. This interface only changes presentation and navigation.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <style>{`@keyframes fxLoginEnter { from { opacity:0; transform:scale(.97) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </main>
  )
}
