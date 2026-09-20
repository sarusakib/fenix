'use client'

import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '../../utils/supabase/client'
import { useAuthStore } from '../../store/useAuthStore'
import {
  type AuthMode,
  type OAuthProvider,
  getSafeAuthMessage,
  isPasswordCompromised,
  sendPasswordReset,
  signInWithEmail,
  signInWithOAuth,
  signUpWithEmail,
  validateAuthInput,
} from '../../lib/auth/auth-utils'

import LoginVisual from './components/LoginVisual'
import MobileBrand from './components/MobileBrand'
import AuthHeader from './components/AuthHeader'
import SocialLogin from './components/SocialLogin'
import AuthMessage from './components/AuthMessage'
import AuthForm from './components/AuthForm'
import AuthSwitch from './components/AuthSwitch'
import SecurityNotice from './components/SecurityNotice'

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const resetFailedAttempts = useAuthStore((state) => state.resetFailedAttempts)

  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let mounted = true

    const checkExistingSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!mounted) return

      if (session) {
        setAuth(session)
        router.replace('/')
        return
      }

      const callbackError = new URLSearchParams(window.location.search).get('error')
      if (callbackError) setError(callbackError)
      setCheckingSession(false)
    }

    void checkExistingSession()
    return () => { mounted = false }
  }, [router, setAuth])

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearMessages()

    const validationError = validateAuthInput({ mode, email, password, fullName })
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      if (mode === 'signup') {
        const compromised = await isPasswordCompromised(password)
        if (compromised) {
          setError('এই password আগে data breach-এ পাওয়া গেছে। অন্য একটি নতুন password ব্যবহার করুন।')
          return
        }

        const { data, error: signUpError } = await signUpWithEmail({ supabase, email, password, fullName })
        if (signUpError) throw signUpError

        if (data.session) {
          setAuth(data.session)
          resetFailedAttempts()
          router.replace('/')
          router.refresh()
          return
        }

        setSuccess('অ্যাকাউন্ট তৈরি হয়েছে। আপনার ইমেইল confirm করে তারপর login করুন।')
        setMode('login')
        setPassword('')
        return
      }

      const { data, error: signInError } = await signInWithEmail({ supabase, email, password })
      if (signInError) throw signInError
      if (!data.session) throw new Error('Login session তৈরি হয়নি।')

      setAuth(data.session)
      resetFailedAttempts()
      router.replace('/')
      router.refresh()
    } catch (authError: unknown) {
      setError(authError instanceof Error ? getSafeAuthMessage(authError.message) : 'একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: OAuthProvider) => {
    clearMessages()
    setOauthLoading(provider)
    const supabase = createClient()

    try {
      const { error: oauthError } = await signInWithOAuth({ supabase, provider, origin: window.location.origin })
      if (oauthError) throw oauthError
    } catch (authError: unknown) {
      setError(authError instanceof Error ? getSafeAuthMessage(authError.message) : 'Social login চালু করা যাচ্ছে না।')
      setOauthLoading(null)
    }
  }

  const handleForgotPassword = async () => {
    clearMessages()

    if (!email.trim()) {
      setError('Password reset করতে আগে আপনার ইমেইল দিন।')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error: resetError } = await sendPasswordReset({ supabase, email, origin: window.location.origin })
      if (resetError) throw resetError
      setSuccess('Password reset করার জন্য আপনার ইমেইলে একটি লিংক পাঠানো হয়েছে।')
    } catch (resetError: unknown) {
      setError(resetError instanceof Error ? getSafeAuthMessage(resetError.message) : 'Password reset করা যাচ্ছে না।')
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchMode = () => {
    clearMessages()
    setMode((currentMode) => currentMode === 'login' ? 'signup' : 'login')
    setPassword('')
  }

  const interactionDisabled = checkingSession || loading || oauthLoading !== null

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05070b] text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-[#63d8d4]" aria-label="Checking session" role="status" />
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#05070b] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 lg:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(99,216,212,.18),transparent_32%),radial-gradient(circle_at_85%_75%,rgba(215,188,127,.10),transparent_30%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:36px_36px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[2560px] flex-col lg:flex-row">
        <LoginVisual />

        <section className="flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6 lg:w-[48%] lg:px-10 xl:w-[45%] xl:px-16 2xl:px-24">
          <div className="w-full max-w-[560px]">
            <MobileBrand />

            <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.035] p-5 shadow-2xl backdrop-blur-2xl sm:p-8 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none xl:p-2">
              <AuthHeader mode={mode} />
              <SocialLogin loading={oauthLoading} disabled={interactionDisabled} onLogin={handleOAuth} />
              <AuthMessage error={error} success={success} />
              <AuthForm
                mode={mode}
                fullName={fullName}
                email={email}
                password={password}
                showPassword={showPassword}
                loading={loading}
                disabled={interactionDisabled}
                onFullNameChange={setFullName}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onTogglePassword={() => setShowPassword((current) => !current)}
                onForgotPassword={handleForgotPassword}
                onSubmit={handleAuth}
              />
              <AuthSwitch mode={mode} disabled={interactionDisabled} onSwitch={handleSwitchMode} />
              <SecurityNotice />
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
