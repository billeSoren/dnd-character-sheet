'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Character } from '@/types/dnd'
import DeleteCharacterModal from './DeleteCharacterModal'

interface CharacterCardProps {
  character: Character
}

const CLASS_COLORS: Record<string, string> = {
  Barbarian: 'text-red-400',
  Bard: 'text-purple-400',
  Cleric: 'text-yellow-400',
  Druid: 'text-green-400',
  Fighter: 'text-orange-400',
  Monk: 'text-cyan-400',
  Paladin: 'text-amber-400',
  Ranger: 'text-lime-400',
  Rogue: 'text-slate-400',
  Sorcerer: 'text-pink-400',
  Warlock: 'text-violet-400',
  Wizard: 'text-blue-400',
}

export default function CharacterCard({ character }: CharacterCardProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const colorClass = CLASS_COLORS[character.class] ?? 'text-dnd-accent'

  const handleDelete = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('characters').delete().eq('id', character.id)
    router.refresh()   // re-runs the server component; card vanishes from list
  }

  return (
    <>
      {/* Card — relative container so trash button can overlay corner */}
      <div className="group relative border border-dnd-border bg-dnd-subtle hover:bg-dnd-card rounded-lg transition-all hover:border-dnd-accent/50 hover:shadow-lg">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-dnd-accent/40 to-transparent rounded-t-lg" />

        {/* Main clickable area — navigates to sheet */}
        <Link href={`/characters/${character.id}`} className="block p-5 pr-12 cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-dnd-text group-hover:text-dnd-accent transition-colors truncate">
                {character.name}
              </h3>
              <p className="text-dnd-muted text-sm mt-0.5">
                {character.race} · <span className={colorClass}>{character.class}</span>
              </p>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-dnd-border bg-dnd-accent/20 text-dnd-accent font-bold text-sm">
                {character.level}
              </span>
              <p className="text-dnd-muted text-xs mt-1">level</p>
            </div>
          </div>
          <p className="text-dnd-muted text-xs mt-3 border-t border-dnd-border pt-3 opacity-70">
            {character.background}
          </p>
        </Link>

        {/* Trash icon — outside Link so it doesn't trigger navigation */}
        <button
          type="button"
          title="Delete character"
          onClick={() => setModalOpen(true)}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-md text-dnd-muted opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {modalOpen && (
        <DeleteCharacterModal
          name={character.name}
          loading={loading}
          onCancel={() => setModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}
