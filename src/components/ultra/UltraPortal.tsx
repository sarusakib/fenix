'use client'

import type { FormEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import UltraAqueousBackground from './UltraAqueousBackground'

type PortalView = 'demo' | 'login'

type UltraPortalProps = {
  initialView: PortalView
}

function Icon({ name }: { name: 'arrow' | 'lock' | 'brain' | 'eye' | 'eye-off' }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.65,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'fenix-ultra-icon',
    'aria-hidden': true,
  }

  if (name === 'arrow') return <svg {...common}><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></svg>
  if (name === 'lock') return <svg {...common}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
  if (name === 'brain') return <svg {...common}><path d="M9 4.5a3.3 3.3 0 0 0-3 4.7A3.7 3.7 0 0 0 7.5 16a3.2 3.2 0 0 0 5 1.7 3.2 3.2 0 0 0 5-1.7 3.7 3.7 0 0 0 1.5-6.8 3.3 3.3 0 0 0-3-4.7A3.1 3.1 0 0 0 12 5.3 3.1 3.1 0 0 0 9 4.5Z" /><path d="M12 5v13M9 10c1.4.2 2.2 1 2.5 2M15 10c-1.4.2-2.2 1-2.5 2M9.2 14.4c1-.1 1.9.3 2.5 1.1M14.8 14.4c-1-.1-1.9.3-2.5 1.1" /></svg>
  if (name === 'eye-off') return <svg {...common}><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.8 5.3A11.4 11.4 0 0 1 12 5c5 0 8.6 4 9.8 7-.4 1-1.1 2-2.2 2.9" /><path d="M6.4 6.5C4.7 7.6 3.3 9.2 2.2 12c1.2 3 4.9 7 9.8 7 1.1 0 2.2-.2 3.1-.6" /></svg>
  return <svg {...common}><path d="M2.2 12c1.2-3 4.9-7 9.8-7s8.6 4 9.8 7c-1.2 3-4.9 7-9.8 7s-8.6-4-9.8-7Z" /><circle cx="12" cy="12" r="3" /></svg>
}

function Brand() {
  return <span className="fenix-ultra-brand-mark" aria-hidden="true">FX</span>
}

