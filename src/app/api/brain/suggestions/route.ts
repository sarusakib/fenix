'use server'

import { NextResponse } from 'next/server'
import { normalizeFeniBrainQuery } from '../../../lib/feniBrainQuery'
import { buildBrainSuggestions } from '../../../lib/feniBrainEngine'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_QUERY_LENGTH = 80

export async function GET(request: Request) {
  const url = new URL(request.url)
  const query = url.searchParams.get('q')?.trim().slice(0, MAX_QUERY_LENGTH) || ''

  const parsed = normalizeFeniBrainQuery(query)
  const suggestions = buildBrainSuggestions(parsed, query.length >= 2 ? 8 : 6)

  return NextResponse.json(
    { success: true, query, suggestions, engineVersion: '3.0' },
    { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=120' } },
  )
}
