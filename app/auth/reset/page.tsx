'use client'
import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated successfully! You can now sign in.')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="bg-white border border-ash rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-heading text-charcoal mb-2">Set New Password</h1>
        <p className="text-sm text-muted mb-6">Enter your new password below.</p>

        {message && (
          <div className="bg-severity-safe-bg border border-severity-safe-border text-severity-safe px-4 py-3 rounded-xl mb-4 text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-severity-major-bg border border-severity-major-border text-severity-major px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-charcoal mb-1.5 block">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-4 py-3 border border-ash rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal mb-1.5 block">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              className="w-full px-4 py-3 border border-ash rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full py-3 text-sm font-semibold text-white bg-teal rounded-xl hover:bg-teal-hover disabled:opacity-50 transition-colors"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  )
}