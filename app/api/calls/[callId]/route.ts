import { NextResponse } from 'next/server'

const RETELL_API_KEY = process.env.RETELL_API_KEY
const RETELL_BASE = 'https://api.retellai.com'

export async function GET(_req: Request, { params }: { params: Promise<{ callId: string }> }) {
  if (!RETELL_API_KEY) {
    return NextResponse.json({ error: 'RETELL_API_KEY not configured' }, { status: 500 })
  }

  const { callId } = await params

  try {
    const res = await fetch(`${RETELL_BASE}/v2/get-call/${callId}`, {
      headers: { Authorization: `Bearer ${RETELL_API_KEY}` },
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Call not found' }, { status: res.status })
    }

    const call = await res.json()
    return NextResponse.json(call)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
