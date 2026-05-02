'use client'

import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import MagicItemBrowser from '@/components/magic-items/MagicItemBrowser'

export default function MagicItemsPage() {
  return (
    <div className="min-h-screen bg-dnd-bg">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-dnd-border bg-dnd-bg/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="text-dnd-muted hover:text-dnd-accent transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="h-4 w-px bg-dnd-border flex-shrink-0" />
          <span className="font-bold text-dnd-accent tracking-wide">Magic Items</span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <MagicItemBrowser />
      </div>
    </div>
  )
}
