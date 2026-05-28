import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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

// POST — signup or signin
export async function POST(request) {
  const supabase = await getSupabaseWithAuth()
  const body = await request.json()
  const { action, email, password, full_name } = body

  if (action === 'signup') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name }
      }
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    // Save full name to profiles table
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name
      })
    }

    return Response.json({
      message: 'Account created successfully!',
      user: data.user
    })
  }

  if (action === 'signin') {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({
      message: 'Signed in successfully!',
      user: data.user
    })
  }

  if (action === 'forgot') {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset`
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({
      message: 'Password reset email sent! Check your inbox.'
    })
  }

  if (action === 'signout') {
    await supabase.auth.signOut()
    return Response.json({ message: 'Signed out successfully' })
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 })
}

// GET — get current user
export async function GET() {
  const supabase = await getSupabaseWithAuth()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ user: null })
  }

  // Get profile with full name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name || '',
      avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || '',
    }
  })
}