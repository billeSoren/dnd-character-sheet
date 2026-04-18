'use client'

import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useState } from 'react'

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
      setError('Adgangskoderne matcher ikke.')
      return
    }
    if (password.length < 6) {
      setError('Adgangskoden skal være mindst 6 tegn.')
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
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <span className="text-5xl block mb-4">📜</span>
          <h1 className="text-2xl font-bold text-amber-200 mb-2">Bekræft din email</h1>
          <p className="text-stone-400 mb-6">
            Vi har sendt en bekræftelsesmail til <span className="text-amber-300">{email}</span>. Klik på linket for at aktivere din konto.
          </p>
          <Link href="/login" className="text-amber-400 hover:text-amber-300 transition-colors text-sm">
            Tilbage til login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 transition-colors">
            <span className="text-3xl">⚔️</span>
            <span className="text-xl font-bold tracking-wide">D&D Karakterark</span>
          </Link>
        </div>

        {/* Kort */}
        <div className="relative border border-amber-900/40 bg-stone-900/60 rounded-lg p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-700/50 to-transparent rounded-t-lg" />

          <h1 className="text-2xl font-bold text-amber-200 mb-1">Opret konto</h1>
          <p className="text-stone-500 text-sm mb-6">Begynd din legende i dag</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm text-amber-300/80 mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-800/80 border border-stone-700 focus:border-amber-600 rounded text-stone-100 placeholder-stone-600 outline-none transition-colors"
                placeholder="din@email.dk"
              />
            </div>

            <div>
              <label className="block text-sm text-amber-300/80 mb-1.5" htmlFor="password">
                Adgangskode
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-800/80 border border-stone-700 focus:border-amber-600 rounded text-stone-100 placeholder-stone-600 outline-none transition-colors"
                placeholder="Mindst 6 tegn"
              />
            </div>

            <div>
              <label className="block text-sm text-amber-300/80 mb-1.5" htmlFor="confirm">
                Bekræft adgangskode
              </label>
              <input
                id="confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-800/80 border border-stone-700 focus:border-amber-600 rounded text-stone-100 placeholder-stone-600 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-900/20 border border-red-900/40 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-stone-100 font-semibold rounded transition-colors mt-2"
            >
              {loading ? 'Opretter konto…' : 'Opret konto'}
            </button>
          </form>

          <p className="text-center text-stone-500 text-sm mt-6">
            Har du allerede en konto?{' '}
            <Link href="/login" className="text-amber-400 hover:text-amber-300 transition-colors">
              Log ind her
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
