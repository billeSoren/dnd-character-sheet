'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import ThemeToggle from './ThemeToggle'
import { StatKey } from '@/components/character-builder/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface CharacterData {
  id: string; name: string; race: string; class: string
  level: number; background: string; skill_proficiencies: string[]
}
interface SaveThrow { key: StatKey; label: string; proficient: boolean; total: number }
interface Skill      { name: string; ability: StatKey; proficient: boolean; total: number }

export interface CharacterSheetProps {
  character:        CharacterData
  statScores:       Record<StatKey, number>
  hp:               { max: number; current: number; temp: number }
  profBonus:        number
  initiative:       number
  ac:               number
  speed:            number
  size:             string
  passivePerception:number
  savingThrows:     SaveThrow[]
  skillList:        Skill[]
  spellSlots:       number[]            // 9 elements: slots per spell level
  classInfo:        {
    description: string; hit_die: number
    armor_proficiencies: string; weapon_proficiencies: string
    primary_ability: string; saving_throws: string[]
  } | null
  raceInfo: {
    description: string; traits: string[]
    languages: string[]; ability_bonuses: Record<string, number>
  } | null
}

type Tab = 'actions' | 'spells' | 'features' | 'notes'

const LEVEL_ORD = ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th']

function modStr(n: number) { return n >= 0 ? `+${n}` : String(n) }
function mod(score: number) { return Math.floor((score - 10) / 2) }
function modColor(n: number) {
  return n > 0 ? 'text-green-400' : n < 0 ? 'text-red-400' : 'text-dnd-muted'
}

const STAT_META: { key: StatKey; abbr: string; label: string }[] = [
  { key:'STR', abbr:'STR', label:'Strength' },
  { key:'DEX', abbr:'DEX', label:'Dexterity' },
  { key:'CON', abbr:'CON', label:'Constitution' },
  { key:'INT', abbr:'INT', label:'Intelligence' },
  { key:'WIS', abbr:'WIS', label:'Wisdom' },
  { key:'CHA', abbr:'CHA', label:'Charisma' },
]

// ── Root component ─────────────────────────────────────────────────────────────

export default function CharacterSheet(props: CharacterSheetProps) {
  const { character, statScores, hp, profBonus, initiative, ac, speed,
          passivePerception, savingThrows, skillList, spellSlots,
          classInfo, raceInfo } = props

  return (
    <div className="min-h-screen bg-dnd-bg">
      {/* ── Sticky header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-dnd-border bg-dnd-bg/95 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-dnd-muted hover:text-dnd-accent transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="h-4 w-px bg-dnd-border flex-shrink-0" />
          <span className="font-bold text-dnd-accent tracking-wide">{character.name}</span>
          <span className="text-dnd-muted text-sm hidden sm:block">
            {character.race} · {character.class} · Level {character.level}
          </span>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>
      </header>

      {/* ── Three-column layout ───────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-3 py-4 grid grid-cols-1 lg:grid-cols-[220px_1fr_340px] gap-4">

        {/* ═══ LEFT COLUMN ════════════════════════════════════════ */}
        <LeftPanel
          character={character}
          profBonus={profBonus}
          initiative={initiative}
          ac={ac}
          speed={speed}
          passivePerception={passivePerception}
          classInfo={classInfo}
        />

        {/* ═══ CENTRE COLUMN ══════════════════════════════════════ */}
        <CentrePanel
          character={character}
          statScores={statScores}
          hp={hp}
          savingThrows={savingThrows}
          skillList={skillList}
        />

        {/* ═══ RIGHT COLUMN ═══════════════════════════════════════ */}
        <RightPanel
          character={character}
          statScores={statScores}
          profBonus={profBonus}
          spellSlots={spellSlots}
          classInfo={classInfo}
          raceInfo={raceInfo}
        />
      </div>
    </div>
  )
}

// ── LEFT COLUMN ────────────────────────────────────────────────────────────────

