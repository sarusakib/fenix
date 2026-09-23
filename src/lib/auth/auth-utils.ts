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
  emailRedirectTo?: string
}

type SignInWithOAuthInput = {
  supabase: FenixSupabaseClient
  provider: OAuthProvider
  origin: string
  next?: string
}

type SendPasswordResetInput = {
  supabase: FenixSupabaseClient
  email: string
  origin: string
}

const MIN_PASSWORD_LENGTH = 12

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

    if (password.length < MIN_PASSWORD_LENGTH) {
      return 'Signup password must be at least 12 characters.'
    }

    if (!/[a-z]/.test(password)) {
      return 'Signup password must include a lowercase letter.'
    }

    if (!/[A-Z]/.test(password)) {
      return 'Signup password must include an uppercase letter.'
    }

    if (!/\d/.test(password)) {
      return 'Signup password must include a number.'
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return 'Signup password must include a special character.'
    }
  }

  return null
}

export async function isPasswordCompromised(password: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const digest = await crypto.subtle.digest('SHA-1', encoder.encode(password))
  const bytes = Array.from(new Uint8Array(digest))
  const hash = bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase()
  const prefix = hash.slice(0, 5)
  const suffix = hash.slice(5)

  const response = await fetch(
    `https://api.pwnedpasswords.com/range/${prefix}`,
    {
      headers: {
        'Add-Padding': 'true',
      },
      cache: 'no-store',
    },
  )

  if (!response.ok) {
    throw new Error('Password security check is temporarily unavailable.')
  }

  const body = await response.text()

  return body.split('\n').some((line) => {
    const [returnedSuffix, count] = line.trim().split(':')
    return returnedSuffix?.trim().toUpperCase() === suffix && Number.parseInt(count ?? '0', 10) > 0
  })
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
  emailRedirectTo,
}: SignUpWithEmailInput) {
  return supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      ...(emailRedirectTo ? { emailRedirectTo } : {}),
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
  next = '/',
}: SignInWithOAuthInput) {
  const callback = new URL('/auth/callback', origin)
  callback.searchParams.set('next', next)

  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callback.toString(),
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
