'use client'

import { useState, useMemo } from 'react'
import { DndRace, formatAbilityBonuses, DEFAULT_SOURCE } from '@/lib/dnd-api'
import { CharacterFormData, CustomLineageChoices, OriginCustomizations, StatKey, STAT_KEYS } from './types'
import StepLoadingSkeleton from './StepLoadingSkeleton'

// ── Icons & descriptions (keyed by Title-Case base name) ──────────────────────

const RACE_ICONS: Record<string, string> = {
  Dwarf: '⛏️', Elf: '🌙', Halfling: '🍀', Human: '👤',
  Dragonborn: '🐉', Gnome: '🔬', 'Half-Elf': '🌅', 'Half-Orc': '🪨', Tiefling: '🔥',
  Aasimar: '✨', Goliath: '🏔️', Tabaxi: '🐱', Firbolg: '🌲', Kenku: '🐦',
  Lizardfolk: '🦎', Triton: '🌊', Bugbear: '👹', Goblin: '👺', Hobgoblin: '⚔️',
  Kobold: '🐍', Orc: '🪓', Genasi: '🌪️', Gith: '🧿', Shifter: '🐺',
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
  Genasi: 'Born of elemental power, genasi are infused with the essence of air, earth, fire, or water.',
  Gith: 'Ancient humanoids who escaped illithid enslavement, split into the militant githyanki and monastic githzerai.',
  Shifter: 'Descended from lycanthropes, shifters can tap into their bestial nature for brief, powerful transformations.',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const PARENT_RACE_MAP: Record<string, string> = {
  // ── Dwarf ──────────────────────────────────────────────────────────────────
  'HILL DWARF': 'DWARF', 'MOUNTAIN DWARF': 'DWARF',
  'GRAY DWARF': 'DWARF',
  'DUERGAR': 'DWARF', 'DUERGAR (GRAY DWARF)': 'DWARF', 'DUERGAR (DWARF SUBRACE)': 'DWARF',
  'MARK OF WARDING DWARF': 'DWARF',

  // ── Elf ────────────────────────────────────────────────────────────────────
  'HIGH ELF': 'ELF', 'WOOD ELF': 'ELF',
  'DARK ELF': 'ELF', 'DARK ELF (DROW)': 'ELF', 'DROW': 'ELF',
  'ELADRIN': 'ELF', 'ELADRIN ELF': 'ELF',
  'ASTRAL ELF': 'ELF',
  'SEA ELF': 'ELF',
  'SHADAR-KAI': 'ELF',
  'PALLID ELF': 'ELF',
  'VALENAR ELF': 'ELF', 'AERENI ELF': 'ELF',
  'MARK OF SHADOW ELF': 'ELF',

  // ── Half-Elf ────────────────────────────────────────────────────────────────
  'HALF-ELF': 'HALF-ELF',                      // base race → same group key
  'HIGH HALF-ELF': 'HALF-ELF', 'WOOD HALF-ELF': 'HALF-ELF',
  'DROW HALF-ELF': 'HALF-ELF', 'AQUATIC HALF-ELF': 'HALF-ELF',
  'MARK OF DETECTION HALF-ELF': 'HALF-ELF', 'MARK OF STORM HALF-ELF': 'HALF-ELF',

  // ── Halfling ───────────────────────────────────────────────────────────────
  'LIGHTFOOT HALFLING': 'HALFLING', 'STOUT HALFLING': 'HALFLING',
  'GHOSTWISE HALFLING': 'HALFLING',
  'LOTUSDEN HALFLING': 'HALFLING',
  'MARK OF HEALING HALFLING': 'HALFLING', 'MARK OF HOSPITALITY HALFLING': 'HALFLING',

  // ── Gnome ──────────────────────────────────────────────────────────────────
  'FOREST GNOME': 'GNOME', 'ROCK GNOME': 'GNOME',
  'DEEP GNOME': 'GNOME', 'DEEP GNOME (SVIRFNEBLIN)': 'GNOME', 'SVIRFNEBLIN': 'GNOME',
  'MARK OF SCRIBING GNOME': 'GNOME',

  // ── Dragonborn ─────────────────────────────────────────────────────────────
  'BLACK DRAGONBORN': 'DRAGONBORN', 'BLUE DRAGONBORN': 'DRAGONBORN',
  'BRASS DRAGONBORN': 'DRAGONBORN', 'BRONZE DRAGONBORN': 'DRAGONBORN',
  'COPPER DRAGONBORN': 'DRAGONBORN', 'GOLD DRAGONBORN': 'DRAGONBORN',
  'GREEN DRAGONBORN': 'DRAGONBORN', 'RED DRAGONBORN': 'DRAGONBORN',
  'SILVER DRAGONBORN': 'DRAGONBORN', 'WHITE DRAGONBORN': 'DRAGONBORN',
  'CHROMATIC DRAGONBORN': 'DRAGONBORN',
  'METALLIC DRAGONBORN': 'DRAGONBORN',
  'GEM DRAGONBORN': 'DRAGONBORN',
  'DRACONBLOOD DRAGONBORN': 'DRAGONBORN', 'DRACONBLOOD': 'DRAGONBORN',
  'RAVENITE DRAGONBORN': 'DRAGONBORN', 'RAVENITE': 'DRAGONBORN',

  // ── Genasi ─────────────────────────────────────────────────────────────────
  'AIR GENASI': 'GENASI', 'EARTH GENASI': 'GENASI',
  'FIRE GENASI': 'GENASI', 'WATER GENASI': 'GENASI',
  'GENASI (AIR)': 'GENASI', 'GENASI (EARTH)': 'GENASI',
  'GENASI (FIRE)': 'GENASI', 'GENASI (WATER)': 'GENASI',
  'GENASI AIR': 'GENASI', 'GENASI EARTH': 'GENASI',
  'GENASI FIRE': 'GENASI', 'GENASI WATER': 'GENASI',

  // ── Gith ───────────────────────────────────────────────────────────────────
  'GITHYANKI': 'GITH', 'GITHZERAI': 'GITH',

  // ── Tiefling ───────────────────────────────────────────────────────────────
  'TIEFLING': 'TIEFLING',                       // base race → same group key
  'ASMODEUS TIEFLING': 'TIEFLING', 'BAALZEBUL TIEFLING': 'TIEFLING',
  'DISPATER TIEFLING': 'TIEFLING', 'FIERNA TIEFLING': 'TIEFLING',
  'GLASYA TIEFLING': 'TIEFLING', 'LEVISTUS TIEFLING': 'TIEFLING',
  'MAMMON TIEFLING': 'TIEFLING', 'MEPHISTOPHELES TIEFLING': 'TIEFLING',
  'ZARIEL TIEFLING': 'TIEFLING',
  'FERAL TIEFLING': 'TIEFLING',
  'VARIANT FERAL TIEFLING': 'TIEFLING', 'VARIANT TIEFLING': 'TIEFLING',

  // ── Aasimar ────────────────────────────────────────────────────────────────
  'PROTECTOR AASIMAR': 'AASIMAR', 'SCOURGE AASIMAR': 'AASIMAR', 'FALLEN AASIMAR': 'AASIMAR',
  'AASIMAR (PROTECTOR)': 'AASIMAR', 'AASIMAR (SCOURGE)': 'AASIMAR', 'AASIMAR (FALLEN)': 'AASIMAR',
  'VARIANT AASIMAR': 'AASIMAR',

  // ── Shifter ────────────────────────────────────────────────────────────────
  'BEASTHIDE SHIFTER': 'SHIFTER', 'LONGTOOTH SHIFTER': 'SHIFTER',
  'SWIFTSTRIDE SHIFTER': 'SHIFTER', 'WILDHUNT SHIFTER': 'SHIFTER',
  'SHIFTER (BEASTHIDE)': 'SHIFTER', 'SHIFTER (LONGTOOTH)': 'SHIFTER',
  'SHIFTER (SWIFTSTRIDE)': 'SHIFTER', 'SHIFTER (WILDHUNT)': 'SHIFTER',

  // ── Human ──────────────────────────────────────────────────────────────────
  'VARIANT HUMAN': 'HUMAN',
  'MARK OF FINDING HUMAN': 'HUMAN', 'MARK OF HANDLING HUMAN': 'HUMAN',
  'MARK OF MAKING HUMAN': 'HUMAN', 'MARK OF PASSAGE HUMAN': 'HUMAN',
  'MARK OF SENTINEL HUMAN': 'HUMAN',

  // ── Half-Orc ───────────────────────────────────────────────────────────────
  'HALF-ORC': 'HALF-ORC',
  'MARK OF FINDING HALF-ORC': 'HALF-ORC',

  // ── Centaur ────────────────────────────────────────────────────────────────
  'CENTAUR': 'CENTAUR',

  // ── Minotaur ───────────────────────────────────────────────────────────────
  'MINOTAUR': 'MINOTAUR',

  // ── Satyr ──────────────────────────────────────────────────────────────────
  'SATYR': 'SATYR',
}

function baseName(name: string): string {
  const upper = name.toUpperCase().trim()
  if (PARENT_RACE_MAP[upper]) return PARENT_RACE_MAP[upper]
  return upper.split('(')[0].trim()
}

function toTitleCase(s: string): string {
  return s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('-')
}

function raceIcon(base: string): string | undefined {
  return RACE_ICONS[toTitleCase(base)] ?? RACE_ICONS[base]
}

function raceDesc(base: string, fallback: string): string {
  return RACE_DESCRIPTIONS[toTitleCase(base)] ?? fallback
}

// ── Skills list ────────────────────────────────────────────────────────────────

const ALL_SKILLS = [
  'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics',
  'Deception', 'History', 'Insight', 'Intimidation',
  'Investigation', 'Medicine', 'Nature', 'Perception',
  'Performance', 'Persuasion', 'Religion', 'Sleight of Hand',
  'Stealth', 'Survival',
]

// ── Grouping ───────────────────────────────────────────────────────────────────

type FlatEntry  = { kind: 'flat';  race: DndRace }
type GroupEntry = { kind: 'group'; base: string; children: DndRace[] }
type ListEntry  = FlatEntry | GroupEntry

function buildGroups(races: DndRace[]): ListEntry[] {
  const map = new Map<string, DndRace[]>()
  for (const race of races) {
    // Custom/Custom Lineage entries live only in the Custom Origin section
    if (race.name.toLowerCase().startsWith('custom')) continue
    const b = baseName(race.name)
    if (!map.has(b)) map.set(b, [])
    map.get(b)!.push(race)
  }

  const entries: ListEntry[] = []
  for (const [base, children] of Array.from(map.entries())) {
    // Sort children within each group alphabetically
    const sorted = [...children].sort((a, b) => a.name.localeCompare(b.name))
    if (sorted.length >= 2) {
      entries.push({ kind: 'group', base, children: sorted })
    } else {
      entries.push({ kind: 'flat', race: sorted[0] })
    }
  }

  // Sort the combined list by display name (case-insensitive)
  return entries.sort((a, b) => {
    const ak = (a.kind === 'flat' ? a.race.name : a.base).toLowerCase()
    const bk = (b.kind === 'flat' ? b.race.name : b.base).toLowerCase()
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

// ── Custom Lineage mini-form ───────────────────────────────────────────────────

function CustomLineageForm({
  choices,
  onChange,
}: {
  choices: CustomLineageChoices
  onChange: (patch: Partial<CustomLineageChoices>) => void
}) {
  const [bonusMode, setBonusMode] = useState<'2+1' | '1+1+1'>('2+1')
  const [plus2, setPlus2]         = useState<StatKey | ''>('')
  const [plus1, setPlus1]         = useState<StatKey | ''>('')
  const [three, setThree]         = useState<[StatKey | '', StatKey | '', StatKey | '']>(['', '', ''])

  const emitBonuses = (
    mode: '2+1' | '1+1+1',
    p2: StatKey | '',
    p1: StatKey | '',
    t: [StatKey | '', StatKey | '', StatKey | ''],
  ) => {
    const bonuses: Partial<Record<StatKey, number>> = {}
    if (mode === '2+1') {
      if (p2) bonuses[p2] = 2
      if (p1 && p1 !== p2) bonuses[p1] = 1
      else if (p1 && p1 === p2) bonuses[p2] = 3  // edge case: same stat
    } else {
      for (const s of t) {
        if (s) bonuses[s] = (bonuses[s] ?? 0) + 1
      }
    }
    onChange({ abilityBonuses: bonuses })
  }

  const switchMode = (m: '2+1' | '1+1+1') => {
    setBonusMode(m); setPlus2(''); setPlus1(''); setThree(['', '', ''])
    onChange({ abilityBonuses: {} })
  }

  return (
    <div className="mt-3 space-y-4 px-4 py-4 bg-dnd-subtle border border-dnd-accent/30 rounded-lg">
      {/* Ability bonuses */}
      <div>
        <p className="text-xs font-semibold text-dnd-muted uppercase tracking-wider mb-2">
          Ability Score Bonuses
        </p>
        <div className="flex gap-2 mb-3">
          {(['2+1', '1+1+1'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`px-3 py-1.5 rounded text-xs font-bold border transition-all ${
                bonusMode === m
                  ? 'border-dnd-accent bg-dnd-accent/10 text-dnd-accent'
                  : 'border-dnd-border text-dnd-muted hover:text-dnd-text'
              }`}
            >
              {m === '2+1' ? '+2 / +1' : '+1 / +1 / +1'}
            </button>
          ))}
        </div>

        {bonusMode === '2+1' ? (
          <div className="grid grid-cols-2 gap-2">
            <select
              value={plus2}
              onChange={(e) => {
                const v = e.target.value as StatKey | ''
                setPlus2(v)
                emitBonuses('2+1', v, plus1, three)
              }}
              className="px-2 py-1.5 bg-dnd-card border border-dnd-border rounded text-sm text-dnd-text outline-none focus:border-dnd-accent"
            >
              <option value="">+2 to…</option>
              {STAT_KEYS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={plus1}
              onChange={(e) => {
                const v = e.target.value as StatKey | ''
                setPlus1(v)
                emitBonuses('2+1', plus2, v, three)
              }}
              className="px-2 py-1.5 bg-dnd-card border border-dnd-border rounded text-sm text-dnd-text outline-none focus:border-dnd-accent"
            >
              <option value="">+1 to…</option>
              {STAT_KEYS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {([0, 1, 2] as const).map((i) => (
              <select
                key={i}
                value={three[i]}
                onChange={(e) => {
                  const v = e.target.value as StatKey | ''
                  const next = [...three] as [StatKey | '', StatKey | '', StatKey | '']
                  next[i] = v
                  setThree(next)
                  emitBonuses('1+1+1', plus2, plus1, next)
                }}
                className="px-2 py-1.5 bg-dnd-card border border-dnd-border rounded text-sm text-dnd-text outline-none focus:border-dnd-accent"
              >
                <option value="">+1 to…</option>
                {STAT_KEYS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ))}
          </div>
        )}

        {/* Preview */}
        {Object.keys(choices.abilityBonuses).length > 0 && (
          <p className="text-xs text-dnd-accent mt-2">
            {Object.entries(choices.abilityBonuses)
              .filter(([, v]) => v !== 0)
              .map(([k, v]) => `${k} +${v}`)
              .join(', ')}
          </p>
        )}
      </div>

      {/* Skill proficiency */}
      <div>
        <p className="text-xs font-semibold text-dnd-muted uppercase tracking-wider mb-2">
          Skill Proficiency
        </p>
        <select
          value={choices.skillProficiency}
          onChange={(e) => onChange({ skillProficiency: e.target.value })}
          className="w-full px-2 py-1.5 bg-dnd-card border border-dnd-border rounded text-sm text-dnd-text outline-none focus:border-dnd-accent"
        >
          <option value="">Choose a skill…</option>
          {ALL_SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Feat */}
      <div>
        <p className="text-xs font-semibold text-dnd-muted uppercase tracking-wider mb-2">
          Feat
        </p>
        <input
          type="text"
          value={choices.feat}
          onChange={(e) => onChange({ feat: e.target.value })}
          placeholder="e.g. Alert, Lucky, Skilled…"
          className="w-full px-2 py-1.5 bg-dnd-card border border-dnd-border rounded text-sm text-dnd-text placeholder:text-dnd-muted outline-none focus:border-dnd-accent transition-colors"
        />
      </div>

      {/* Darkvision */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-dnd-muted uppercase tracking-wider">Darkvision</p>
          <p className="text-xs text-dnd-muted mt-0.5">60 ft (in place of a second feat)</p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ darkvision: !choices.darkvision })}
          className={`relative w-10 h-6 rounded-full transition-colors ${choices.darkvision ? 'bg-dnd-accent' : 'bg-dnd-border'}`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${choices.darkvision ? 'left-5' : 'left-1'}`} />
        </button>
      </div>

      {/* Description */}
      <div>
        <p className="text-xs font-semibold text-dnd-muted uppercase tracking-wider mb-2">
          Lineage Description <span className="font-normal">(optional)</span>
        </p>
        <textarea
          value={choices.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={2}
          placeholder="Describe your character's unique heritage…"
          className="w-full px-2 py-1.5 bg-dnd-card border border-dnd-border rounded text-sm text-dnd-text placeholder:text-dnd-muted outline-none focus:border-dnd-accent transition-colors resize-none"
        />
      </div>
    </div>
  )
}

// ── Standard languages list (for Tasha's replacement dropdowns) ───────────────

const STANDARD_LANGUAGES = [
  'Abyssal', 'Aquan', 'Auran', 'Celestial', 'Common', 'Deep Speech',
  'Draconic', 'Druidic', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish',
  'Goblin', 'Halfling', 'Ignan', 'Infernal', 'Orc', 'Primordial',
  'Sylvan', 'Terran', "Thieves' Cant", 'Undercommon',
]

// ── Tasha's "Customize Your Origin" manager ───────────────────────────────────

function OriginManager({
  race,
  customizations,
  onChange,
}: {
  race: DndRace
  customizations: OriginCustomizations
  onChange: (patch: Partial<OriginCustomizations>) => void
}) {
  const [open, setOpen] = useState(false)

  const bonuses = Object.entries(race.ability_bonuses ?? {}).filter(([, v]) => v !== 0)
  // Languages excluding flexible placeholder strings
  const fixedLangs = (race.languages ?? []).filter(
    (l) => !l.toLowerCase().startsWith('one of') && !l.toLowerCase().includes('your choice'),
  )
  const hasProficiencies = (race.traits ?? []).length > 0

  if (bonuses.length === 0 && fixedLangs.length === 0 && !hasProficiencies) return null

  const patchAbility = (fromStat: string, toStat: string) => {
    const next = { ...customizations.abilityScoreReplacements }
    if (toStat === fromStat) {
      delete next[fromStat]
    } else {
      next[fromStat] = toStat
    }
    onChange({ abilityScoreReplacements: next })
  }

  const patchLanguage = (fromLang: string, toLang: string) => {
    const next = { ...customizations.languageReplacements }
    if (toLang === fromLang || toLang === '') {
      delete next[fromLang]
    } else {
      next[fromLang] = toLang
    }
    onChange({ languageReplacements: next })
  }

  const addProfReplace = () => {
    const next = { ...customizations.proficiencyReplacements, '': '' }
    onChange({ proficiencyReplacements: next })
  }

  const setProfReplace = (oldKey: string, newKey: string, newVal: string) => {
    const entries = Object.entries(customizations.proficiencyReplacements).filter(([k]) => k !== oldKey)
    if (newKey) entries.push([newKey, newVal])
    onChange({ proficiencyReplacements: Object.fromEntries(entries) })
  }

  const removeProfReplace = (key: string) => {
    const next = { ...customizations.proficiencyReplacements }
    delete next[key]
    onChange({ proficiencyReplacements: next })
  }

  const hasAnyChange =
    Object.keys(customizations.abilityScoreReplacements).length > 0 ||
    Object.keys(customizations.languageReplacements).length > 0 ||
    Object.keys(customizations.proficiencyReplacements).length > 0

  return (
    <div className="mt-4 border border-dnd-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-dnd-subtle hover:bg-dnd-card transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-dnd-text">✨ Customize Your Origin</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-dnd-border text-dnd-muted font-semibold">TCE</span>
          {hasAnyChange && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-dnd-accent/20 text-dnd-accent font-semibold">
              modified
            </span>
          )}
        </div>
        <Chevron open={open} className="text-dnd-muted" />
      </button>

      {open && (
        <div className="px-4 py-4 space-y-5 bg-dnd-card border-t border-dnd-border">
          <p className="text-xs text-dnd-muted leading-relaxed">
            Tasha&apos;s Cauldron of Everything lets you move your racial ability bonuses to any stat,
            swap languages, and replace skill or tool proficiencies granted by your race.
          </p>

          {/* ── Ability Score Replacements ── */}
          {bonuses.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-dnd-muted uppercase tracking-wider mb-2">
                Ability Score Increases
              </p>
              <div className="space-y-2">
                {bonuses.map(([fromStat, bonus]) => {
                  const target = customizations.abilityScoreReplacements[fromStat] ?? fromStat
                  return (
                    <div key={fromStat} className="flex items-center gap-2">
                      <span className="text-xs text-dnd-muted w-20 flex-shrink-0">
                        +{bonus} originally
                      </span>
                      <select
                        value={target}
                        onChange={(e) => patchAbility(fromStat, e.target.value)}
                        className="flex-1 px-2 py-1.5 bg-dnd-subtle border border-dnd-border rounded text-sm text-dnd-text outline-none focus:border-dnd-accent"
                      >
                        {STAT_KEYS.map((s) => (
                          <option key={s} value={s}>
                            {s} {s === fromStat ? '(default)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Language Replacements ── */}
          {fixedLangs.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-dnd-muted uppercase tracking-wider mb-2">
                Languages
              </p>
              <div className="space-y-2">
                {fixedLangs.map((lang) => {
                  const target = customizations.languageReplacements[lang] ?? lang
                  return (
                    <div key={lang} className="flex items-center gap-2">
                      <span className="text-xs text-dnd-muted w-20 flex-shrink-0 truncate">{lang}</span>
                      <select
                        value={target}
                        onChange={(e) => patchLanguage(lang, e.target.value)}
                        className="flex-1 px-2 py-1.5 bg-dnd-subtle border border-dnd-border rounded text-sm text-dnd-text outline-none focus:border-dnd-accent"
                      >
                        <option value={lang}>{lang} (default)</option>
                        {STANDARD_LANGUAGES.filter((l) => l !== lang).map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Proficiency Replacements (free-form) ── */}
          <div>
            <p className="text-xs font-semibold text-dnd-muted uppercase tracking-wider mb-2">
              Proficiency Replacements
            </p>
            {Object.entries(customizations.proficiencyReplacements).map(([oldProf, newProf]) => (
              <div key={oldProf} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={oldProf}
                  onChange={(e) => setProfReplace(oldProf, e.target.value, newProf)}
                  placeholder="Replace…"
                  className="flex-1 px-2 py-1.5 bg-dnd-subtle border border-dnd-border rounded text-xs text-dnd-text placeholder:text-dnd-muted outline-none focus:border-dnd-accent"
                />
                <span className="text-dnd-muted text-xs flex-shrink-0">→</span>
                <input
                  type="text"
                  value={newProf}
                  onChange={(e) => setProfReplace(oldProf, oldProf, e.target.value)}
                  placeholder="With…"
                  className="flex-1 px-2 py-1.5 bg-dnd-subtle border border-dnd-border rounded text-xs text-dnd-text placeholder:text-dnd-muted outline-none focus:border-dnd-accent"
                />
                <button
                  type="button"
                  onClick={() => removeProfReplace(oldProf)}
                  className="text-dnd-muted hover:text-red-400 transition-colors text-sm flex-shrink-0"
                  aria-label="Remove"
                >✕</button>
              </div>
            ))}
            <button
              type="button"
              onClick={addProfReplace}
              className="text-xs text-dnd-accent hover:opacity-80 transition-opacity font-semibold"
            >
              + Add replacement
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Custom origin entries (always shown regardless of source settings) ─────────

const CUSTOM_ORIGINS = [
  {
    name: 'Custom Lineage',
    source: 'TCE',
    desc: "Build your own origin using Tasha's rules. Choose ability bonuses, a skill proficiency, a feat, and optionally darkvision.",
  },
  {
    name: 'Custom',
    source: 'TCE',
    desc: 'A fully customized origin. Work with your DM to define your traits, bonuses, and abilities from scratch.',
  },
]

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
    if (!data.race) return new Set()
    return new Set([baseName(data.race)])
  })
  const [detailOpen, setDetailOpen] = useState<string | null>(data.race || null)

  const entries = useMemo(() => buildGroups(races), [races])
  const visible = useMemo(() => filterEntries(entries, search), [entries, search])

  const effectiveOpen = search
    ? new Set(visible.filter((e) => e.kind === 'group').map((e) => (e as GroupEntry).base))
    : openGroups

  const toggleGroup = (base: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(base)) { next.delete(base) } else { next.add(base) }
      return next
    })

  const selectRace = (name: string, id: string | null = null) => {
    onChange({ race: name, raceId: id })
    setDetailOpen((prev) => (prev === name ? null : name))
  }

  const patchCustom = (patch: Partial<CustomLineageChoices>) =>
    onChange({ customLineageChoices: { ...data.customLineageChoices, ...patch } })

  const patchOrigin = (patch: Partial<OriginCustomizations>) =>
    onChange({ originCustomizations: { ...data.originCustomizations, ...patch } })

  const selectedRace = races.find((r) => r.name === data.race) ?? null

  const isCustomSelected = CUSTOM_ORIGINS.some((c) => c.name === data.race)

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

      {/* ── Custom Origin section (always visible) ── */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px flex-1 bg-dnd-border" />
          <span className="text-[10px] font-bold tracking-widest text-dnd-muted uppercase">Custom Origin</span>
          <div className="h-px flex-1 bg-dnd-border" />
        </div>

        <div className="border border-dnd-accent/40 rounded-lg overflow-hidden">
          {CUSTOM_ORIGINS.map((origin, idx) => {
            const isSelected = data.race === origin.name
            return (
              <div key={origin.name} className={idx > 0 ? 'border-t border-dnd-border' : ''}>
                <button
                  onClick={() => {
                    if (isSelected) {
                      // Toggle off — deselect and re-enable standard races list
                      onChange({ race: '', raceId: null })
                      setDetailOpen(null)
                    } else {
                      selectRace(origin.name, null)
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ${
                    isSelected
                      ? 'bg-dnd-accent/10 border-l-[3px] border-l-dnd-accent'
                      : 'bg-dnd-card hover:bg-dnd-subtle border-l-[3px] border-l-transparent'
                  }`}
                >
                  <span className="text-xl flex-shrink-0 w-8 text-center leading-none">🎨</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-sm tracking-wider uppercase ${isSelected ? 'text-dnd-accent' : 'text-dnd-text'}`}>
                        {origin.name}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-dnd-border text-dnd-muted font-semibold">
                        {origin.source}
                      </span>
                    </div>
                    <p className="text-xs text-dnd-muted mt-0.5 line-clamp-1">{origin.desc}</p>
                  </div>
                  {isSelected
                    ? <span className="text-[10px] text-dnd-muted border border-dnd-border rounded px-1.5 py-0.5 flex-shrink-0">✕ clear</span>
                    : null
                  }
                </button>

                {isSelected && (
                  <CustomLineageForm
                    choices={data.customLineageChoices}
                    onChange={patchCustom}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="flex items-center gap-3 mb-3">
        <div className="h-px flex-1 bg-dnd-border" />
        <span className="text-[10px] font-bold tracking-widest text-dnd-muted uppercase">Standard Races</span>
        <div className="h-px flex-1 bg-dnd-border" />
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

      {/* Race list */}
      <div className={`border border-dnd-border rounded-lg overflow-hidden transition-opacity ${isCustomSelected ? 'opacity-40 pointer-events-none' : ''}`} >
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
                    onClick={() => selectRace(race.name, race.id ?? null)}
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
            const isGroupOpen   = effectiveOpen.has(base)
            const groupSelected = children.some((c) => c.name === data.race)

            return (
              <div key={base} className={divider}>
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

                {isGroupOpen && children.map((race) => {
                  const isSelected = data.race === race.name
                  const isDetail   = detailOpen === race.name
                  return (
                    <div key={race.name} className="border-t border-dnd-border/60">
                      <button
                        onClick={() => selectRace(race.name, race.id ?? null)}
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

      {/* ── Tasha's Origin Manager — only for standard (non-custom) races with TCE allowed ── */}
      {!isCustomSelected && selectedRace && data.allowedSources.includes('TCE') && (
        <OriginManager
          race={selectedRace}
          customizations={data.originCustomizations}
          onChange={patchOrigin}
        />
      )}
    </div>
  )
}