export default function UltraPortal({ initialView }: UltraPortalProps) {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const resetFailedAttempts = useAuthStore((state) => state.resetFailedAttempts)

  const [view, setView] = useState<PortalView>(initialView)
  const [mode, setMode] = useState<AuthMode>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [checkingSession, setCheckingSession] = useState(initialView === 'login')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [leaving, setLeaving] = useState(false)
  const timerRef = useRef<number | null>(null)

  const clearMessages = useCallback(() => {
    setError('')
    setMessage('')
  }, [])

  const switchView = useCallback((next: PortalView) => {
    if (loading || oauthLoading) return
    clearMessages()
    setLeaving(true)

    window.setTimeout(() => {
      window.history.pushState(
        { fenixView: next },
        '',
        next === 'login' ? '/login' : '/',
      )
      setView(next)
      setLeaving(false)
    }, 230)
  }, [clearMessages, loading, oauthLoading])

  useEffect(() => {
    const onPopState = () => {
      setView(window.location.pathname === '/login' ? 'login' : 'demo')
      setLeaving(false)
      clearMessages()
    }

    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [clearMessages])

  useEffect(() => {
    if (view !== 'login') {
      setCheckingSession(false)
      return
    }

    let mounted = true

    const checkSession = async () => {
      const {
        data: { session },
      } = await createClient().auth.getSession()

      if (!mounted) return

      if (session) {
        setAuth(session)
        router.replace('/home')
        return
      }

      const callbackError = new URLSearchParams(window.location.search).get('error')
      if (callbackError) setError('Authentication could not be completed. Please try again.')
      setCheckingSession(false)
    }

    setCheckingSession(true)
    void checkSession()

    return () => {
      mounted = false
    }
  }, [router, setAuth, view])

  const finishAuthentication = useCallback((session: Parameters<typeof setAuth>[0]) => {
    setAuth(session)
    resetFailedAttempts()
    setLeaving(true)
    timerRef.current = window.setTimeout(() => router.replace('/intro'), 650)
  }, [resetFailedAttempts, router, setAuth])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading || oauthLoading) return
    clearMessages()

    const validationError = validateAuthInput({
      mode,
      email,
      password,
      fullName,
    })

    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await signUpWithEmail({
          supabase: createClient(),
          email,
          password,
          fullName,
        })

        if (signUpError) throw signUpError

        if (data.session) {
          finishAuthentication(data.session)
          return
        }

        setMode('login')
        setPassword('')
        setMessage('Account created. Confirm your email, then sign in.')
        return
      }

      const { data, error: signInError } = await signInWithEmail({
        supabase: createClient(),
        email,
        password,
      })

      if (signInError) throw signInError
      if (!data.session) throw new Error('no-session')
      finishAuthentication(data.session)
    } catch (authError: unknown) {
      setError(getSafeAuthMessage(authError))
    } finally {
      setLoading(false)
    }
  }

  const startOAuth = async (provider: OAuthProvider) => {
    if (loading || oauthLoading) return
    clearMessages()
    setOauthLoading(provider)

    try {
      const { error: oauthError } = await signInWithOAuth({
        supabase: createClient(),
        provider,
        origin: window.location.origin,
      })

      if (oauthError) throw oauthError
    } catch (authError: unknown) {
      setError(getSafeAuthMessage(authError))
      setOauthLoading(null)
    }
  }

  const forgot = async () => {
    if (loading || oauthLoading) return
    clearMessages()

    if (!email.trim()) {
      setError('Enter your email first to reset your password.')
      return
    }

    setLoading(true)

    try {
      const { error: resetError } = await sendPasswordReset({
        supabase: createClient(),
        email,
        origin: window.location.origin,
      })

      if (resetError) throw resetError
      setMessage('If the account can receive reset mail, instructions have been sent.')
    } catch (resetError: unknown) {
      setError(getSafeAuthMessage(resetError))
    } finally {
      setLoading(false)
    }
  }

  const busy = loading || oauthLoading !== null
  const rootClass = 'fenix-ultra-root ' +
    (view === 'login' ? 'fenix-ultra-view-login' : 'fenix-ultra-view-demo') +
    (leaving ? ' fenix-ultra-is-leaving' : '')

  if (view === 'login' && checkingSession) {
    return (
      <main className="fenix-ultra-root fenix-ultra-view-login">
        <UltraAqueousBackground />
        <div className="fenix-ultra-loading" role="status" aria-label="Checking secure session">
          <div className="fenix-ultra-loader" />
          <span>Checking secure session…</span>
        </div>
      </main>
    )
  }

  return (
    <main id="fenix-ultra-portal" className={rootClass}>
      <UltraAqueousBackground />

      <div className="fenix-ultra-shell">
        <header className="fenix-ultra-header">
          <a
            className="fenix-ultra-brand"
            href="/"
            onClick={(event) => {
              event.preventDefault()
              switchView('demo')
            }}
            aria-label="FeniX home"
          >
            <Brand />
            <span className="fenix-ultra-brand-copy">
              <strong>FeniX</strong>
              <small>Feni Business Ecosystem</small>
            </span>
          </a>

          <div className="fenix-ultra-header-state">
            <span className="fenix-ultra-status-dot" />
            <span>{view === 'login' ? 'Secure Access' : 'Live Ecosystem'}</span>
          </div>
        </header>

        <div className="fenix-ultra-state-stack">
          <section
            className="fenix-ultra-state fenix-ultra-demo-state"
            aria-hidden={view !== 'demo'}
          >
            <div className="fenix-ultra-demo-grid">
              <article className="fenix-ultra-hero-card">
                <div className="fenix-ultra-eyebrow">
                  <span className="fenix-ultra-eyebrow-line" />
                  One identity · many opportunities
                </div>

                <h1>
                  Build.
                  <span> Connect.</span>
                  <br />
                  <em>Grow.</em>
                </h1>

                <p>
                  A calm, connected space for business discovery, investment,
                  local commerce and Feni Brain — designed around one FeniX identity.
                </p>

                <div className="fenix-ultra-actions">
                  <button type="button" className="fenix-ultra-primary" onClick={() => switchView('login')}>
                    Enter FeniX
                    <Icon name="arrow" />
                  </button>
                  <a className="fenix-ultra-secondary" href="/guide">
                    Explore Feni Brain
                    <Icon name="brain" />
                  </a>
                </div>

                <div className="fenix-ultra-trust-row">
                  <span><Icon name="lock" /> Supabase Auth</span>
                  <span><Icon name="lock" /> RLS protected</span>
                  <span><Icon name="brain" /> Feni-first</span>
                </div>
              </article>

              <div className="fenix-ultra-card-grid">
                <a className="fenix-ultra-feature-card fenix-ultra-feature-tall" href="/start">
                  <span className="fenix-ultra-card-number">01</span>
                  <b className="fenix-ultra-card-symbol">↗</b>
                  <strong>Build</strong>
                  <p>Start a business and build your digital presence.</p>
                  <span className="fenix-ultra-card-link">Explore <Icon name="arrow" /></span>
                </a>

                <a className="fenix-ultra-feature-card" href="/invest">
                  <span className="fenix-ultra-card-number">02</span>
                  <b className="fenix-ultra-card-symbol">◎</b>
                  <strong>Invest</strong>
                  <p>Explore Feni opportunities and investment intelligence.</p>
                  <span className="fenix-ultra-card-link">Explore <Icon name="arrow" /></span>
                </a>

                <a className="fenix-ultra-feature-card" href="/directory">
                  <span className="fenix-ultra-card-number">03</span>
                  <b className="fenix-ultra-card-symbol">◌</b>
                  <strong>Connect</strong>
                  <p>Find trusted businesses, suppliers and local services.</p>
                  <span className="fenix-ultra-card-link">Explore <Icon name="arrow" /></span>
                </a>

                <a className="fenix-ultra-feature-card" href="/guide">
                  <span className="fenix-ultra-card-number">04</span>
                  <b className="fenix-ultra-card-symbol">⌁</b>
                  <strong>Discover</strong>
                  <p>Ask Feni Brain in Bangla, English or Banglish.</p>
                  <span className="fenix-ultra-card-link">Explore <Icon name="arrow" /></span>
                </a>
              </div>
            </div>
          </section>

          <section
            className="fenix-ultra-state fenix-ultra-login-state"
            aria-hidden={view !== 'login'}
          >
            <div className="fenix-ultra-login-grid">
              <aside className="fenix-ultra-login-side">
                <div className="fenix-ultra-orbit" aria-hidden="true">
                  <span /><span /><span />
                  <b>FX</b>
                </div>

                <div>
                  <div className="fenix-ultra-eyebrow">
                    <span className="fenix-ultra-eyebrow-line" />
                    Protected identity
                  </div>
                  <h2>Enter once.<br /><span>Move everywhere.</span></h2>
                  <p>
                    Authentication stays with Supabase. The Ultra UI changes
                    presentation and navigation, not authorization.
                  </p>
                </div>

                <div className="fenix-ultra-security-box">
                  <Icon name="lock" />
                  <div>
                    <strong>Security boundary intact</strong>
                    <span>Server session + RLS continue to enforce access.</span>
                  </div>
                </div>
              </aside>

              <section className="fenix-ultra-login-card" aria-label="FeniX authentication">
                <div className="fenix-ultra-login-top">
                  <button type="button" className="fenix-ultra-back" onClick={() => switchView('demo')}>
                    ← Demo
                  </button>
                  <span className="fenix-ultra-login-chip">SECURE</span>
                </div>

                <div className="fenix-ultra-login-heading">
                  <span>{mode === 'login' ? 'Welcome back' : 'Create your identity'}</span>
                  <h3>{mode === 'login' ? 'Enter FeniX.' : 'Join FeniX.'}</h3>
                  <p>
                    {mode === 'login'
                      ? 'Continue to your connected FeniX workspace.'
                      : 'Create a secure FeniX account to get started.'}
                  </p>
                </div>

                {(error || message) && (
                  <div
                    className={'fenix-ultra-notice ' + (error ? 'fenix-ultra-notice-error' : 'fenix-ultra-notice-success')}
                    role={error ? 'alert' : 'status'}
                  >
                    {error || message}
                  </div>
                )}

                <div className="fenix-ultra-social-row">
                  {(['google', 'facebook'] as OAuthProvider[]).map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      className="fenix-ultra-social"
                      disabled={busy}
                      onClick={() => void startOAuth(provider)}
                    >
                      <span className={provider === 'google' ? 'fenix-ultra-social-google' : 'fenix-ultra-social-facebook'}>
                        {provider === 'google' ? 'G' : 'f'}
                      </span>
                      {oauthLoading === provider
                        ? 'Opening…'
                        : provider === 'google' ? 'Google' : 'Facebook'}
                    </button>
                  ))}
                </div>

                <div className="fenix-ultra-divider"><span>or continue with email</span></div>

                <form className="fenix-ultra-form" onSubmit={submit}>
                  {mode === 'signup' && (
                    <label className="fenix-ultra-field">
                      <span>Full name</span>
                      <input
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        autoComplete="name"
                        disabled={busy}
                        maxLength={80}
                        required
                        placeholder="Your name"
                      />
                    </label>
                  )}

                  <label className="fenix-ultra-field">
                    <span>Email</span>
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      disabled={busy}
                      maxLength={254}
                      required
                      placeholder="you@example.com"
                    />
                  </label>

                  <label className="fenix-ultra-field">
                    <span>Password</span>
                    <div className="fenix-ultra-password">
                      <input
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        disabled={busy}
                        minLength={8}
                        maxLength={128}
                        required
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="fenix-ultra-eye"
                        onClick={() => setShowPassword((value) => !value)}
                        disabled={busy}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <Icon name={showPassword ? 'eye-off' : 'eye'} />
                      </button>
                    </div>
                  </label>

                  {mode === 'login' && (
                    <div className="fenix-ultra-form-row">
                      <span>Protected by Supabase Auth</span>
                      <button type="button" onClick={() => void forgot()} disabled={busy}>
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <button type="submit" className="fenix-ultra-submit" disabled={busy}>
                    <span>
                      {loading
                        ? 'Securing…'
                        : mode === 'login' ? 'Continue securely' : 'Create account'}
                    </span>
                    <Icon name="arrow" />
                  </button>
                </form>

                <div className="fenix-ultra-switch">
                  <span>{mode === 'login' ? 'New to FeniX?' : 'Already have an account?'}</span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      clearMessages()
                      setMode((current) => current === 'login' ? 'signup' : 'login')
                      setPassword('')
                    }}
                  >
                    {mode === 'login' ? 'Create account' : 'Sign in'}
                  </button>
                </div>

                <p className="fenix-ultra-footnote">
                  UI state is never used as an authorization decision. Access is verified by Supabase session and server checks.
                </p>
              </section>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
