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

const EMAIL_MAX_LENGTH = 254
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128
const NAME_MAX_LENGTH = 80

function getTrustedOrigin(origin: string): string {
  if (typeof window === 'undefined') {
    throw new Error('Authentication must start in a browser.')
  }

  const browserOrigin = window.location.origin

  try {
    const requestedOrigin = new URL(origin).origin
    if (requestedOrigin !== browserOrigin) {
      throw new Error('Invalid authentication origin.')
    }
  } catch {
    throw new Error('Invalid authentication origin.')
  }

  return browserOrigin
}

export function validateAuthInput({
  mode,
  email,
  password,
  fullName,
}: ValidateAuthInput): string | null {
  const normalizedEmail = email.trim()

  if (!normalizedEmail) return 'Email is required.'
  if (normalizedEmail.length > EMAIL_MAX_LENGTH) return 'Enter a valid email address.'
  if (!password) return 'Password is required.'
  if (password.length > PASSWORD_MAX_LENGTH) return 'Password is too long.'

  if (mode === 'signup') {
    if (!fullName?.trim()) return 'Name is required.'
    if (fullName.trim().length > NAME_MAX_LENGTH) return 'Name is too long.'
    if (password.length < PASSWORD_MIN_LENGTH) {
      return 'Password must be at least 8 characters.'
    }
  }

  return null
}

export function getSafeAuthMessage(error: unknown): string {
  let code = ''

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  ) {
    code = (error as { code: string }).code.toLowerCase()
  }

  if (code === 'invalid_credentials') {
    return 'The email or password is incorrect.'
  }

  if (code === 'email_not_confirmed') {
    return 'Please confirm your email before signing in.'
  }

  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit') {
    return 'Too many requests. Please wait and try again.'
  }

  if (code === 'weak_password') {
    return 'Choose a stronger password.'
  }

  return 'Authentication could not be completed. Please try again.'
}

export async function signInWithEmail({
  supabase,
  email,
  password,
}: SignInWithEmailInput) {
  return supabase.auth.signInWithPassword({
    email: email.trim().slice(0, EMAIL_MAX_LENGTH),
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
    email: email.trim().slice(0, EMAIL_MAX_LENGTH),
    password,
    options: {
      data: {
        full_name: fullName.trim().slice(0, NAME_MAX_LENGTH),
      },
    },
  })
}

export async function signInWithOAuth({
  supabase,
  provider,
  origin,
}: SignInWithOAuthInput) {
  const trustedOrigin = getTrustedOrigin(origin)

  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: trustedOrigin + '/auth/callback?next=%2Fintro',
    },
  })
}

export async function sendPasswordReset({
  supabase,
  email,
  origin,
}: SendPasswordResetInput) {
  const trustedOrigin = getTrustedOrigin(origin)

  return supabase.auth.resetPasswordForEmail(
    email.trim().slice(0, EMAIL_MAX_LENGTH),
    {
      redirectTo: trustedOrigin + '/auth/reset-password',
    },
  )
}
