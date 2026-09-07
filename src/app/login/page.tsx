'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '../../utils/supabase/client'
import { useAuthStore } from '../../store/useAuthStore'

import {
  type AuthMode,
  type OAuthProvider,
  getSafeAuthMessage,
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
  const [oauthLoading, setOauthLoading] =
    useState<OAuthProvider | null>(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const handleAuth = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

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
        const { data, error: signUpError } =
          await signUpWithEmail({
            supabase,
            email,
            password,
            fullName,
          })

        if (signUpError) {
          throw signUpError
        }

        if (data.session) {
          setAuth(data.session)
          resetFailedAttempts()

          router.replace('/')
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
        await signInWithEmail({
          supabase,
          email,
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

      router.replace('/')
      router.refresh()
    } catch (authError: unknown) {
      const message =
        authError instanceof Error
          ? getSafeAuthMessage(authError.message)
          : 'একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (
    provider: OAuthProvider
  ) => {
    clearMessages()
    setOauthLoading(provider)

    try {
      const { error: oauthError } =
        await signInWithOAuth({
          supabase,
          provider,
          origin: window.location.origin,
        })

      if (oauthError) {
        throw oauthError
      }
    } catch (authError: unknown) {
      const message =
        authError instanceof Error
          ? getSafeAuthMessage(authError.message)
          : 'Social login চালু করা যাচ্ছে না।'

      setError(message)
      setOauthLoading(null)
    }
  }

  const handleForgotPassword = async () => {
    clearMessages()

    if (!email.trim()) {
      setError(
        'Password reset করতে আগে আপনার ইমেইল দিন।'
      )
      return
    }

    setLoading(true)

    try {
      const { error: resetError } =
        await sendPasswordReset({
          supabase,
          email,
          origin: window.location.origin,
        })

      if (resetError) {
        throw resetError
      }

      setSuccess(
        'Password reset করার জন্য আপনার ইমেইলে একটি লিংক পাঠানো হয়েছে।'
      )
    } catch (resetError: unknown) {
      const message =
        resetError instanceof Error
          ? getSafeAuthMessage(resetError.message)
          : 'Password reset করা যাচ্ছে না।'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchMode = () => {
    clearMessages()

    setMode((currentMode) =>
      currentMode === 'login' ? 'signup' : 'login'
    )

    setPassword('')
  }

  const interactionDisabled =
    loading || oauthLoading !== null

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#05070b] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
        <img
          src="/images/IMG_20260907_032431.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-[#05070b]/10" />

        <div className="absolute inset-0 bg-gradient-to-b from-[#05070b]/15 via-[#05070b]/5 to-[#05070b]/25" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[2560px] flex-col lg:flex-row">
        <LoginVisual />

        <section className="flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6 lg:w-[48%] lg:px-10 xl:w-[45%] xl:px-16 2xl:px-24">
          <div className="w-full max-w-[560px]">
            <MobileBrand />

            <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.035] p-5 shadow-2xl backdrop-blur-2xl sm:p-8 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none xl:p-2">
              <AuthHeader mode={mode} />

              <SocialLogin
                loading={oauthLoading}
                disabled={interactionDisabled}
                onLogin={handleOAuth}
              />

              <AuthMessage
                error={error}
                success={success}
              />

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
                onTogglePassword={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                onForgotPassword={
                  handleForgotPassword
                }
                onSubmit={handleAuth}
              />

              <AuthSwitch
                mode={mode}
                disabled={interactionDisabled}
                onSwitch={handleSwitchMode}
              />

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
