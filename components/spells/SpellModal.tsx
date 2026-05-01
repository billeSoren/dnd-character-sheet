'use client'

import { useEffect, useState, useRef, MutableRefObject } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  SpellRow, SpellDetail,
  schoolColors, schoolLabel, LEVEL_LABELS,
} from './spell-types'

interface Character { id: string; name: string; class: string }

interface Props {
  spell: SpellRow
  onClose: () => void
  user: { id: string } | null
  characters: Character[]
  /** Shared cache across opens — avoids re-fetching the same spell description. */
  detailCache: MutableRefObject<Map<string, SpellDetail>>
}

export default function SpellModal({ spell, onClose, user, characters, detailCache }: Props) {
  const supabase = createClient()

  const [detail, setDetail]               = useState<SpellDetail | null>(detailCache.current.get(spell.id) ?? null)
  const [loadingDesc, setLoadingDesc]     = useState(!detailCache.current.has(spell.id))
  const [selectedCharId, setSelectedCharId] = useState(characters[0]?.id ?? '')
  const [adding, setAdding]               = useState(false)
  const [addResult, setAddResult]         = useState<{ ok: boolean; msg: string } | null>(null)

  const overlayRef = useRef<HTMLDivElement>(null)

  // Fetch full spell detail only when not already cached.
  useEffect(() => {
    if (detailCache.current.has(spell.id)) return

    let cancelled = false
    setLoadingDesc(true)
    setDetail(null)
    setAddResult(null)

    supabase
      .from('spells')
      .select('*')
      .eq('id', spell.id)
      .single()
      .then(({ data }) => {
        if (!cancelled && data) {
          const d = data as SpellDetail
          detailCache.current.set(spell.id, d)
          setDetail(d)
          setLoadingDesc(false)
        }
      })

    return () => { cancelled = true }
  }, [spell.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleAdd = async () => {
    if (!selectedCharId) return
    setAdding(true)
    setAddResult(null)

    // character_spells is not in the generated DB types — create it with:
    // CREATE TABLE character_spells (id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    //   character_id uuid REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
    //   spell_id uuid REFERENCES spells(id) ON DELETE CASCADE NOT NULL,
    //   added_at timestamptz DEFAULT now(), UNIQUE (character_id, spell_id));
    // ALTER TABLE character_spells ENABLE ROW LEVEL SECURITY;
    // CREATE POLICY "owner" ON character_spells FOR ALL USING (
    //   character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('character_spells')
      .insert({ character_id: selectedCharId, spell_id: spell.id })

    if (error) {
      if (error.message.includes('character_spells') || error.code === 'PGRST205') {
        setAddResult({ ok: false, msg: 'Table "character_spells" not found — see inline SQL comment.' })
      } else if (error.code === '23505') {
        setAddResult({ ok: true, msg: 'Already in spellbook ✓' })
      } else {
        setAddResult({ ok: false, msg: error.message })
      }
    } else {
      const char = characters.find((c) => c.id === selectedCharId)
      setAddResult({ ok: true, msg: `Added to ${char?.name ?? 'character'}'s spellbook!` })
    }
    setAdding(false)
  }

  const sc = schoolColors(spell.school)
  const levelLabel = LEVEL_LABELS[spell.level] ?? `Level ${spell.level}`
  const isConc = (spell.duration ?? '').toLowerCase().includes('concentration')

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[82vh] flex flex-col bg-dnd-card border border-dnd-border rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* School-coloured top accent bar */}
        <div className="h-1 flex-shrink-0" style={{ backgroundColor: sc.hex }} />

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 px-5 pt-4 pb-3.5 border-b border-dnd-border flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-dnd-text leading-tight">{spell.name}</h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
              <span className="text-sm text-dnd-muted">{levelLabel}</span>
              <span className="text-dnd-border">·</span>
              <span className={`text-sm font-medium ${sc.text}`}>{schoolLabel(spell.school)}</span>
              <span className="text-dnd-border">·</span>
              <span className="text-xs px-2 py-0.5 rounded border border-dnd-border bg-dnd-subtle text-dnd-muted font-mono">
                {spell.source}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="mt-0.5 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-dnd-muted hover:text-dnd-text hover:bg-dnd-subtle transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto dnd-scrollbar">
          <div className="px-5 py-5 space-y-5">

            {/* Properties grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {([
                { label: 'Casting Time', value: spell.casting_time },
                { label: 'Range',        value: spell.range        },
                { label: 'Duration',     value: spell.duration, accent: isConc },
                { label: 'Components',   value: spell.components   },
              ] as { label: string; value: string; accent?: boolean }[]).map(({ label, value, accent }) => (
                <div key={label} className="bg-dnd-subtle border border-dnd-border rounded-lg px-3 py-2.5">
                  <p className="text-[10px] font-bold text-dnd-muted uppercase tracking-wider mb-1">{label}</p>
                  <p className={`text-sm font-medium leading-snug ${accent ? 'text-dnd-accent' : 'text-dnd-text'}`}>
                    {value || '—'}
                  </p>
                </div>
              ))}
            </div>

            {/* Classes */}
            {(spell.classes ?? []).length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-dnd-muted uppercase tracking-wider mb-2">Classes</p>
                <div className="flex flex-wrap gap-1.5">
                  {spell.classes.map((cls) => (
                    <span
                      key={cls}
                      className="text-xs px-2.5 py-1 bg-dnd-subtle border border-dnd-border rounded text-dnd-text"
                    >
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <p className="text-[10px] font-bold text-dnd-muted uppercase tracking-wider mb-2.5">Description</p>
              {loadingDesc ? (
                <div className="space-y-2">
                  {[95, 88, 92, 75, 82, 60].map((w, i) => (
                    <div
                      key={i}
                      className="h-3.5 bg-dnd-subtle rounded animate-pulse"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(detail?.description ?? '').split('\n').filter(Boolean).map((para, i) => (
                    <p key={i} className="text-sm text-dnd-text leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* At Higher Levels */}
            {!loadingDesc && detail?.higher_levels && (
              <div className="rounded-lg border border-dnd-accent/25 bg-dnd-accent/5 px-4 py-3.5">
                <p className="text-[10px] font-bold text-dnd-accent uppercase tracking-wider mb-1.5">
                  At Higher Levels
                </p>
                <p className="text-sm text-dnd-text leading-relaxed">{detail.higher_levels}</p>
              </div>
            )}

            {/* ── Add to Spellbook ───────────────────────────────────── */}
            {user ? (
              characters.length > 0 ? (
                <div className="border-t border-dnd-border pt-5">
                  <p className="text-[10px] font-bold text-dnd-muted uppercase tracking-wider mb-3">
                    Add to Spellbook
                  </p>
                  <div className="flex gap-2">
                    <select
                      value={selectedCharId}
                      onChange={(e) => { setSelectedCharId(e.target.value); setAddResult(null) }}
                      className="flex-1 px-3 py-2.5 bg-dnd-subtle border border-dnd-border rounded-lg text-sm text-dnd-text outline-none focus:border-dnd-accent transition-colors cursor-pointer"
                    >
                      {characters.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {c.class}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAdd}
                      disabled={adding || !selectedCharId}
                      className="px-5 py-2.5 bg-dnd-accent hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-opacity whitespace-nowrap"
                    >
                      {adding ? 'Adding…' : '+ Add'}
                    </button>
                  </div>
                  {addResult && (
                    <p className={`text-xs mt-2 font-medium ${addResult.ok ? 'text-green-400' : 'text-red-400'}`}>
                      {addResult.msg}
                    </p>
                  )}
                </div>
              ) : (
                <div className="border-t border-dnd-border pt-5 text-sm text-dnd-muted">
                  <Link href="/characters/new" className="text-dnd-accent hover:underline">
                    Create a character
                  </Link>{' '}
                  to add spells to your spellbook.
                </div>
              )
            ) : (
              <div className="border-t border-dnd-border pt-5 text-sm text-dnd-muted">
                <Link href="/login" className="text-dnd-accent hover:underline">Log in</Link>{' '}
                to add spells to a character&apos;s spellbook.
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
