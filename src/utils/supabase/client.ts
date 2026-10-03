import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type FenixBrowserClient = ReturnType<typeof createBrowserClient<Database>>

let browserClient: FenixBrowserClient | undefined
let publicClient: SupabaseClient<Database> | undefined

export function createClient(): FenixBrowserClient {
  if (browserClient) {
    return browserClient
  }

  browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return browserClient
}

export function createPublicClient(): SupabaseClient<Database> {
  if (publicClient) return publicClient

  publicClient = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  )

  return publicClient
}
