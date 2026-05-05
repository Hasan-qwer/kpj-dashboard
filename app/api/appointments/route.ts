import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Use direct REST to avoid session-based RLS blocking reads
  const res = await fetch(
    `${url}/rest/v1/appointments?select=*&order=created_at.desc`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  )

  if (!res.ok) {
    // Fallback: try with server client
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data ?? [])
  }

  const data = await res.json()
  return NextResponse.json(Array.isArray(data) ? data : [])
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  // Accept either schema: dashboard form uses customer_name/reason directly
  const row = {
    customer_name: body.customer_name ?? body.patient_name,
    customer_phone: body.customer_phone ?? body.patient_phone ?? null,
    appointment_date: body.appointment_date,
    appointment_time: body.appointment_time,
    reason: body.reason ?? body.specialty ?? '',
    notes: body.notes ?? null,
    status: body.status ?? 'pending',
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert(row)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { id, ...updates } = body

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
