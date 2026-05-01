// Shared types, constants, and helpers for the spell browser.

export interface SpellRow {
  id: string
  name: string
  level: number
  school: string
  casting_time: string
  range: string
  components: string
  duration: string
  classes: string[]
  source: string
}

export interface SpellDetail extends SpellRow {
  description: string
  higher_levels: string | null
}

// ── Constants ──────────────────────────────────────────────────────────────

export const SCHOOLS = [
  'Abjuration', 'Conjuration', 'Divination', 'Enchantment',
  'Evocation', 'Illusion', 'Necromancy', 'Transmutation',
] as const

export const BASE_CLASSES = [
  'Artificer', 'Bard', 'Cleric', 'Druid',
  'Paladin', 'Ranger', 'Sorcerer', 'Warlock', 'Wizard',
] as const

export const LEVEL_LABELS = [
  'Cantrip', '1st Level', '2nd Level', '3rd Level', '4th Level',
  '5th Level', '6th Level', '7th Level', '8th Level', '9th Level',
]

/** Sources treated as "core" for the PHB/XGE/TCE filter toggle */
export const CORE_SOURCES = new Set([
  'PHB', 'PHB24', 'XGE', 'TCE',
  "Player's Handbook",
  "Xanathar's Guide to Everything",
  "Tasha's Cauldron of Everything",
])

export const PER_PAGE = 30

// ── School colours ─────────────────────────────────────────────────────────

type SchoolEntry = { badge: string; text: string; hex: string }

export const SCHOOL_COLORS: Record<string, SchoolEntry> = {
  abjuration:   { badge: 'text-blue-400 bg-blue-400/10 border-blue-400/30',   text: 'text-blue-400',   hex: '#60a5fa' },
  conjuration:  { badge: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', text: 'text-yellow-400', hex: '#facc15' },
  divination:   { badge: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',   text: 'text-cyan-400',   hex: '#22d3ee' },
  enchantment:  { badge: 'text-pink-400 bg-pink-400/10 border-pink-400/30',   text: 'text-pink-400',   hex: '#f472b6' },
  evocation:    { badge: 'text-red-400 bg-red-400/10 border-red-400/30',     text: 'text-red-400',    hex: '#f87171' },
  illusion:     { badge: 'text-purple-400 bg-purple-400/10 border-purple-400/30', text: 'text-purple-400', hex: '#c084fc' },
  necromancy:   { badge: 'text-green-400 bg-green-400/10 border-green-400/30', text: 'text-green-400',  hex: '#4ade80' },
  transmutation:{ badge: 'text-amber-400 bg-amber-400/10 border-amber-400/30', text: 'text-amber-400',  hex: '#fbbf24' },
}

const FALLBACK: SchoolEntry = {
  badge: 'text-dnd-muted bg-dnd-subtle border-dnd-border',
  text: 'text-dnd-muted',
  hex: '#7a7090',
}

/** Normalise school → canonical lowercase key (first word, lowercase) */
export function schoolKey(school: string): string {
  return (school ?? '').split(/[\s(]/)[0].toLowerCase()
}

/** Display-friendly school name (title-cased base, preserve parenthetical) */
export function schoolLabel(school: string): string {
  const base = (school ?? '').split('(')[0].trim()
  return base.charAt(0).toUpperCase() + base.slice(1)
}

/** Return the colour set for a school string */
export function schoolColors(school: string): SchoolEntry {
  return SCHOOL_COLORS[schoolKey(school)] ?? FALLBACK
}
