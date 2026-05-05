import { NextResponse } from 'next/server'
import type { RetellCall } from '@/types'

const RETELL_API_KEY = process.env.RETELL_API_KEY
const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID
const RETELL_BASE = 'https://api.retellai.com'

export async function GET(request: Request) {
  if (!RETELL_API_KEY) {
    return NextResponse.json({ error: 'RETELL_API_KEY not configured' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') ?? '100')

  const body: Record<string, unknown> = {
    limit,
    sort_order: 'descending',
  }

  // Filter to this agent only
  if (RETELL_AGENT_ID) {
    body.filter_criteria = { agent_id: [RETELL_AGENT_ID] }
  }

  try {
    const res = await fetch(`${RETELL_BASE}/v2/list-calls`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Retell API error: ${text}` }, { status: res.status })
    }

    const data = await res.json()
    const calls: RetellCall[] = data.calls ?? data ?? []
    return NextResponse.json(calls)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
