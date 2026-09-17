import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const requestedNext = requestUrl.searchParams.get('next')

  // Only allow internal relative redirects.
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
      const forwardedHost =
        request.headers.get('x-forwarded-host')
      const forwardedProto =
        request.headers.get('x-forwarded-proto') ?? 'https'

      // Vercel sits behind a proxy, so prefer the original host
      // when it is provided; otherwise use the request origin.
      const targetOrigin = forwardedHost
        ? `${forwardedProto}://${forwardedHost}`
        : requestUrl.origin

      return NextResponse.redirect(
        `${targetOrigin}${next}`
      )
    }
  }

  return NextResponse.redirect(
    `${requestUrl.origin}/login?error=Could+not+authenticate+user`
  )
}
