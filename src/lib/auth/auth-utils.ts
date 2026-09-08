import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type FenixSupabaseClient = SupabaseClient<Database>

export type AuthMode = 'login' | 'signup'

export type OAuthProvider = 'google' | 'facebook'

export function validateAuthInput(
  mode: AuthMode,
  email: string,
  password: string,
  name?: string,
): string | null {
  if (!email.trim()) {
    return 'Email is required.'
  }

  if (!password) {
    return 'Password is required.'
  }

  if (mode === 'signup') {
    if (!name?.trim()) {
      return 'Name is required.'
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters.'
    }
  }

  return null
}

export function getSafeAuthMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message
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

export async function signInWithEmail(
  supabase: FenixSupabaseClient,
  email: string,
  password: string,
) {
  return supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })
}

export async function signUpWithEmail(
  supabase: FenixSupabaseClient,
  email: string,
  password: string,
  name: string,
) {
  return supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: name.trim(),
        role: 'user',
      },
    },
  })
}

export async function signInWithOAuth(
  supabase: FenixSupabaseClient,
  provider: OAuthProvider,
) {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : ''

  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })
}

export async function sendPasswordReset(
  supabase: FenixSupabaseClient,
  email: string,
) {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : ''

  return supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${origin}/auth/reset-password`,
  })
}
