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
        <span className="text-dnd-muted text-sm hidden sm:block">{user.email}</span>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm border border-dnd-border text-dnd-muted hover:text-dnd-text hover:border-dnd-text rounded-lg transition-colors"
        >
          Log out
        </button>
      </div>
    )
  }

  return (
    <Link
      href="/login"
      className="px-5 py-2 bg-dnd-accent hover:opacity-90 text-white font-semibold rounded-lg transition-opacity text-sm"
    >
      Log in
    </Link>
  )
}
