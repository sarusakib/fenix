import { NextResponse } from 'next/server'
import { createClient } from '../../../utils/supabase/server'

function getSafeRedirectPath(value: string | null) {
  if (!value) {
    return '/'
  }

  if (!value.startsWith('/')) {
    return '/'
  }

  if (value.startsWith('//')) {
    return '/'
  }

  return value
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)

  const code = requestUrl.searchParams.get('code')
  const next = getSafeRedirectPath(
    requestUrl.searchParams.get('next'),
  )

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=Authentication+failed', requestUrl.origin),
    )
  }

  try {
    const supabase = await createClient()

    const { error } =
      await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(
        new URL(next, requestUrl.origin),
      )
    }

    console.error('Supabase auth callback failed:', {
      message: error.message,
    })
  } catch (error) {
    console.error('Auth callback failed:', {
      name: error instanceof Error ? error.name : 'UnknownError',
    })
  }

  return NextResponse.redirect(
    new URL('/login?error=Could+not+authenticate+user', requestUrl.origin),
  )
}
