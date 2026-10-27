import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/app/libs/supabaseServer'
import { issueChatOrderToken } from '@/app/libs/chatOrderToken'

/**
 * Returns only the signed-in user's basic profile. The bearer token is
 * verified with Supabase Auth first, then the same JWT is used for the query
 * so the profiles RLS policy continues to enforce id = auth.uid().
 */
export async function POST(request: Request) {
  let supabase = await createSupabaseServer()
  let { data: { user }, error: authError } = await supabase.auth.getUser()

  // Some browser auth configurations keep the session in Supabase storage
  // rather than a server cookie. Verify that access token with Supabase Auth,
  // then keep its user JWT on the profile query so RLS still applies.
  if (!user) {
    const accessToken = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON
    if (accessToken && supabaseUrl && anonKey) {
      supabase = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      }) as typeof supabase
      const verified = await supabase.auth.getUser(accessToken)
      user = verified.data.user
      authError = verified.error
    }
  }

  if (authError || !user?.email) {
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401, headers: { 'Cache-Control': 'private, no-store' } },
    )
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('Authenticated chat profile lookup failed:', profileError)
    return NextResponse.json(
      { error: 'Profile lookup failed.' },
      { status: 502, headers: { 'Cache-Control': 'private, no-store' } },
    )
  }

  if (!profile) {
    return NextResponse.json(
      { error: 'Profile not found.' },
      { status: 404, headers: { 'Cache-Control': 'private, no-store' } },
    )
  }

  return NextResponse.json(
    {
      profile: {
        id: user.id,
        email: user.email,
        firstName: profile.first_name ?? '',
        lastName: profile.last_name ?? '',
      },
      // This short-lived capability can read only this user's chat order summary.
      // It is intentionally unavailable until the server secret is configured.
      chatOrderToken: issueChatOrderToken(user.id),
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
