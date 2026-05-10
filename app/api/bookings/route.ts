import { NextRequest, NextResponse } from 'next/server'
import { getSupabase, CreateBookingPayload } from '@/lib/supabase'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidDate(dateStr: string): boolean {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d >= today
}

export async function POST(req: NextRequest) {
  let body: Partial<CreateBookingPayload>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Неверный формат запроса' }, { status: 400 })
  }

  const { client_name, client_email, booking_date, service_id } = body

  if (!client_name?.trim()) {
    return NextResponse.json({ error: 'Имя обязательно' }, { status: 400 })
  }
  if (!client_email?.trim() || !isValidEmail(client_email)) {
    return NextResponse.json({ error: 'Неверный email' }, { status: 400 })
  }
  if (!booking_date || !isValidDate(booking_date)) {
    return NextResponse.json(
      { error: 'Дата обязательна и не может быть в прошлом' },
      { status: 400 }
    )
  }
  if (!service_id || typeof service_id !== 'number') {
    return NextResponse.json({ error: 'Услуга обязательна' }, { status: 400 })
  }

  const { data: service, error: serviceErr } = await getSupabase()
    .from('services')
    .select('id')
    .eq('id', service_id)
    .single()

  if (serviceErr || !service) {
    return NextResponse.json({ error: 'Услуга не найдена' }, { status: 400 })
  }

  const { data, error } = await getSupabase()
    .from('bookings')
    .insert({
      client_name: client_name.trim(),
      client_email: client_email.trim().toLowerCase(),
      booking_date,
      service_id,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Supabase insert error:', error)
    return NextResponse.json(
      { error: 'Ошибка при сохранении записи' },
      { status: 500 }
    )
  }

  return NextResponse.json(data, { status: 201 })
}

export async function GET() {
  const { data, error } = await getSupabase()
    .from('bookings')
    .select('*, services(id, name, duration_minutes, price)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Supabase select error:', error)
    return NextResponse.json({ error: 'Ошибка при получении данных' }, { status: 500 })
  }

  return NextResponse.json(data)
}
