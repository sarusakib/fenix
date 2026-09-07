import type { SupabaseClient } from '@supabase/supabase-js'

export type AuthMode = 'login' | 'signup'

export type OAuthProvider = 'google' | 'facebook'

export function getSafeAuthMessage(message: string) {
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

export function validateAuthInput({
  mode,
  email,
  password,
  fullName,
}: {
  mode: AuthMode
  email: string
  password: string
  fullName: string
}) {
  const cleanEmail = email.trim()
  const cleanName = fullName.trim()

  if (!cleanEmail || !password) {
    return 'ইমেইল এবং পাসওয়ার্ড দিন।'
  }

  if (mode === 'signup' && !cleanName) {
    return 'আপনার পুরো নাম দিন।'
  }

  if (mode === 'signup' && password.length < 6) {
    return 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
  }

  return null
}

export async function signInWithEmail({
  supabase,
  email,
  password,
}: {
  supabase: SupabaseClient
  email: string
  password: string
}) {
  return supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })
}

export async function signUpWithEmail({
  supabase,
  email,
  password,
  fullName,
}: {
  supabase: SupabaseClient
  email: string
  password: string
  fullName: string
}) {
  return supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
        role: 'user',
      },
    },
  })
}

export async function signInWithOAuth({
  supabase,
  provider,
  origin,
}: {
  supabase: SupabaseClient
  provider: OAuthProvider
  origin: string
}) {
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })
}

export async function sendPasswordReset({
  supabase,
  email,
  origin,
}: {
  supabase: SupabaseClient
  email: string
  origin: string
}) {
  return supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${origin}/auth/reset-password`,
  })
  }
