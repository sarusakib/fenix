import { NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

function createNonce() {
  return btoa(crypto.randomUUID()).replace(/=+$/g, '')
}

function createContentSecurityPolicy(nonce: string) {
  const supabaseOrigin = (() => {
    try {
      return process.env.NEXT_PUBLIC_SUPABASE_URL
        ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
        : ''
    } catch {
      return ''
    }
  })()

  const connectSources = [
    "'self'",
    supabaseOrigin,
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://api.pwnedpasswords.com',
  ].filter(Boolean).join(' ')

  return [
    "default-src 'self'",
    "script-src 'self' 'nonce-" + nonce + "' 'strict-dynamic'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src " + connectSources,
    "img-src 'self' data: blob: https:",
    "media-src 'self' data: blob: https:",
    "frame-src 'self' https://www.openstreetmap.org",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ')
}

const PRIVATE_ROUTE_PREFIXES = [
  '/admin',
  '/dashboard',
  '/messages',
  '/profile',
  '/settings',
  '/directory/manage',
  '/jobs/manage',
  '/commerce/admin',
  '/api/',
  '/auth/',
]

export async function middleware(request: NextRequest) {
  const nonce = createNonce()
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-fenix-nonce', nonce)

  const requestWithNonce = new NextRequest(request, {
    headers: requestHeaders,
  })

  const response = await updateSession(requestWithNonce)
  response.headers.set('Content-Security-Policy', createContentSecurityPolicy(nonce))
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('Origin-Agent-Cluster', '?1')

  const pathname = request.nextUrl.pathname
  if (PRIVATE_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
