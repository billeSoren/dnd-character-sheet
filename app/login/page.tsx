'use client'

import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Incorrect email or password.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
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

          <h1 className="text-2xl font-bold text-dnd-text mb-1">Welcome Back</h1>
          <p className="text-dnd-muted text-sm mb-6">Log in to continue your adventure</p>

          <form onSubmit={handleLogin} className="space-y-4">
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="text-center text-dnd-muted text-sm mt-6">
            No account?{' '}
            <Link href="/register" className="text-dnd-accent hover:opacity-80 transition-opacity font-medium">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
