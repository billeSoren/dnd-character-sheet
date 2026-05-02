'use client'

import { useState, useMemo } from 'react'
import { DndRace, formatAbilityBonuses, DEFAULT_SOURCE } from '@/lib/dnd-api'
import { CharacterFormData } from './types'
import StepLoadingSkeleton from './StepLoadingSkeleton'

// ── Icons & descriptions (keyed by Title-Case base name) ──────────────────────

const RACE_ICONS: Record<string, string> = {
  Dwarf: '⛏️', Elf: '🌙', Halfling: '🍀', Human: '👤',
  Dragonborn: '🐉', Gnome: '🔬', 'Half-Elf': '🌅', 'Half-Orc': '🪨', Tiefling: '🔥',
  Aasimar: '✨', Goliath: '🏔️', Tabaxi: '🐱', Firbolg: '🌲', Kenku: '🐦',
  Lizardfolk: '🦎', Triton: '🌊', Bugbear: '👹', Goblin: '👺', Hobgoblin: '⚔️',
  Kobold: '🐍', Orc: '🪨',
}

const RACE_DESCRIPTIONS: Record<string, string> = {
  Dwarf: 'Hardy and enduring dwarves are expert craftspeople and fierce warriors from mountain strongholds.',
  Elf: 'Graceful and long-lived elves are natural spellcasters with keen senses and endless curiosity.',
  Halfling: 'Small and nimble halflings are remarkably lucky, courageous, and skilled at avoiding danger.',
  Human: 'Ambitious and adaptable humans are the most widespread race, with talent for everything.',
  Dragonborn: 'Proud and honourable warriors bearing the traits and powers of dragonkind.',
  Gnome: 'Enthusiastic and inventive gnomes are natural tinkerers with a love of magic and puzzles.',
  'Half-Elf': 'Combines the best of both worlds — charismatic and versatile adventurers.',
  'Half-Orc': 'Strong and fearless half-orcs have an unstoppable drive and the ferocity of orcs.',
  Tiefling: 'Marked by infernal heritage — resilient survivors with innate magical gifts.',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

// Maps sub-race names (uppercase) to their parent group label (uppercase).
// Used by baseName() so that e.g. "Hill Dwarf" and "Mountain Dwarf" both
// collapse under the "DWARF" group header.
const PARENT_RACE_MAP: Record<string, string> = {
  // Dwarf
  'HILL DWARF': 'DWARF', 'MOUNTAIN DWARF': 'DWARF',
  'DUERGAR': 'DWARF', 'DUERGAR (GRAY DWARF)': 'DWARF',
  // Elf
  'HIGH ELF': 'ELF', 'WOOD ELF': 'ELF',
  'DARK ELF': 'ELF', 'DARK ELF (DROW)': 'ELF', 'DROW': 'ELF',
  // Halfling
  'LIGHTFOOT HALFLING': 'HALFLING', 'STOUT HALFLING': 'HALFLING',
  'MARK OF HEALING HALFLING': 'HALFLING', 'MARK OF HOSPITALITY HALFLING': 'HALFLING',
  // Gnome
  'FOREST GNOME': 'GNOME', 'ROCK GNOME': 'GNOME',
  'DEEP GNOME': 'GNOME', 'SVIRFNEBLIN': 'GNOME',
  // Dragonborn
  'BLACK DRAGONBORN': 'DRAGONBORN', 'BLUE DRAGONBORN': 'DRAGONBORN',
  'BRASS DRAGONBORN': 'DRAGONBORN', 'BRONZE DRAGONBORN': 'DRAGONBORN',
  'COPPER DRAGONBORN': 'DRAGONBORN', 'GOLD DRAGONBORN': 'DRAGONBORN',
  'GREEN DRAGONBORN': 'DRAGONBORN', 'RED DRAGONBORN': 'DRAGONBORN',
  'SILVER DRAGONBORN': 'DRAGONBORN', 'WHITE DRAGONBORN': 'DRAGONBORN',
  'CHROMATIC DRAGONBORN': 'DRAGONBORN', 'METALLIC DRAGONBORN': 'DRAGONBORN',
  'GEM DRAGONBORN': 'DRAGONBORN',
  'DRACONBLOOD DRAGONBORN': 'DRAGONBORN', 'RAVENITE DRAGONBORN': 'DRAGONBORN',
  // Half-Orc (maps to itself so it stays uppercase-consistent with the rest)
  'HALF-ORC': 'HALF-ORC',
  // Human variants
  'VARIANT HUMAN': 'HUMAN',
  'MARK OF FINDING HUMAN': 'HUMAN', 'MARK OF HANDLING HUMAN': 'HUMAN',
  'MARK OF MAKING HUMAN': 'HUMAN', 'MARK OF PASSAGE HUMAN': 'HUMAN',
  'MARK OF SENTINEL HUMAN': 'HUMAN',
  // Aasimar
  'PROTECTOR AASIMAR': 'AASIMAR', 'SCOURGE AASIMAR': 'AASIMAR', 'FALLEN AASIMAR': 'AASIMAR',
  'AASIMAR (PROTECTOR)': 'AASIMAR', 'AASIMAR (SCOURGE)': 'AASIMAR', 'AASIMAR (FALLEN)': 'AASIMAR',
  // Shifter
  'BEASTHIDE SHIFTER': 'SHIFTER', 'LONGTOOTH SHIFTER': 'SHIFTER',
  'SWIFTSTRIDE SHIFTER': 'SHIFTER', 'WILDHUNT SHIFTER': 'SHIFTER',
  'SHIFTER (BEASTHIDE)': 'SHIFTER', 'SHIFTER (SWIFTSTRIDE)': 'SHIFTER',
  'SHIFTER (WILDHUNT)': 'SHIFTER',
}

/**
 * Returns the uppercase parent-group label for a race name.
 * "Hill Dwarf" → "DWARF", "Black Dragonborn" → "DRAGONBORN",
 * "Half-Elf (Variant: Drow)" → "HALF-ELF"
 */
function baseName(name: string): string {
  const upper = name.toUpperCase().trim()
  if (PARENT_RACE_MAP[upper]) return PARENT_RACE_MAP[upper]
  // Strip everything from "(" onward (handles "Half-Elf (Variant: …)" etc.)
  return upper.split('(')[0].trim()
}

/** "HALF-ELF" → "Half-Elf" for icon/description lookup */
function toTitleCase(s: string): string {
  return s
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('-')
}

function raceIcon(base: string): string | undefined {
  return RACE_ICONS[toTitleCase(base)] ?? RACE_ICONS[base]
}

function raceDesc(base: string, fallback: string): string {
  return RACE_DESCRIPTIONS[toTitleCase(base)] ?? fallback
}

// ── Grouping ───────────────────────────────────────────────────────────────────

type FlatEntry  = { kind: 'flat';  race: DndRace }
type GroupEntry = { kind: 'group'; base: string; children: DndRace[] }
type ListEntry  = FlatEntry | GroupEntry

function buildGroups(races: DndRace[]): ListEntry[] {
  const map = new Map<string, DndRace[]>()
  for (const race of races) {
    const b = baseName(race.name)
    if (!map.has(b)) map.set(b, [])
    map.get(b)!.push(race)
  }

  const entries: ListEntry[] = []
  for (const [base, children] of Array.from(map.entries())) {
    if (children.length >= 2) {
      entries.push({ kind: 'group', base, children })
    } else {
      entries.push({ kind: 'flat', race: children[0] })
    }
  }

  return entries.sort((a, b) => {
    const ak = a.kind === 'flat' ? a.race.name : a.base
    const bk = b.kind === 'flat' ? b.race.name : b.base
    return ak.localeCompare(bk)
  })
}

function filterEntries(entries: ListEntry[], q: string): ListEntry[] {
  if (!q) return entries
  const lq = q.toLowerCase()
  return entries.flatMap((e): ListEntry[] => {
    if (e.kind === 'flat') {
      return e.race.name.toLowerCase().includes(lq) ? [e] : []
    }
    if (e.base.toLowerCase().includes(lq)) return [e]
    const kids = e.children.filter((c) => c.name.toLowerCase().includes(lq))
    return kids.length > 0 ? [{ kind: 'group' as const, base: e.base, children: kids }] : []
  })
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function DetailPanel({ race }: { race: DndRace }) {
  const bonusStr = race.ability_bonuses ? formatAbilityBonuses(race.ability_bonuses) : ''
  const desc = raceDesc(baseName(race.name), race.description?.slice(0, 160) ?? '')
  const chips: { label: string; value: string }[] = [
    { label: 'Size',  value: race.size  || '—' },
    { label: 'Speed', value: race.speed ? `${race.speed} ft` : '—' },
    ...(bonusStr ? [{ label: 'Ability Bonuses', value: bonusStr }] : []),
    ...((race.traits ?? []).length > 0
      ? [{ label: 'Traits', value: race.traits.slice(0, 4).join(', ') + (race.traits.length > 4 ? '…' : '') }]
      : []),
  ]
  return (
    <div className="px-5 pb-4 pt-3 bg-dnd-subtle border-l-[3px] border-l-dnd-accent">
      {desc && <p className="text-sm text-dnd-muted leading-relaxed mb-3">{desc}</p>}
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <span key={c.label} className="inline-flex gap-1 text-xs bg-dnd-card border border-dnd-border rounded px-2.5 py-1">
            <span className="text-dnd-muted">{c.label}:</span>
            <span className="text-dnd-text font-semibold">{c.value}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function Chevron({ open, className = '' }: { open: boolean; className?: string }) {
  return (
    <svg
      className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''} ${className}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  data: CharacterFormData
  onChange: (data: Partial<CharacterFormData>) => void
  races: DndRace[]
  loading?: boolean
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function StepSpecies({ data, onChange, races, loading }: Props) {
  const [search, setSearch]         = useState('')
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    // Pre-open the group containing the currently selected race
    if (!data.race) return new Set()
    return new Set([baseName(data.race)])
  })
  const [detailOpen, setDetailOpen] = useState<string | null>(data.race || null)

  const entries = useMemo(() => buildGroups(races), [races])
  const visible = useMemo(() => filterEntries(entries, search), [entries, search])

  // When searching, auto-expand all visible groups
  const effectiveOpen = search
    ? new Set(visible.filter((e) => e.kind === 'group').map((e) => (e as GroupEntry).base))
    : openGroups

  const toggleGroup = (base: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(base)) { next.delete(base) } else { next.add(base) }
      return next
    })

  const selectRace = (race: DndRace) => {
    onChange({ race: race.name, raceId: race.id ?? null })
    setDetailOpen((prev) => (prev === race.name ? null : race.name))
  }

  if (loading) {
    return (
      <StepLoadingSkeleton
        title="Choose a Race"
        description="Your race grants your character unique ability bonuses and racial traits."
      />
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-dnd-text mb-1">Choose a Race</h2>
        <p className="text-dnd-muted text-sm">Your race grants your character unique ability bonuses and racial traits.</p>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <svg className="absolute left-3 top-3 w-4 h-4 text-dnd-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search races…"
          className="w-full pl-10 pr-4 py-2.5 bg-dnd-subtle border border-dnd-border rounded-lg text-dnd-text placeholder:text-dnd-muted outline-none focus:border-dnd-accent transition-colors text-sm"
        />
      </div>

      {/* List */}
      <div className="border border-dnd-border rounded-lg overflow-hidden">
        {visible.length === 0 ? (
          <div className="py-10 text-center text-dnd-muted text-sm">
            No results for &ldquo;{search}&rdquo;
          </div>
        ) : (
          visible.map((entry, idx) => {
            const divider = idx > 0 ? 'border-t border-dnd-border' : ''

            // ── Flat row ──────────────────────────────────────────────────
            if (entry.kind === 'flat') {
              const { race } = entry
              const isSelected = data.race === race.name
              const isDetail   = detailOpen === race.name
              return (
                <div key={race.name} className={divider}>
                  <button
                    onClick={() => selectRace(race)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ${
                      isSelected
                        ? 'bg-dnd-accent/10 border-l-[3px] border-l-dnd-accent'
                        : 'bg-dnd-card hover:bg-dnd-subtle border-l-[3px] border-l-transparent'
                    }`}
                  >
                    {raceIcon(baseName(race.name)) && (
                      <span className="text-xl flex-shrink-0 w-8 text-center leading-none">
                        {raceIcon(baseName(race.name))}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm tracking-wider uppercase ${isSelected ? 'text-dnd-accent' : 'text-dnd-text'}`}>
                        {race.name}
                      </p>
                      <p className="text-xs text-dnd-muted mt-0.5">{race.source || DEFAULT_SOURCE}</p>
                    </div>
                    <Chevron open={isDetail} className="text-dnd-muted" />
                  </button>
                  {isDetail && <DetailPanel race={race} />}
                </div>
              )
            }

            // ── Group row ─────────────────────────────────────────────────
            const { base, children } = entry
            const isGroupOpen    = effectiveOpen.has(base)
            const groupSelected  = children.some((c) => c.name === data.race)

            return (
              <div key={base} className={divider}>
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(base)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ${
                    groupSelected
                      ? 'bg-dnd-accent/10 border-l-[3px] border-l-dnd-accent'
                      : 'bg-dnd-card hover:bg-dnd-subtle border-l-[3px] border-l-transparent'
                  }`}
                >
                  {raceIcon(base) && (
                    <span className="text-xl flex-shrink-0 w-8 text-center leading-none">
                      {raceIcon(base)}
                    </span>
                  )}
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <p className={`font-bold text-sm tracking-wider uppercase ${groupSelected ? 'text-dnd-accent' : 'text-dnd-text'}`}>
                      {base}
                    </p>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-dnd-border text-dnd-muted">
                      {children.length}
                    </span>
                  </div>
                  <Chevron open={isGroupOpen} className="text-dnd-muted" />
                </button>

                {/* Variants */}
                {isGroupOpen && children.map((race) => {
                  const isSelected = data.race === race.name
                  const isDetail   = detailOpen === race.name
                  return (
                    <div key={race.name} className="border-t border-dnd-border/60">
                      <button
                        onClick={() => selectRace(race)}
                        className={`w-full flex items-center gap-3 pl-10 pr-4 py-3 text-left transition-all ${
                          isSelected
                            ? 'bg-dnd-accent/10 border-l-[3px] border-l-dnd-accent'
                            : 'bg-dnd-subtle hover:bg-dnd-card border-l-[3px] border-l-transparent'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${isSelected ? 'text-dnd-accent' : 'text-dnd-text'}`}>
                            {race.name}
                          </p>
                          <p className="text-xs text-dnd-muted mt-0.5">{race.source || DEFAULT_SOURCE}</p>
                        </div>
                        <Chevron open={isDetail} className="text-dnd-muted" />
                      </button>
                      {isDetail && <DetailPanel race={race} />}
                    </div>
                  )
                })}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
