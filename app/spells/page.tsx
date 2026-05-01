'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import ThemeToggle from '@/components/ThemeToggle'
import SpellModal from '@/components/spells/SpellModal'
import {
  SpellRow,
  SCHOOLS, BASE_CLASSES, CORE_SOURCES, PER_PAGE,
  schoolColors, schoolLabel, schoolKey,
} from '@/components/spells/spell-types'

// ── Sub-components ─────────────────────────────────────────────────────────

function LevelBadge({ level }: { level: number }) {
  const isCantrip = level === 0
  return (
    <span
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold flex-shrink-0 select-none ${
        isCantrip
          ? 'bg-dnd-accent/20 text-dnd-accent border border-dnd-accent/40'
          : 'bg-dnd-subtle text-dnd-muted border border-dnd-border'
      }`}
    >
      {isCantrip ? '✦' : level}
    </span>
  )
}

function SchoolPill({ school }: { school: string }) {
  const { badge } = schoolColors(school)
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded border truncate ${badge}`}>
      {schoolLabel(school)}
    </span>
  )
}

function FilterSelect({
  value, onChange, children, className = '',
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 bg-dnd-subtle border border-dnd-border rounded-lg text-sm text-dnd-text outline-none focus:border-dnd-accent cursor-pointer transition-colors ${className}`}
    >
      {children}
    </select>
  )
}

function SkeletonRow() {
  return (
    <div className="px-4 py-3.5 flex items-center gap-3 border-b border-dnd-border last:border-0">
      <div className="w-7 h-7 rounded-full bg-dnd-subtle animate-pulse flex-shrink-0" />
      <div className="flex-1 h-4 bg-dnd-subtle rounded animate-pulse" />
      <div className="hidden sm:block w-24 h-4 bg-dnd-subtle rounded animate-pulse" />
      <div className="hidden sm:block w-16 h-4 bg-dnd-subtle rounded animate-pulse" />
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

interface Character { id: string; name: string; class: string }

export default function SpellsPage() {
  const supabase = createClient()

  // ── Data ────────────────────────────────────────────────────────────────
  const [spells, setSpells]     = useState<SpellRow[]>([])
  const [loading, setLoading]   = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [user, setUser]         = useState<{ id: string } | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])

  // ── Modal ────────────────────────────────────────────────────────────────
  const [selectedSpell, setSelectedSpell] = useState<SpellRow | null>(null)
  // Cache full spell details keyed by id so re-opening a spell skips the network round-trip.
  const spellDetailCache = useRef<Map<string, import('@/components/spells/spell-types').SpellDetail>>(new Map())

  // ── Filters ──────────────────────────────────────────────────────────────
  const [search,       setSearch]       = useState('')
  const [filterLevel,  setFilterLevel]  = useState('')   // '' | '0' … '9'
  const [filterSchool, setFilterSchool] = useState('')   // '' | 'abjuration' …
  const [filterClass,  setFilterClass]  = useState('')   // '' | 'Wizard' …
  const [coreOnly,     setCoreOnly]     = useState(false)
  const [page, setPage] = useState(0)

  // ── Auth + characters ────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ? { id: u.id } : null)
      if (u) {
        supabase
          .from('characters')
          .select('id, name, class')
          .eq('user_id', u.id)
          .order('created_at', { ascending: false })
          .then(({ data }) => setCharacters((data ?? []) as Character[]))
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch spells (metadata only — no description) ───────────────────────
  useEffect(() => {
    setLoading(true)
    supabase
      .from('spells')
      .select('id, name, level, school, casting_time, range, components, duration, classes, source')
      .order('level', { ascending: true })
      .order('name',  { ascending: true })
      .then(({ data, error }) => {
        if (error) setFetchError(error.message)
        else setSpells((data ?? []) as SpellRow[])
        setLoading(false)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filter logic ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return spells.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q)) return false
      if (filterLevel !== '' && s.level !== Number(filterLevel)) return false
      if (filterSchool && schoolKey(s.school) !== filterSchool) return false
      if (filterClass && !(s.classes ?? []).some((c) => c.startsWith(filterClass))) return false
      if (coreOnly && !CORE_SOURCES.has(s.source)) return false
      return true
    })
  }, [spells, search, filterLevel, filterSchool, filterClass, coreOnly])

  // Reset to page 0 on any filter change
  useEffect(() => { setPage(0) }, [search, filterLevel, filterSchool, filterClass, coreOnly])

  const totalPages  = Math.ceil(filtered.length / PER_PAGE)
  const pageSpells  = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
  const hasFilters  = search || filterLevel !== '' || filterSchool || filterClass || coreOnly

  const clearFilters = useCallback(() => {
    setSearch(''); setFilterLevel(''); setFilterSchool(''); setFilterClass(''); setCoreOnly(false)
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-dnd-bg">

      {/* ── Sticky header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-dnd-border bg-dnd-bg/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <Link
            href="/"
            className="text-dnd-muted hover:text-dnd-accent transition-colors flex-shrink-0 p-1"
            aria-label="Back to home"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-xl select-none">✨</span>
          <h1 className="text-lg font-bold text-dnd-accent tracking-wide flex-1">Spell Browser</h1>
          {!loading && (
            <span className="text-xs text-dnd-muted hidden sm:block">
              {filtered.length} / {spells.length} spells
            </span>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dnd-muted pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search spells by name…"
            className="w-full pl-10 pr-10 py-2.5 bg-dnd-subtle border border-dnd-border rounded-xl text-dnd-text placeholder:text-dnd-muted outline-none focus:border-dnd-accent transition-colors text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dnd-muted hover:text-dnd-text text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Level */}
          <FilterSelect value={filterLevel} onChange={setFilterLevel}>
            <option value="">All Levels</option>
            {[0,1,2,3,4,5,6,7,8,9].map((l) => (
              <option key={l} value={String(l)}>
                {l === 0 ? 'Cantrip' : `Level ${l}`}
              </option>
            ))}
          </FilterSelect>

          {/* School */}
          <FilterSelect value={filterSchool} onChange={setFilterSchool}>
            <option value="">All Schools</option>
            {SCHOOLS.map((s) => (
              <option key={s} value={s.toLowerCase()}>{s}</option>
            ))}
          </FilterSelect>

          {/* Class */}
          <FilterSelect value={filterClass} onChange={setFilterClass}>
            <option value="">All Classes</option>
            {BASE_CLASSES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </FilterSelect>

          {/* Core sources toggle */}
          <button
            onClick={() => setCoreOnly((p) => !p)}
            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
              coreOnly
                ? 'bg-dnd-accent/20 border-dnd-accent/60 text-dnd-accent'
                : 'bg-dnd-subtle border-dnd-border text-dnd-muted hover:text-dnd-text hover:border-dnd-accent/40'
            }`}
          >
            PHB · XGE · TCE
          </button>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-dnd-muted hover:text-red-400 transition-colors"
            >
              ✕ Clear
            </button>
          )}

          {/* Mobile count */}
          <span className="sm:hidden text-xs text-dnd-muted ml-auto">
            {loading ? '…' : `${filtered.length} spells`}
          </span>
        </div>

        {/* Error */}
        {fetchError && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            Failed to load spells: {fetchError}
          </div>
        )}

        {/* ── Spell list ───────────────────────────────────────────── */}
        <div className="border border-dnd-border rounded-xl overflow-hidden">

          {/* Table header (desktop) */}
          <div className="hidden sm:grid items-center px-4 py-2.5 bg-dnd-subtle border-b border-dnd-border text-[10px] font-bold text-dnd-muted uppercase tracking-widest"
            style={{ gridTemplateColumns: '36px 1fr 150px 110px 90px 52px' }}
          >
            <span>Lvl</span>
            <span>Spell Name</span>
            <span>School</span>
            <span>Casting</span>
            <span>Range</span>
            <span>Src</span>
          </div>

          {/* Rows */}
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => <SkeletonRow key={i} />)
          ) : pageSpells.length === 0 ? (
            <div className="py-20 text-center text-dnd-muted text-sm">
              {hasFilters
                ? <>No spells match your filters — <button onClick={clearFilters} className="text-dnd-accent hover:underline">clear filters</button></>
                : 'No spells found.'}
            </div>
          ) : (
            pageSpells.map((spell) => (
              <button
                key={spell.id}
                onClick={() => setSelectedSpell(spell)}
                className="w-full text-left border-b border-dnd-border last:border-0 hover:bg-dnd-subtle transition-colors group"
              >
                {/* Mobile */}
                <div className="sm:hidden flex items-center gap-3 px-4 py-3">
                  <LevelBadge level={spell.level} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-dnd-text group-hover:text-dnd-accent transition-colors truncate">
                      {spell.name}
                    </p>
                    <p className="text-xs text-dnd-muted mt-0.5 truncate">
                      <span className={schoolColors(spell.school).text}>{schoolLabel(spell.school)}</span>
                      {' · '}{spell.casting_time}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-dnd-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Desktop */}
                <div
                  className="hidden sm:grid items-center px-4 py-3 gap-2"
                  style={{ gridTemplateColumns: '36px 1fr 150px 110px 90px 52px' }}
                >
                  <LevelBadge level={spell.level} />
                  <span className="font-semibold text-sm text-dnd-text group-hover:text-dnd-accent transition-colors truncate pr-2">
                    {spell.name}
                  </span>
                  <SchoolPill school={spell.school} />
                  <span className="text-xs text-dnd-muted truncate">{spell.casting_time}</span>
                  <span className="text-xs text-dnd-muted truncate">{spell.range}</span>
                  <span className="text-xs text-dnd-muted font-mono">{spell.source}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* ── Pagination ───────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => { setPage((p) => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              disabled={page === 0}
              className="flex items-center gap-1.5 px-4 py-2 border border-dnd-border rounded-lg text-sm text-dnd-muted hover:text-dnd-text hover:border-dnd-accent/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            {/* Page numbers — show a window of 5 */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(0, Math.min(page - 2, totalPages - 5))
                const p = start + i
                return (
                  <button
                    key={p}
                    onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-dnd-accent text-white'
                        : 'text-dnd-muted hover:text-dnd-text hover:bg-dnd-subtle'
                    }`}
                  >
                    {p + 1}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => { setPage((p) => Math.min(totalPages - 1, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1.5 px-4 py-2 border border-dnd-border rounded-lg text-sm text-dnd-muted hover:text-dnd-text hover:border-dnd-accent/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Footer nudge */}
        {!loading && spells.length > 0 && (
          <p className="text-center text-xs text-dnd-muted opacity-50 pb-4">
            {spells.length} spells · click any spell for details
          </p>
        )}
      </main>

      {/* ── Spell detail modal ──────────────────────────────────────── */}
      {selectedSpell && (
        <SpellModal
          spell={selectedSpell}
          onClose={() => setSelectedSpell(null)}
          user={user}
          characters={characters}
          detailCache={spellDetailCache}
        />
      )}
    </div>
  )
}
