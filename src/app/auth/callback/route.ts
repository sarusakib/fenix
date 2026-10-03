import { NextResponse } from 'next/server'
import type { Session } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { ROUTES } from '@/lib/core/routes'

function stringValue(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

async function syncFacebookProfile(supabase: Awaited<ReturnType<typeof createClient>>, session: Session) {
  const user = session.user
  const isFacebook = user.identities?.some((identity) => identity.provider === 'facebook') ||
    user.app_metadata?.provider === 'facebook'
  if (!isFacebook) return

  const metadata = user.user_metadata ?? {}
  let providerName = stringValue(metadata.full_name, metadata.name)
  let providerAvatar = stringValue(metadata.avatar_url, metadata.picture)
  let providerCover = stringValue(metadata.cover_url, metadata.cover, metadata.cover_photo)

  if (session.provider_token) {
    const version = process.env.FACEBOOK_GRAPH_API_VERSION?.trim() || 'v24.0'
    const endpoint = new URL('https://graph.facebook.com/' + version + '/me')
    endpoint.searchParams.set('fields', 'id,name,picture.type(large),cover')
    endpoint.searchParams.set('access_token', session.provider_token)

    try {
      const response = await fetch(endpoint, { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json() as {
          name?: unknown
          picture?: { data?: { url?: unknown } }
          cover?: { source?: unknown }
        }
        providerName = stringValue(providerName, data.name)
        providerAvatar = stringValue(providerAvatar, data.picture?.data?.url)
        providerCover = stringValue(providerCover, data.cover?.source)
      } else {
        const fallback = new URL('https://graph.facebook.com/' + version + '/me')
        fallback.searchParams.set('fields', 'id,name,picture.type(large)')
        fallback.searchParams.set('access_token', session.provider_token)
        const fallbackResponse = await fetch(fallback, { cache: 'no-store' })
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json() as {
            name?: unknown
            picture?: { data?: { url?: unknown } }
          }
          providerName = stringValue(providerName, data.name)
          providerAvatar = stringValue(providerAvatar, data.picture?.data?.url)
        }
      }
    } catch {
      // OAuth remains successful even when provider profile enrichment is unavailable.
    }
  }

  if (!providerName && !providerAvatar && !providerCover) return

  const { data: current } = await supabase
    .from('profiles')
    .select('full_name,avatar_url,cover_url')
    .eq('id', user.id)
    .maybeSingle()

  if (!current) return

  const patch: Record<string, string> = {}
  if (!current.full_name && providerName) patch.full_name = providerName.slice(0, 160)
  if (!current.avatar_url && providerAvatar) patch.avatar_url = providerAvatar.slice(0, 1000)
  if (!current.cover_url && providerCover) patch.cover_url = providerCover.slice(0, 1000)
  if (!Object.keys(patch).length) return

  await supabase
    .from('profiles')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', user.id)
}

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
      : ROUTES.feed

  if (code) {
    const supabase = await createClient()

    const { data, error } =
      await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      await syncFacebookProfile(supabase, data.session)
      return NextResponse.redirect(
        new URL(next, requestUrl.origin),
      )
    }
  }

  const errorUrl = new URL(ROUTES.auth.login, requestUrl.origin)
  errorUrl.searchParams.set(
    'error',
    'Could not authenticate user',
  )

  return NextResponse.redirect(errorUrl)
}
