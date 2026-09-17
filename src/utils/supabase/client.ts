import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

type FenixBrowserClient = ReturnType<typeof createBrowserClient<Database>>

let browserClient: FenixBrowserClient | undefined

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
