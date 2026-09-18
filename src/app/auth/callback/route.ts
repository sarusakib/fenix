import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const requestedNext = requestUrl.searchParams.get('next')

  // Keep the callback redirect on the exact host that received
  // the OAuth callback. Do not rebuild the host from proxy headers.
  // This prevents OAuth from being redirected to an invalid or
  // deployment-specific Vercel hostname.
  const next =
    requestedNext &&
    requestedNext.startsWith('/') &&
    !requestedNext.startsWith('//')
      ? requestedNext
      : '/'

  if (code) {
    const supabase = await createClient()

    const { error } =
      await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(
        new URL(next, requestUrl.origin),
      )
    }
  }

  const errorUrl = new URL('/login', requestUrl.origin)
  errorUrl.searchParams.set(
    'error',
    'Could not authenticate user',
  )

  return NextResponse.redirect(errorUrl)
}
