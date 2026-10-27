import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/app/libs/supabaseServer'
import { verifyChatOrderToken } from '@/app/libs/chatOrderToken'

/**
 * Returns a small order summary for the currently authenticated storefront user.
 * The Supabase session is read from the server-managed auth cookies; identity
 * fields from Botpress events or request bodies are deliberately ignored.
 */
export async function GET(request: Request) {
  // Prefer the server-verified Supabase session cookie used by the storefront.
  let supabase = await createSupabaseServer()
  let { data: { user }, error: authError } = await supabase.auth.getUser()
  let authorizedUserId = user?.id ?? null
  let usesChatCapability = false

  if (!user) {
    const bearer = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
    const tokenUserId = bearer ? verifyChatOrderToken(bearer) : null
    if (tokenUserId) {
      authorizedUserId = tokenUserId
      authError = null
      usesChatCapability = true
    }

    // Retain support for a genuine Supabase access token from integrations
    // that use the browser-client auth flow. It is verified with Supabase Auth.
    const accessToken = tokenUserId ? null : bearer
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON

    if (accessToken && supabaseUrl && anonKey) {
      supabase = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      }) as typeof supabase
      const verified = await supabase.auth.getUser(accessToken)
      user = verified.data.user
      authorizedUserId = user?.id ?? null
      authError = verified.error
    }
  }

  if (authError || !authorizedUserId) {
    return NextResponse.json(
      { error: 'Đăng nhập để xem đơn hàng.' },
      { status: 401, headers: { 'Cache-Control': 'private, no-store' } },
    )
  }

  // Botpress can't send the browser's session cookie. For a valid, short-lived
  // chat capability, use the server-only service key and always constrain the
  // query to the subject embedded in the verified signature.
  if (usesChatCapability) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json(
        { error: 'Chat order lookup is not configured.' },
        { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
      )
    }
    supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    }) as typeof supabase
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, total_price, created_at, status, payment_method,
      order_items (
        quantity, price,
        product_variants (
          size, color,
          products (name)
        )
      )
    `)
    .eq('user_id', authorizedUserId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    // Keep database details in server logs only; never return them to the chat.
    console.error('Authenticated chat order lookup failed:', error)
    return NextResponse.json(
      { error: 'Chưa thể tải đơn hàng lúc này.' },
      { status: 500, headers: { 'Cache-Control': 'private, no-store' } },
    )
  }

  const orders = (data ?? []).map((order: any) => ({
    id: order.id,
    createdAt: order.created_at,
    status: order.status,
    paymentMethod: order.payment_method,
    total: order.total_price,
    items: (order.order_items ?? []).map((item: any) => ({
      name: item.product_variants?.products?.name ?? 'Sản phẩm',
      quantity: item.quantity,
      size: item.product_variants?.size ?? null,
      color: item.product_variants?.color ?? null,
      price: item.price,
    })),
  }))

  return NextResponse.json(
    { orders },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
