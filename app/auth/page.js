'use client'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export default function AuthPage() {
  const supabase = createSupabaseBrowserClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>MedIQ Login</h1>
      <p>Sign in to access your Medication Vault</p>
      <button
        onClick={handleGoogleLogin}
        style={{
          padding: '12px 24px',
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Sign in with Google
      </button>
    </div>
  )
}