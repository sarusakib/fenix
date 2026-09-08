import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const requestedNext = searchParams.get('next')

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
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=Could+not+authenticate+user`
  )
}
