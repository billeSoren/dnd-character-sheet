'use client'

import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'

export default function RegisterPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-dnd-bg flex flex-col items-center justify-center px-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm text-center">
          <span className="text-5xl block mb-4">📜</span>
          <h1 className="text-2xl font-bold text-dnd-text mb-2">Confirm your email</h1>
          <p className="text-dnd-muted mb-6">
            We&apos;ve sent a confirmation email to <span className="text-dnd-accent">{email}</span>. Click the link to activate your account.
          </p>
          <Link href="/login" className="text-dnd-accent hover:opacity-80 transition-opacity text-sm font-medium">
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dnd-bg flex flex-col items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-dnd-accent hover:opacity-80 transition-opacity">
            <span className="text-3xl">⚔️</span>
            <span className="text-xl font-bold tracking-wide">D&D Character Sheet</span>
          </Link>
        </div>

        {/* Card */}
        <div className="relative border border-dnd-border bg-dnd-card rounded-lg p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-dnd-accent/50 to-transparent rounded-t-lg" />

          <h1 className="text-2xl font-bold text-dnd-text mb-1">Create Account</h1>
          <p className="text-dnd-muted text-sm mb-6">Begin your legend today</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm text-dnd-muted mb-1.5 font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-dnd-subtle border border-dnd-border focus:border-dnd-accent rounded-lg text-dnd-text placeholder:text-dnd-muted outline-none transition-colors text-sm"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm text-dnd-muted mb-1.5 font-medium" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-dnd-subtle border border-dnd-border focus:border-dnd-accent rounded-lg text-dnd-text placeholder:text-dnd-muted outline-none transition-colors text-sm"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm text-dnd-muted mb-1.5 font-medium" htmlFor="confirm">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-2.5 bg-dnd-subtle border border-dnd-border focus:border-dnd-accent rounded-lg text-dnd-text placeholder:text-dnd-muted outline-none transition-colors text-sm"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-dnd-accent hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-opacity mt-2"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-dnd-muted text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-dnd-accent hover:opacity-80 transition-opacity font-medium">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
