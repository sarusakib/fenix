/**
 * FeniX — Runtime Environment
 *
 * Centralizes public environment variables.
 *
 * Important:
 * - Only NEXT_PUBLIC_* values belong here.
 * - Never put Supabase service-role keys in this file.
 * - Server-only secrets must live in server-only modules.
 */

export type FenixPublicEnv = {
  supabaseUrl: string
  supabaseAnonKey: string
}

function requirePublicEnv(
  name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(
      `[FeniX] Missing required environment variable: ${name}`
    )
  }

  return value
}

export function getFenixPublicEnv(): FenixPublicEnv {
  return {
    supabaseUrl: requirePublicEnv('NEXT_PUBLIC_SUPABASE_URL'),
    supabaseAnonKey: requirePublicEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  }
}
