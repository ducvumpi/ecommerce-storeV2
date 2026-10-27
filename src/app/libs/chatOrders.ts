'use client'

import { supabase } from '@/app/libs/supabaseClient'

export interface ChatOrderSummary {
  id: string
  createdAt: string
  status: string
  paymentMethod: string | null
  total: number
  items: Array<{
    name: string
    quantity: number
    size: string | null
    color: string | null
    price: number
  }>
}

/** Fetch order summaries through the authenticated same-origin API. */
export async function getChatOrderSummaries(): Promise<ChatOrderSummary[]> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session?.access_token) {
    throw new Error('Đăng nhập để xem đơn hàng.')
  }

  const response = await fetch('/api/chat/orders', {
    method: 'GET',
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: 'no-store',
    credentials: 'same-origin',
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(typeof body.error === 'string' ? body.error : 'Chưa thể tải đơn hàng lúc này.')
  }
  return Array.isArray(body.orders) ? body.orders as ChatOrderSummary[] : []
}
