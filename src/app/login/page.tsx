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
