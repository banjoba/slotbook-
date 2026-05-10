import { createClient, SupabaseClient } from '@supabase/supabase-js'

export interface Service {
  id: number
  name: string
  duration_minutes: number
  price: number
}

export interface Booking {
  id: number
  client_name: string
  client_email: string
  booking_date: string
  service_id: number
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
  services?: Service
}

export interface CreateBookingPayload {
  client_name: string
  client_email: string
  booking_date: string
  service_id: number
}

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // supports both legacy anon key and new publishable key format
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase env vars not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local'
    )
  }
  _client = createClient(url, key)
  return _client
}