function LeftPanel({ character, profBonus, initiative, ac, speed, passivePerception, classInfo }:
  Pick<CharacterSheetProps, 'character'|'profBonus'|'initiative'|'ac'|'speed'|'passivePerception'|'classInfo'>
) {
  const initials = character.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const hitDice = `${character.level}d${classInfo?.hit_die ?? 8}`

  return (
    <div className="space-y-3">
      {/* Portrait + identity */}
      <Sheet>
        <div className="flex flex-col items-center gap-3 py-1">
          {/* Portrait circle */}
          <div
            className="w-20 h-20 rounded-full border-[3px] border-dnd-accent/60 flex items-center justify-center text-2xl font-bold text-dnd-accent select-none"
            style={{ background: 'linear-gradient(135deg, var(--dnd-subtle), var(--dnd-bg))' }}
          >
            {initials}
          </div>

          <div className="text-center">
            <h1 className="text-lg font-bold text-dnd-text leading-tight">{character.name}</h1>
            <p className="text-xs text-dnd-accent mt-0.5 font-medium">{character.class}</p>
            <p className="text-xs text-dnd-muted mt-0.5">{character.race}</p>
            <p className="text-xs text-dnd-muted opacity-70 mt-0.5">{character.background}</p>
          </div>

          {/* Level progress */}
          <div className="w-full">
            <div className="flex justify-between text-[10px] text-dnd-muted mb-1">
              <span>Level {character.level}</span>
              <span>/ 20</span>
            </div>
            <div className="h-1.5 bg-dnd-border rounded-full overflow-hidden">
              <div
                className="h-full bg-dnd-accent rounded-full transition-all"
                style={{ width: `${(character.level / 20) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </Sheet>

      {/* Quick stats grid */}
      <Sheet>
        <div className="grid grid-cols-2 gap-2">
          <QuickStat label="Proficiency" value={`+${profBonus}`} accent />
          <QuickStat label="Initiative"  value={modStr(initiative)} accent={initiative > 0} />
          <QuickStat label="Armour Class" value={String(ac)} />
          <QuickStat label="Speed"       value={`${speed} ft`} />
          <QuickStat label="Passive Perc." value={String(passivePerception)} />
          <QuickStat label="Hit Dice"    value={hitDice} />
        </div>
      </Sheet>

      {/* Inspiration */}
      <InspirationToggle />
    </div>
  )
}

function QuickStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center py-2.5 px-1 rounded-lg border border-dnd-border bg-dnd-subtle text-center">
      <span className={`text-lg font-bold leading-none ${accent ? 'text-dnd-accent' : 'text-dnd-text'}`}>
        {value}
      </span>
      <span className="text-[9px] font-semibold text-dnd-muted uppercase tracking-wide mt-1 leading-tight">
        {label}
      </span>
    </div>
  )
}

function InspirationToggle() {
  const [on, setOn] = useState(false)
  return (
    <Sheet>
      <button
        onClick={() => setOn((p) => !p)}
        className={`w-full flex items-center gap-3 py-1 transition-colors ${on ? 'text-dnd-accent' : 'text-dnd-muted hover:text-dnd-text'}`}
      >
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          on ? 'border-dnd-accent bg-dnd-accent' : 'border-dnd-muted'
        }`}>
          {on && <span className="text-white text-[10px] leading-none">✦</span>}
        </div>
        <div>
          <p className="text-sm font-semibold text-left">Inspiration</p>
          <p className="text-[10px] text-dnd-muted text-left">{on ? 'Active' : 'Not active'}</p>
        </div>
      </button>
    </Sheet>
  )
}

// ── CENTRE COLUMN ──────────────────────────────────────────────────────────────

function CentrePanel({ character, statScores, hp, savingThrows, skillList }:
  Pick<CharacterSheetProps, 'character'|'statScores'|'hp'|'savingThrows'|'skillList'>
) {
  return (
    <div className="space-y-4">
      {/* 6 Ability Score cards */}
      <Sheet label="Ability Scores">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {STAT_META.map(({ key, abbr, label }) => {
            const score = statScores[key]
            const m     = mod(score)
            return (
              <div
                key={key}
                className="flex flex-col items-center gap-1 py-3 px-1 rounded-lg border border-dnd-border bg-dnd-subtle"
              >
                <span className="text-[10px] font-bold text-dnd-accent tracking-widest">{abbr}</span>
                <span className={`text-2xl font-bold leading-none ${modColor(m)}`}>{modStr(m)}</span>
                {/* Score ring */}
                <div className="w-9 h-9 rounded-full border-2 border-dnd-border flex items-center justify-center mt-0.5">
                  <span className="text-sm font-bold text-dnd-text">{score}</span>
                </div>
                <span className="text-[8px] text-dnd-muted uppercase tracking-wider leading-tight text-center">
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </Sheet>

      {/* HP Tracker */}
      <Sheet label="Hit Points">
        <HPTracker characterId={character.id} hp={hp} />
      </Sheet>

      {/* Saving Throws + Skills side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Sheet label="Saving Throws">
          <div className="space-y-0.5">
            {savingThrows.map((sv) => (
              <ProfRow key={sv.key} proficient={sv.proficient} label={sv.label} value={sv.total} />
            ))}
          </div>
        </Sheet>

        <Sheet label="Skills">
          <div className="max-h-80 overflow-y-auto dnd-scrollbar space-y-0.5 pr-1">
            {skillList.map((sk) => (
              <ProfRow
                key={sk.name}
                proficient={sk.proficient}
                label={sk.name}
                value={sk.total}
                sub={sk.ability}
              />
            ))}
          </div>
        </Sheet>
      </div>
    </div>
  )
}

// ── RIGHT COLUMN ───────────────────────────────────────────────────────────────

function RightPanel({ character, statScores, profBonus, spellSlots, classInfo, raceInfo }:
  Pick<CharacterSheetProps, 'character'|'statScores'|'profBonus'|'spellSlots'|'classInfo'|'raceInfo'>
) {
  const [tab, setTab] = useState<Tab>('actions')
  const tabs: { id: Tab; label: string }[] = [
    { id: 'actions', label: 'Actions' },
    { id: 'spells',  label: 'Spells'  },
    { id: 'features',label: 'Features'},
    { id: 'notes',   label: 'Notes'   },
  ]

  return (
    <div className="space-y-0">
      {/* Tab bar */}
      <div className="flex border-b border-dnd-border overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 min-w-0 py-2.5 px-1 text-xs font-bold tracking-widest uppercase whitespace-nowrap transition-colors border-b-2 ${
              tab === t.id
                ? 'border-dnd-accent text-dnd-accent'
                : 'border-transparent text-dnd-muted hover:text-dnd-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="pt-3">
        {tab === 'actions'  && <ActionsTab character={character} statScores={statScores} profBonus={profBonus} />}
        {tab === 'spells'   && <SpellsTab  spellSlots={spellSlots} character={character} />}
        {tab === 'features' && <FeaturesTab classInfo={classInfo} raceInfo={raceInfo} character={character} />}
        {tab === 'notes'    && <NotesTab characterId={character.id} />}
      </div>
    </div>
  )
}

// ── Tab: Actions ───────────────────────────────────────────────────────────────

function ActionsTab({ character, statScores, profBonus }:
  { character: CharacterData; statScores: Record<StatKey, number>; profBonus: number }
) {
  const strMod = mod(statScores.STR)
  const dexMod = mod(statScores.DEX)
  const attackBonus = (ability: StatKey) => mod(statScores[ability]) + profBonus

  const actions = [
    { name: 'Unarmed Strike', type: 'Melee', ability: 'STR' as StatKey, dmg: `1 + ${Math.max(0, strMod)} bludgeoning` },
    ...(dexMod > strMod
      ? [{ name: 'Finesse Strike', type: 'Melee', ability: 'DEX' as StatKey, dmg: `1d6 + ${Math.max(0, dexMod)} piercing` }]
      : []),
  ]

  return (
    <div className="space-y-3">
      <Sheet label="Actions">
        <div className="space-y-2">
          {actions.map((a) => (
            <div key={a.name} className="flex items-center gap-3 py-2 px-3 rounded-lg border border-dnd-border bg-dnd-subtle">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-dnd-text">{a.name}</p>
                <p className="text-xs text-dnd-muted">{a.type} · {a.dmg}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-lg font-bold ${modColor(attackBonus(a.ability))}`}>
                  {modStr(attackBonus(a.ability))}
                </p>
                <p className="text-[9px] text-dnd-muted uppercase tracking-wide">to hit</p>
              </div>
            </div>
          ))}
        </div>
      </Sheet>

      <Sheet label="Proficiencies">
        <div className="space-y-2 text-sm">
          {[
            { label: 'Armour', value: character.class === 'Barbarian' ? 'Light, Medium, Shields' : 'As class' },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-2">
              <span className="text-dnd-muted min-w-[80px]">{label}:</span>
              <span className="text-dnd-text">{value}</span>
            </div>
          ))}
        </div>
      </Sheet>
    </div>
  )
}

// ── Tab: Spells ────────────────────────────────────────────────────────────────

function SpellsTab({ spellSlots, character }: { spellSlots: number[]; character: CharacterData }) {
  const hasSlots = spellSlots.some((s) => s > 0)

  // Track used slots per level (resets on reload — persisting requires character_spell_slots table)
  const [usedSlots, setUsedSlots] = useState<number[]>(Array(9).fill(0))

  const spendSlot = (level: number) => {
    setUsedSlots((prev) => {
      const next = [...prev]
      if (next[level] < spellSlots[level]) next[level]++
      return next
    })
  }
  const recoverSlot = (level: number) => {
    setUsedSlots((prev) => {
      const next = [...prev]
      if (next[level] > 0) next[level]--
      return next
    })
  }

  if (!hasSlots) {
    return (
      <div className="text-center py-10 text-dnd-muted">
        <span className="text-3xl block mb-2">🚫</span>
        <p className="text-sm font-medium">{character.class}s don&apos;t have spell slots.</p>
        <p className="text-xs mt-1 opacity-60">Choose a spellcasting class to use this tab.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Sheet label="Spell Slots">
        <div className="space-y-2">
          {spellSlots.map((total, i) => {
            if (total === 0) return null
            const used = usedSlots[i]
            const remaining = total - used
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-dnd-muted w-8 text-right">{LEVEL_ORD[i]}</span>
                {/* Slot pips */}
                <div className="flex gap-1.5 flex-1">
                  {Array.from({ length: total }).map((_, j) => (
                    <button
                      key={j}
                      onClick={() => j < remaining ? spendSlot(i) : recoverSlot(i)}
                      title={j < remaining ? 'Use slot' : 'Recover slot'}
                      className={`w-6 h-6 rounded border-2 transition-all ${
                        j < remaining
                          ? 'bg-dnd-accent/20 border-dnd-accent hover:bg-dnd-accent/40'
                          : 'bg-transparent border-dnd-border hover:border-dnd-accent/40'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-dnd-muted tabular-nums w-10 text-right">
                  {remaining}/{total}
                </span>
              </div>
            )
          })}
        </div>
        <p className="text-[10px] text-dnd-muted mt-3 opacity-60">
          Slot usage resets on page reload. A character_spell_slots table would persist this.
        </p>
      </Sheet>

      <Sheet label="Spellbook">
        <p className="text-sm text-dnd-muted text-center py-4">
          Add spells from the{' '}
          <a href="/spells" className="text-dnd-accent hover:underline">Spell Browser</a>
          {' '}to build your spellbook.
        </p>
      </Sheet>
    </div>
  )
}

// ── Tab: Features ──────────────────────────────────────────────────────────────

function FeaturesTab({ classInfo, raceInfo, character }:
  { classInfo: CharacterSheetProps['classInfo']; raceInfo: CharacterSheetProps['raceInfo']; character: CharacterData }
) {
  return (
    <div className="space-y-3">
      {classInfo && (
        <Sheet label={`${character.class} Features`}>
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-dnd-muted block">Hit Die</span>
                <span className="text-dnd-text font-semibold">d{classInfo.hit_die}</span>
              </div>
              <div>
                <span className="text-dnd-muted block">Primary Ability</span>
                <span className="text-dnd-text font-semibold">{classInfo.primary_ability || '—'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-dnd-muted block">Armour</span>
                <span className="text-dnd-text font-semibold">{classInfo.armor_proficiencies || '—'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-dnd-muted block">Weapons</span>
                <span className="text-dnd-text font-semibold">{classInfo.weapon_proficiencies || '—'}</span>
              </div>
            </div>
            <div className="border-t border-dnd-border pt-2.5">
              <p className="text-xs text-dnd-text leading-relaxed">{classInfo.description}</p>
            </div>
          </div>
        </Sheet>
      )}

      {raceInfo && (
        <Sheet label={`${character.race} Traits`}>
          <div className="space-y-2.5">
            {raceInfo.traits.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {raceInfo.traits.map((t) => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded border border-dnd-border bg-dnd-subtle text-dnd-text">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {raceInfo.languages.length > 0 && (
              <p className="text-xs text-dnd-muted">
                <span className="font-semibold text-dnd-text">Languages:</span>{' '}
                {raceInfo.languages.join(', ')}
              </p>
            )}
            <div className="border-t border-dnd-border pt-2.5">
              <p className="text-xs text-dnd-text leading-relaxed">{raceInfo.description}</p>
            </div>
          </div>
        </Sheet>
      )}

      <Sheet label="Background">
        <p className="text-sm font-semibold text-dnd-text">{character.background}</p>
        <p className="text-xs text-dnd-muted mt-1">
          Skills:{' '}
          {character.skill_proficiencies.length > 0
            ? character.skill_proficiencies.join(', ')
            : 'None recorded'}
        </p>
      </Sheet>
    </div>
  )
}

// ── Tab: Notes ─────────────────────────────────────────────────────────────────

function NotesTab({ characterId }: { characterId: string }) {
  const STORAGE_KEY = `dnd-notes-${characterId}`
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      setText(localStorage.getItem(STORAGE_KEY) ?? '')
    } catch { /* storage unavailable */ }
  }, [STORAGE_KEY])

  const save = useCallback((value: string) => {
    try { localStorage.setItem(STORAGE_KEY, value) } catch { /* ignore */ }
    setSaved(true)
  }, [STORAGE_KEY])

  const handleChange = (value: string) => {
    setText(value)
    setSaved(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => save(value), 600)
  }

  // Flush on unmount
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-dnd-muted uppercase tracking-widest">
          Character Notes
        </span>
        <span className={`text-[10px] transition-opacity ${saved ? 'opacity-0' : 'text-dnd-muted opacity-100'}`}>
          Saving…
        </span>
      </div>
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Quests, NPC names, important clues, session notes…"
        rows={16}
        className="w-full px-3 py-2.5 bg-dnd-subtle border border-dnd-border rounded-lg text-dnd-text placeholder:text-dnd-muted/50 outline-none focus:border-dnd-accent transition-colors text-sm leading-relaxed resize-none dnd-scrollbar"
      />
      <p className="text-[10px] text-dnd-muted opacity-50">
        Stored in your browser. To persist across devices, a notes column on characters is needed.
      </p>
    </div>
  )
}

// ── Shared sub-components ──────────────────────────────────────────────────────

function Sheet({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="border border-dnd-border bg-dnd-card rounded-xl p-4">
      {label && (
        <p className="text-[10px] font-bold text-dnd-muted uppercase tracking-widest mb-3">{label}</p>
      )}
      {children}
    </div>
  )
}

function ProfRow({ proficient, label, value, sub }:
  { proficient: boolean; label: string; value: number; sub?: string }
) {
  return (
    <div className={`flex items-center gap-2.5 py-1.5 px-2 rounded transition-colors ${proficient ? 'bg-dnd-accent/5' : ''}`}>
      {/* Proficiency pip */}
      <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-all ${
        proficient ? 'bg-dnd-accent border-dnd-accent' : 'border-dnd-muted'
      }`} />
      <span className={`flex-1 text-xs truncate ${proficient ? 'text-dnd-text font-semibold' : 'text-dnd-muted'}`}>
        {label}
      </span>
      {sub && <span className="text-[9px] text-dnd-muted uppercase w-7 text-center">{sub}</span>}
      <span className={`text-xs font-bold tabular-nums w-7 text-right ${modColor(value)}`}>
        {modStr(value)}
      </span>
    </div>
  )
}

// ── HP Tracker ─────────────────────────────────────────────────────────────────

function HPTracker({ characterId, hp }: { characterId: string; hp: { max: number; current: number; temp: number } }) {
  const supabase = createClient()
  const [current, setCurrent] = useState(hp.current)
  const [temp, setTemp]       = useState(hp.temp)
  const [saving, setSaving]   = useState(false)
  const [editTemp, setEditTemp] = useState(false)
  const [tempInput, setTempInput] = useState(String(hp.temp))

  const clamp = (v: number) => Math.max(0, Math.min(hp.max, v))

  const persist = async (c: number, t: number) => {
    setSaving(true)
    await supabase.from('character_hp').update({ current_hp: c, temp_hp: t }).eq('character_id', characterId)
    setSaving(false)
  }

  const adjust = async (delta: number) => {
    const next = clamp(current + delta)
    setCurrent(next)
    await persist(next, temp)
  }

  const commitTemp = async () => {
    const v = Math.max(0, parseInt(tempInput, 10) || 0)
    setTemp(v); setEditTemp(false)
    await persist(current, v)
  }

  const pct = hp.max > 0 ? Math.max(0, (current / hp.max) * 100) : 0
  const barColor = pct > 60 ? 'bg-green-600' : pct > 30 ? 'bg-amber-500' : 'bg-red-600'
  const isDead = current === 0

  return (
    <div className="space-y-3">
      {/* HP fraction */}
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-bold leading-none ${isDead ? 'text-red-500' : 'text-dnd-text'}`}>
            {current}
          </span>
          <span className="text-dnd-muted text-lg">/ {hp.max}</span>
        </div>
        {saving && <span className="text-xs text-dnd-muted animate-pulse">saving…</span>}
        {isDead && <span className="text-red-500 text-xs font-bold animate-pulse">UNCONSCIOUS</span>}
      </div>

      {/* Bar */}
      <div className="h-2.5 bg-dnd-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>

      {/* Quick adjust */}
      <div className="grid grid-cols-5 gap-1">
        {[-10,-5,-1,+5,+10].map((d) => (
          <button
            key={d}
            onClick={() => adjust(d)}
            disabled={saving || (d<0 && current===0) || (d>0 && current===hp.max)}
            className={`py-2 rounded text-sm font-bold transition-all disabled:opacity-25 disabled:cursor-not-allowed ${
              d < 0
                ? 'bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400'
                : 'bg-green-500/10 hover:bg-green-500/25 border border-green-500/30 text-green-400'
            }`}
          >
            {d > 0 ? `+${d}` : d}
          </button>
        ))}
      </div>

      {/* Custom damage/heal */}
      <div className="flex gap-2">
        <HPInput label="Damage"  color="red"   onCommit={(v) => adjust(-v)} disabled={saving} />
        <HPInput label="Heal"    color="green"  onCommit={(v) => adjust(+v)} disabled={saving} />
      </div>

      {/* Temp HP */}
      <div className="flex items-center justify-between border-t border-dnd-border pt-2.5">
        <span className="text-xs text-dnd-muted">Temp HP</span>
        {editTemp ? (
          <div className="flex items-center gap-1">
            <input
              type="number" min={0} value={tempInput} autoFocus
              onChange={(e) => setTempInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && commitTemp()}
              className="w-14 px-2 py-1 bg-dnd-subtle border border-dnd-accent rounded text-center text-sm text-dnd-text outline-none"
            />
            <button onClick={commitTemp} className="px-2 py-1 bg-dnd-accent text-white rounded text-sm">✓</button>
          </div>
        ) : (
          <button onClick={() => { setTempInput(String(temp)); setEditTemp(true) }}
            className="text-dnd-accent font-bold text-sm hover:opacity-75 transition-opacity">
            {temp > 0 ? `+${temp}` : '—'}
            <span className="text-dnd-muted font-normal text-xs ml-1">edit</span>
          </button>
        )}
      </div>
    </div>
  )
}

function HPInput({ label, color, onCommit, disabled }:
  { label: string; color: 'red' | 'green'; onCommit: (v: number) => void; disabled: boolean }
) {
  const [val, setVal] = useState('')
  const commit = () => {
    const n = parseInt(val, 10)
    if (!isNaN(n) && n > 0) { onCommit(n); setVal('') }
  }
  const ring = color === 'red'
    ? 'border-red-500/30 focus:border-red-500'
    : 'border-green-500/30 focus:border-green-500'
  const btn = color === 'red'
    ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400'
    : 'bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400'
  return (
    <div className="flex-1 flex gap-1">
      <input
        type="number" min={1} value={val} placeholder="0"
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        className={`w-0 flex-1 px-2 py-1.5 bg-dnd-subtle border rounded text-center text-sm text-dnd-text outline-none transition-colors ${ring}`}
      />
      <button onClick={commit} disabled={disabled || !val || parseInt(val) <= 0}
        className={`px-3 py-1.5 rounded text-sm font-semibold transition-all disabled:opacity-30 ${btn}`}>
        {label}
      </button>
    </div>
  )
}
