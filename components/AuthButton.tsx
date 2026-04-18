'use client'

import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'

interface AuthButtonProps {
  user: User | null
}

export default function AuthButton({ user }: AuthButtonProps) {
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-amber-200/70 text-sm">{user.email}</span>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm border border-amber-700/50 text-amber-400 hover:bg-amber-900/30 rounded transition-colors"
        >
          Log ud
        </button>
      </div>
    )
  }

  return (
    <Link
      href="/login"
      className="px-5 py-2.5 bg-amber-700 hover:bg-amber-600 text-stone-100 font-semibold rounded transition-colors"
    >
      Log ind
    </Link>
  )
}
