import type { createClient } from '@/utils/supabase/client'

type FenixSupabaseClient = ReturnType<typeof createClient>

export type AuthMode = 'login' | 'signup'

export type OAuthProvider = 'google' | 'facebook'

type ValidateAuthInput = {
  mode: AuthMode
  email: string
  password: string
  fullName?: string
}

type SignInWithEmailInput = {
  supabase: FenixSupabaseClient
  email: string
  password: string
}

type SignUpWithEmailInput = {
  supabase: FenixSupabaseClient
  email: string
  password: string
  fullName: string
}

type SignInWithOAuthInput = {
  supabase: FenixSupabaseClient
  provider: OAuthProvider
  origin: string
}

type SendPasswordResetInput = {
  supabase: FenixSupabaseClient
  email: string
  origin: string
}

export function validateAuthInput({
  mode,
  email,
  password,
  fullName,
}: ValidateAuthInput): string | null {
  if (!email.trim()) {
    return 'Email is required.'
  }

  if (!password) {
    return 'Password is required.'
  }

  if (mode === 'signup') {
    if (!fullName?.trim()) {
      return 'Name is required.'
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters.'
    }
  }

  return null
}

export function getSafeAuthMessage(error: unknown): string {
  if (typeof error === 'string' && error.trim()) {
    return error.trim()
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim()
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    const message = (error as { message: string }).message.trim()

    if (message) {
      return message
    }
  }

  return 'Something went wrong. Please try again.'
}

export async function signInWithEmail({
  supabase,
  email,
  password,
}: SignInWithEmailInput) {
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
}: SignUpWithEmailInput) {
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
}: SignInWithOAuthInput) {
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
}: SendPasswordResetInput) {
  return supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${origin}/auth/reset-password`,
  })
}
