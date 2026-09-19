import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const checks = {
    supabase: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
    huggingFace: Boolean(process.env.HUGGINGFACE_API_KEY),
    brainChat: Boolean(process.env.HUGGINGFACE_API_KEY),
  }

  const ready = Object.values(checks).every(Boolean)

  return NextResponse.json(
    {
      service: 'Feni Brain',
      version: '2.0',
      status: ready ? 'ready' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    },
    {
      status: ready ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
        'X-FeniX-Brain': '2.0-health',
      },
    },
  )
}
