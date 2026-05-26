import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getSupabaseWithAuth() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

export async function POST(request) {
  const supabase = await getSupabaseWithAuth()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Not logged in' }, { status: 401 })

  const body = await request.json()
  const { search_type, query, result_summary } = body

  await supabase.from('search_history').insert({
    user_id: user.id,
    search_type,
    query,
    result_summary: result_summary || ''
  })

  return Response.json({ message: 'Saved' })
}

export async function GET(request) {
  const supabase = await getSupabaseWithAuth()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ history: [] })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'medicine'

  const { data } = await supabase
    .from('search_history')
    .select('*')
    .eq('user_id', user.id)
    .eq('search_type', type)
    .order('created_at', { ascending: false })
    .limit(5)

  return Response.json({ history: data || [] })
}

export async function DELETE(request) {
  const supabase = await getSupabaseWithAuth()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Not logged in' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  const query = supabase.from('search_history').delete().eq('user_id', user.id)
  if (type) query.eq('search_type', type)
  await query

  return Response.json({ message: 'Cleared' })
}