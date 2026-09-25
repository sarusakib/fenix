import { NextResponse } from 'next/server'

const COOKIE = 'fenix_news_seen'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MAX_SEEN = 80

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const id = typeof body?.id === 'string' ? body.id.trim() : ''
    if (!UUID_RE.test(id)) return NextResponse.json({ ok: false }, { status: 400 })

    const cookieHeader = request.headers.get('cookie') ?? ''
    const match = cookieHeader.match(new RegExp('(?:^|; )' + COOKIE + '=([^;]*)'))
    const current = decodeURIComponent(match?.[1] ?? '')
      .split(',').map(v => v.trim()).filter(v => UUID_RE.test(v))
    const next = [id, ...current.filter(v => v !== id)].slice(0, MAX_SEEN)

    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE, next.join(','), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 180,
    })
    return response
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
