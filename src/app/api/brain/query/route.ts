import { NextResponse } from 'next/server'
import { answerFeniBrain } from '../../../actions/answerFeniBrain'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_QUERY_LENGTH = 120

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const query =
      body && typeof body.query === 'string'
        ? body.query.trim().slice(0, MAX_QUERY_LENGTH)
        : ''

    if (query.length < 2) {
      return NextResponse.json(
        { success: false, error: 'প্রশ্নটি একটু বিস্তারিত লিখুন।' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } },
      )
    }

    const result = await answerFeniBrain(query)

    return NextResponse.json(result, {
      status: result?.success === false ? 400 : 200,
      headers: {
        'Cache-Control': 'no-store',
        'X-FeniX-Brain': '3.0-live-engine',
      },
    })
  } catch (error) {
    console.error('Feni Brain API error:', {
      name: error instanceof Error ? error.name : 'unknown',
    })

    return NextResponse.json(
      { success: false, error: 'Feni Brain বর্তমানে unavailable.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method Not Allowed' },
    { status: 405, headers: { Allow: 'POST', 'Cache-Control': 'no-store' } },
  )
}
