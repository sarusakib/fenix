'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CheckCircle,
  Eye,
  EyeSlash,
  FacebookLogo,
  GoogleLogo,
  LockKey,
  ShieldCheck,
  SpinnerGap,
  User,
  XCircle,
} from '@phosphor-icons/react'

import { createClient } from '../../utils/supabase/client'
import { useAuthStore } from '../../store/useAuthStore'

type AuthMode = 'login' | 'signup'

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()

  const setAuth = useAuthStore((state) => state.setAuth)
  const resetFailedAttempts = useAuthStore(
    (state) => state.resetFailedAttempts
  )

  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<
    'google' | 'facebook' | null
  >(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false)
    }, 1200)

    return () => window.clearTimeout(timer)
  }, [])

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const getSafeMessage = (message: string) => {
    const normalized = message.toLowerCase()

    if (normalized.includes('invalid login credentials')) {
      return 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।'
    }

    if (normalized.includes('email not confirmed')) {
      return 'আপনার ইমেইলটি আগে confirm করুন।'
    }

    if (normalized.includes('user already registered')) {
      return 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট আছে।'
    }

    if (normalized.includes('password')) {
      return 'পাসওয়ার্ডটি সঠিক নয় অথবা প্রয়োজনীয় শর্ত পূরণ করছে না।'
    }

    if (normalized.includes('rate limit')) {
      return 'অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।'
    }

    return 'এই মুহূর্তে অনুরোধটি সম্পন্ন করা যাচ্ছে না। আবার চেষ্টা করুন।'
  }

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    clearMessages()

    const cleanEmail = email.trim()
    const cleanName = fullName.trim()

    if (!cleanEmail || !password) {
      setError('ইমেইল এবং পাসওয়ার্ড দিন।')
      return
    }

    if (mode === 'signup' && !cleanName) {
      setError('আপনার পুরো নাম দিন।')
      return
    }

    if (mode === 'signup' && password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।')
      return
    }

    setLoading(true)

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } =
          await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: cleanName,
                role: 'user',
              },
            },
          })

        if (signUpError) {
          throw signUpError
        }

        if (data.session) {
          setAuth(data.session)
          resetFailedAttempts()

          router.push('/guide')
          router.refresh()

          return
        }

        setSuccess(
          'অ্যাকাউন্ট তৈরি হয়েছে। আপনার ইমেইল confirm করে তারপর login করুন।'
        )

        setMode('login')
        setPassword('')

        return
      }

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })

      if (signInError) {
        throw signInError
      }

      if (!data.session) {
        throw new Error('Login session তৈরি হয়নি।')
      }

      setAuth(data.session)
      resetFailedAttempts()

      router.push('/guide')
      router.refresh()
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? getSafeMessage(error.message)
          : 'একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (
    provider: 'google' | 'facebook'
  ) => {
    clearMessages()

    setOauthLoading(provider)

    try {
      const { error: oauthError } =
        await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        })

      if (oauthError) {
        throw oauthError
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? getSafeMessage(error.message)
          : 'Social login চালু করা যাচ্ছে না।'

      setError(message)
      setOauthLoading(null)
    }
  }

  const handleForgotPassword = async () => {
    clearMessages()

    const cleanEmail = email.trim()

    if (!cleanEmail) {
      setError('Password reset করতে আগে আপনার ইমেইল দিন।')
      return
    }

    setLoading(true)

    try {
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        })

      if (resetError) {
        throw resetError
      }

      setSuccess(
        'Password reset করার জন্য আপনার ইমেইলে একটি লিংক পাঠানো হয়েছে।'
      )
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? getSafeMessage(error.message)
          : 'Password reset করা যাচ্ছে না।'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    clearMessages()
    setMode((current) =>
      current === 'login' ? 'signup' : 'login'
    )
    setPassword('')
  }

  if (showSplash) {
    return (
      <main className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-[#05070b] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,128,128,0.16),transparent_45%)]" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_0_80px_rgba(0,128,128,0.16)] backdrop-blur-xl sm:h-28 sm:w-28">
            <span className="text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">
              F<span className="text-[#008080]">X</span>
            </span>
          </div>

          <div className="mt-7 text-center">
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Feni<span className="text-[#008080]">X</span>
            </h1>

            <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.35em] text-white/40 sm:text-xs">
              Feni Business Ecosystem
            </p>
          </div>

          <div className="mt-8 h-1 w-24 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-full origin-left animate-[pulse_1.2s_ease-in-out]" />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#05070b] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,128,128,0.13),transparent_30%),radial-gradient(circle_at_85%_80%,rgba(255,215,0,0.06),transparent_25%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[2560px] flex-col lg:flex-row">
        {/* Visual Panel */}
        <section className="relative hidden min-h-screen overflow-hidden lg:flex lg:w-[52%] xl:w-[55%]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('/images/fenix-login-bg.jpg')",
            }}
          />

          <div className="absolute inset-0 bg-[#05070b]/55" />

          <div className="absolute inset-0 bg-gradient-to-br from-[#05070b]/90 via-[#05070b]/45 to-[#008080]/20" />

          <div className="relative z-10 flex w-full flex-col justify-between p-8 xl:p-12 2xl:p-16">
            <div className="flex items-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-xl">
                <span className="text-lg font-black">
                  F<span className="text-[#008080]">X</span>
                </span>
              </div>

              <div className="ml-3">
                <p className="text-lg font-black tracking-tight">
                  Feni<span className="text-[#008080]">X</span>
                </p>

                <p className="text-[9px] uppercase tracking-[0.28em] text-white/45">
                  Business Ecosystem
                </p>
              </div>
            </div>

            <div className="max-w-2xl pb-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white/75 backdrop-blur-xl">
                <span className="h-1.5 w-1.5 rounded-full bg-[#008080] shadow-[0_0_12px_rgba(0,128,128,0.9)]" />
                Feni's digital business ecosystem
              </div>

              <h1 className="text-4xl font-black leading-[1.05] tracking-[-0.04em] text-white xl:text-5xl 2xl:text-7xl">
                Build.
                <br />
                Connect.
                <br />
                <span className="text-[#008080]">Grow.</span>
              </h1>

              <p className="mt-6 max-w-xl text-sm leading-7 text-white/65 xl:text-base 2xl:text-lg">
                ফেনীর উদ্যোক্তা, ব্যবসায়ী ও বিনিয়োগকারীদের জন্য
                একটি আধুনিক ডিজিটাল ecosystem।
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-xl">
                  <p className="text-[10px] uppercase tracking-wider text-white/35">
                    Ecosystem
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    Local Business
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-xl">
                  <p className="text-[10px] uppercase tracking-wider text-white/35">
                    Powered by
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    FeniX Brain
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[10px] uppercase tracking-[0.25em] text-white/25">
              FeniX — Feni Business Ecosystem
            </p>
          </div>
        </section>

        {/* Authentication Panel */}
        <section className="flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6 lg:w-[48%] lg:px-10 xl:w-[45%] xl:px-16 2xl:px-24">
          <div className="w-full max-w-[560px]">
            {/* Mobile Brand */}
            <div className="mb-8 flex items-center justify-center lg:hidden">
              <div className="flex items-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                  <span className="text-lg font-black">
                    F<span className="text-[#008080]">X</span>
                  </span>
                </div>

                <div className="ml-3">
                  <p className="text-lg font-black">
                    Feni<span className="text-[#008080]">X</span>
                  </p>

                  <p className="text-[9px] uppercase tracking-[0.25em] text-white/35">
                    Business Ecosystem
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.035] p-5 shadow-2xl backdrop-blur-2xl sm:p-8 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none xl:p-2">
              <div className="mb-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#008080]">
                  {mode === 'login'
                    ? 'Welcome back'
                    : 'Join FeniX'}
                </p>

                <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl 2xl:text-5xl">
                  {mode === 'login'
                    ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন'
                    : 'FeniX-এ অ্যাকাউন্ট তৈরি করুন'}
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/45">
                  {mode === 'login'
                    ? 'আপনার FeniX journey আবার শুরু করুন।'
                    : 'ফেনীর ডিজিটাল ব্যবসায়িক ecosystem-এর সাথে যুক্ত হন।'}
                </p>
              </div>

              {/* OAuth */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={loading || oauthLoading !== null}
                  onClick={() => handleOAuth('google')}
                  className="group flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm font-semibold text-white transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {oauthLoading === 'google' ? (
                    <SpinnerGap
                      size={20}
                      className="animate-spin"
                    />
                  ) : (
                    <GoogleLogo
                      size={20}
                      weight="bold"
                    />
                  )}

                  <span>Google</span>
                </button>

                <button
                  type="button"
                  disabled={loading || oauthLoading !== null}
                  onClick={() => handleOAuth('facebook')}
                  className="group flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm font-semibold text-white transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {oauthLoading === 'facebook' ? (
                    <SpinnerGap
                      size={20}
                      className="animate-spin"
                    />
                  ) : (
                    <FacebookLogo
                      size={20}
                      weight="fill"
                    />
                  )}

                  <span>Facebook</span>
                </button>
              </div>

              {/* Divider */}
              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/[0.08]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
                  অথবা
                </span>

                <div className="h-px flex-1 bg-white/[0.08]" />
              </div>

              {/* Messages */}
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-3.5 text-sm text-red-200">
                  <XCircle
                    size={20}
                    className="mt-0.5 shrink-0"
                  />

                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-3.5 text-sm text-emerald-200">
                  <CheckCircle
                    size={20}
                    className="mt-0.5 shrink-0"
                  />

                  <p>{success}</p>
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={handleAuth}
                className="space-y-4"
              >
                {mode === 'signup' && (
                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-xs font-semibold text-white/55"
                    >
                      পুরো নাম
                    </label>

                    <div className="relative">
                      <User
                        size={19}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                      />

                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(event) =>
                          setFullName(event.target.value)
                        }
                        placeholder="আপনার পুরো নাম"
                        autoComplete="name"
                        disabled={loading}
                        className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.045] pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#008080]/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#008080]/10 disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-semibold text-white/55"
                  >
                    ইমেইল অ্যাড্রেস
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    inputMode="email"
                    disabled={loading}
                    className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#008080]/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#008080]/10 disabled:opacity-50"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold text-white/55"
                    >
                      পাসওয়ার্ড
                    </label>

                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={loading}
                        className="text-xs font-semibold text-[#008080] transition-colors hover:text-teal-300 disabled:opacity-50"
                      >
                        পাসওয়ার্ড ভুলে গেছেন?
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <LockKey
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                    />

                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="আপনার পাসওয়ার্ড"
                      autoComplete={
                        mode === 'login'
                          ? 'current-password'
                          : 'new-password'
                      }
                      disabled={loading}
                      className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.045] pl-12 pr-12 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#008080]/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#008080]/10 disabled:opacity-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      aria-label={
                        showPassword
                          ? 'পাসওয়ার্ড লুকান'
                          : 'পাসওয়ার্ড দেখান'
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/35 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeSlash size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || oauthLoading !== null}
                  className="group mt-2 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#008080] px-5 text-sm font-bold text-white shadow-[0_12px_35px_rgba(0,128,128,0.18)] transition-all duration-200 hover:bg-[#009999] hover:shadow-[0_15px_40px_rgba(0,128,128,0.25)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <SpinnerGap
                        size={20}
                        className="animate-spin"
                      />

                      <span>প্রসেসিং...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {mode === 'login'
                          ? 'লগইন করুন'
                          : 'অ্যাকাউন্ট তৈরি করুন'}
                      </span>

                      <ArrowRight
                        size={19}
                        weight="bold"
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>

              {/* Switch Auth Mode */}
              <div className="mt-7 text-center">
                <p className="text-sm text-white/40">
                  {mode === 'login'
                    ? 'নতুন এখানে?'
                    : 'ইতিমধ্যে অ্যাকাউন্ট আছে?'}{' '}
                  <button
                    type="button"
                    onClick={switchMode}
                    disabled={loading || oauthLoading !== null}
                    className="font-bold text-[#008080] transition-colors hover:text-teal-300 disabled:opacity-50"
                  >
                    {mode === 'login'
                      ? 'সাইন-আপ করুন'
                      : 'লগইন করুন'}
                  </button>
                </p>
              </div>

              {/* Security */}
              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-white/25">
                <ShieldCheck size={15} />

                <span>
                  Your authentication is securely handled by Supabase
                </span>
              </div>

              {/* Mobile footer */}
              <p className="mt-6 text-center text-[9px] uppercase tracking-[0.2em] text-white/15 lg:hidden">
                FeniX — Feni Business Ecosystem
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
