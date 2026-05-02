'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import ThemeToggle from './ThemeToggle'
import { StatKey } from '@/components/character-builder/types'
import MagicItemBrowser from '@/components/magic-items/MagicItemBrowser'
import DeleteCharacterModal from './DeleteCharacterModal'
import {
  MagicItem, CharacterItemWithItem,
  rarityColor, rarityBorder,
  magicBonus, weaponDamage, isFinesseWeapon, isWeaponType,
} from '@/components/magic-items/magic-item-types'
import { calculateAC, ACResult } from '@/lib/ac-calculator'
import LevelUpModal from '@/components/LevelUpModal'

// ── Types ─────────────────────────────────────────────────────────────────────

interface CharacterData {
  id: string; name: string; race: string; class: string
  level: number; background: string; skill_proficiencies: string[]
}
interface SaveThrow { key: StatKey; label: string; proficient: boolean; total: number }
interface Skill      { name: string; ability: StatKey; proficient: boolean; total: number }

export interface CharacterClass {
  id: string
  character_id: string
  class_id: string | null
  class_name: string
  level: number
  subclass: string | null
  is_primary: boolean
  hit_die: number
}

export interface CharacterActiveEffect {
  id: string
  character_id: string
  effect_name: string
  effect_type: string
  value: number
  source: string | null
  source_name: string | null
  expires_at: string | null
  created_at: string
}

export interface CharacterSheetProps {
  character:         CharacterData
  statScores:        Record<StatKey, number>
  hp:                { max: number; current: number; temp: number }
  profBonus:         number
  initiative:        number
  initialAC:         number
  initialACBreakdown:string[]
  speed:             number
  size:              string
  passivePerception: number
  savingThrows:      SaveThrow[]
  skillList:         Skill[]
  spellSlots:        number[]
  initialItems:      CharacterItemWithItem[]
  initialActiveEffects: CharacterActiveEffect[]
  characterClasses:  CharacterClass[]
  allowedSources:    string[]
  classInfo:         {
    description: string; hit_die: number
    armor_proficiencies: string; weapon_proficiencies: string
    primary_ability: string; saving_throws: string[]
  } | null
  raceInfo: {
    description: string; traits: string[]
    languages: string[]; ability_bonuses: Record<string, number>
  } | null
}

type Tab = 'actions' | 'spells' | 'features' | 'equipment' | 'notes'

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
  const {
    character, statScores, hp, profBonus, initiative, speed,
    passivePerception, savingThrows, skillList, spellSlots,
    initialItems = [], initialActiveEffects = [], characterClasses = [],
    allowedSources = [],
    classInfo, raceInfo,
  } = props

  // Lifted item state (shared between EquipmentTab and AC calc)
  const [items, setItems] = useState<CharacterItemWithItem[]>(initialItems)

  // Active effects state (drives client-side AC recalculation)
  const [activeEffects, setActiveEffects] = useState<CharacterActiveEffect[]>(initialActiveEffects)

  // Recompute AC whenever items/effects/stats change
  const acResult: ACResult = useMemo(() => {
    const primarySubclass = characterClasses.find((c) => c.is_primary)?.subclass ?? null
    return calculateAC({
      statScores,
      equippedItems: items
        .filter((ci) => ci.equipped)
        .map((ci) => ({ name: ci.magic_items.name, type: ci.magic_items.type, equipped: true })),
      activeEffects: activeEffects.map((e) => ({
        id: e.id,
        effect_name: e.effect_name,
        effect_type: e.effect_type,
        value: e.value,
        source: e.source,
        source_name: e.source_name,
      })),
      race: character.race,
      className: character.class,
      subclass: primarySubclass,
      level: character.level,
      characterClasses: characterClasses.map((c) => ({
        class_name: c.class_name, level: c.level, subclass: c.subclass,
      })),
    })
  }, [items, activeEffects, statScores, character.race, character.class, character.level, characterClasses])

  // Multiclass label for header
  const classLabel = characterClasses.length > 1
    ? characterClasses.map((c) => `${c.class_name} ${c.level}`).join(' / ')
    : character.class

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
            {character.race} · {classLabel} · Level {character.level}
          </span>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>
      </header>

      {/* ── Three-column layout ───────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-3 py-4 grid grid-cols-1 lg:grid-cols-[220px_1fr_340px] gap-4">

        {/* ═══ LEFT COLUMN ════════════════════════════════════════ */}
        <LeftPanel
          character={character}
          statScores={statScores}
          hp={hp}
          profBonus={profBonus}
          initiative={initiative}
          acResult={acResult}
          activeEffects={activeEffects}
          setActiveEffects={setActiveEffects}
          speed={speed}
          passivePerception={passivePerception}
          classInfo={classInfo}
          characterClasses={characterClasses}
          allowedSources={allowedSources}
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
          items={items}
          setItems={setItems}
        />
      </div>
    </div>
  )
}

// ── LEFT COLUMN ────────────────────────────────────────────────────────────────

interface LeftPanelProps {
  character:       CharacterData
  statScores:      Record<StatKey, number>
  hp:              { max: number; current: number; temp: number }
  profBonus:       number
  initiative:      number
  acResult:        ACResult
  activeEffects:   CharacterActiveEffect[]
  setActiveEffects: React.Dispatch<React.SetStateAction<CharacterActiveEffect[]>>
  speed:           number
  passivePerception: number
  classInfo:       CharacterSheetProps['classInfo']
  characterClasses: CharacterClass[]
  allowedSources:  string[]
}

function LeftPanel({
  character, statScores, hp, profBonus, initiative, acResult, activeEffects, setActiveEffects,
  speed, passivePerception, classInfo, characterClasses, allowedSources,
}: LeftPanelProps) {
  const router  = useRouter()
  const [deleteOpen,   setDeleteOpen]   = useState(false)
  const [deleting,     setDeleting]     = useState(false)
  const [levelUpOpen,  setLevelUpOpen]  = useState(false)
  const [acTooltip,    setAcTooltip]    = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('characters').delete().eq('id', character.id)
    router.push('/')
  }

  const initials = character.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const hitDice = `${character.level}d${classInfo?.hit_die ?? 8}`

  return (
    <div className="space-y-3">
      {/* Portrait + identity */}
      <Sheet>
        <div className="flex flex-col items-center gap-3 py-1">
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
          <QuickStat label="Proficiency"   value={`+${profBonus}`} accent />
          <QuickStat label="Initiative"    value={modStr(initiative)} accent={initiative > 0} />
          {/* AC with breakdown tooltip */}
          <div className="relative col-span-1">
            <div className="flex flex-col items-center py-2.5 px-1 rounded-lg border border-dnd-border bg-dnd-subtle text-center">
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold leading-none text-dnd-text">{acResult.total}</span>
                <button
                  type="button"
                  onClick={() => setAcTooltip((p) => !p)}
                  className="w-4 h-4 rounded-full border border-dnd-muted/40 text-dnd-muted hover:text-dnd-accent hover:border-dnd-accent/40 transition-colors flex items-center justify-center text-[10px] leading-none flex-shrink-0"
                  title="AC breakdown"
                >
                  i
                </button>
              </div>
              <span className="text-[9px] font-semibold text-dnd-muted uppercase tracking-wide mt-1 leading-tight">
                Armour Class
              </span>
            </div>
            {acTooltip && (
              <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-lg border border-dnd-border bg-gray-900 shadow-xl p-3">
                <p className="text-[10px] font-bold text-dnd-muted uppercase tracking-widest mb-2">Breakdown</p>
                {acResult.breakdown.map((line, i) => (
                  <p
                    key={i}
                    className={`text-xs leading-relaxed ${
                      line.startsWith('=') ? 'text-dnd-accent font-bold mt-1' : 'text-dnd-text'
                    }`}
                  >
                    {line}
                  </p>
                ))}
                <button
                  type="button"
                  onClick={() => setAcTooltip(false)}
                  className="mt-2 text-[10px] text-dnd-muted hover:text-dnd-text transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
          <QuickStat label="Speed"         value={`${speed} ft`} />
          <QuickStat label="Passive Perc." value={String(passivePerception)} />
          <QuickStat label="Hit Dice"      value={hitDice} />
        </div>
      </Sheet>

      {/* Inspiration */}
      <InspirationToggle />

      {/* Active Effects */}
      <ActiveEffectsPanel
        characterId={character.id}
        activeEffects={activeEffects}
        setActiveEffects={setActiveEffects}
        character={character}
        characterClasses={characterClasses}
      />

      {/* Level Up button */}
      {character.level < 20 && (
        <button
          type="button"
          onClick={() => setLevelUpOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-amber-500/30 text-amber-400/70 hover:text-amber-300 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-xs font-semibold tracking-wide"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          Level Up
        </button>
      )}

      {/* Delete character */}
      <button
        type="button"
        onClick={() => setDeleteOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-500/20 text-red-500/60 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/5 transition-all text-xs font-semibold tracking-wide"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete Character
      </button>

      {deleteOpen && (
        <DeleteCharacterModal
          name={character.name}
          loading={deleting}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
        />
      )}

      {levelUpOpen && (
        <LevelUpModalWrapper
          character={character}
          characterClasses={characterClasses}
          statScores={statScores}
          hpMax={hp.max}
          allowedSources={allowedSources}
          onClose={() => setLevelUpOpen(false)}
        />
      )}
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

// ── Active Effects Panel ───────────────────────────────────────────────────────

interface EffectPreset {
  key: string
  effect_name: string
  effect_type: string
  value: number
  source: string
  source_name: string
  /** If defined, only show this preset when the character has one of these classes */
  showForClasses?: string[]
  /** If defined, only show when character has one of these subclasses */
  showForSubclasses?: string[]
}

const AC_PRESETS: EffectPreset[] = [
  {
    key: 'mage_armor',
    effect_name: 'Mage Armor',
    effect_type: 'ac_bonus',
    value: 0,
    source: 'spell',
    source_name: 'Mage Armor',
    showForClasses: ['Wizard', 'Sorcerer', 'Warlock'],
  },
  {
    key: 'shield_of_faith',
    effect_name: '+2 Shield of Faith',
    effect_type: 'ac_bonus',
    value: 2,
    source: 'spell',
    source_name: 'Shield of Faith',
    showForClasses: ['Cleric', 'Paladin'],
  },
  {
    key: 'barkskin',
    effect_name: 'Barkskin (min 16)',
    effect_type: 'ac_set_minimum',
    value: 16,
    source: 'spell',
    source_name: 'Barkskin',
    showForClasses: ['Druid', 'Ranger'],
  },
  {
    key: 'bladesong',
    effect_name: 'Bladesong (INT to AC)',
    effect_type: 'ac_bonus',
    value: 0,
    source: 'feature',
    source_name: 'Bladesong',
    showForSubclasses: ['bladesinger', 'bladesong'],
  },
  {
    key: 'medium_armor_master',
    effect_name: 'Medium Armor Master',
    effect_type: 'ac_bonus',
    value: 0,
    source: 'feat',
    source_name: 'Medium Armor Master',
  },
  {
    key: 'haste',
    effect_name: '+2 Haste (AC)',
    effect_type: 'ac_bonus',
    value: 2,
    source: 'spell',
    source_name: 'Haste',
  },
]

function ActiveEffectsPanel({
  characterId, activeEffects, setActiveEffects, character, characterClasses,
}: {
  characterId: string
  activeEffects: CharacterActiveEffect[]
  setActiveEffects: React.Dispatch<React.SetStateAction<CharacterActiveEffect[]>>
  character: CharacterData
  characterClasses: CharacterClass[]
}) {
  const supabase = createClient()
  const [saving,    setSaving]    = useState(false)
  const [expanded,  setExpanded]  = useState(false)

  const allClassNames = [
    character.class,
    ...characterClasses.map((c) => c.class_name),
  ]
  const allSubclasses = characterClasses
    .map((c) => (c.subclass ?? '').toLowerCase())
    .filter(Boolean)

  // Filter presets to show based on class/subclass
  const relevantPresets = AC_PRESETS.filter((p) => {
    if (p.showForClasses && !p.showForClasses.some((cls) => allClassNames.includes(cls))) {
      return false
    }
    if (p.showForSubclasses && !p.showForSubclasses.some((sub) => allSubclasses.some((s) => s.includes(sub)))) {
      return false
    }
    return true
  })

  const isActive = (preset: EffectPreset) =>
    activeEffects.some((e) => e.source_name === preset.source_name)

  const toggleEffect = async (preset: EffectPreset) => {
    setSaving(true)
    const active = isActive(preset)
    if (active) {
      // Remove from DB + state
      const toRemove = activeEffects.filter((e) => e.source_name === preset.source_name)
      await Promise.all(
        toRemove.map((e) => supabase.from('character_active_effects').delete().eq('id', e.id))
      )
      setActiveEffects((prev) => prev.filter((e) => e.source_name !== preset.source_name))
    } else {
      // Insert into DB + state
      const { data, error } = await supabase
        .from('character_active_effects')
        .insert({
          character_id: characterId,
          effect_name: preset.effect_name,
          effect_type: preset.effect_type,
          value: preset.value,
          source: preset.source,
          source_name: preset.source_name,
        })
        .select()
        .single()
      if (!error && data) {
        setActiveEffects((prev) => [
          ...prev,
          data as CharacterActiveEffect,
        ])
      }
    }
    setSaving(false)
  }

  const activeCount = relevantPresets.filter(isActive).length

  return (
    <Sheet>
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-dnd-muted uppercase tracking-widest">
            Active Effects
          </span>
          {activeCount > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-dnd-accent/20 text-dnd-accent font-bold">
              {activeCount}
            </span>
          )}
          {saving && <span className="text-[9px] text-dnd-muted animate-pulse">saving…</span>}
        </div>
        <svg
          className={`w-3 h-3 text-dnd-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-3 space-y-1.5">
          {relevantPresets.map((preset) => {
            const active = isActive(preset)
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => toggleEffect(preset)}
                disabled={saving}
                className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg border text-left transition-all disabled:opacity-40 ${
                  active
                    ? 'border-dnd-accent/50 bg-dnd-accent/10 text-dnd-accent'
                    : 'border-dnd-border bg-dnd-subtle text-dnd-muted hover:text-dnd-text hover:border-dnd-border/80'
                }`}
              >
                <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                  active ? 'bg-dnd-accent border-dnd-accent' : 'border-dnd-muted'
                }`} />
                <span className="text-xs font-medium leading-tight">{preset.effect_name}</span>
              </button>
            )
          })}
          {relevantPresets.length === 0 && (
            <p className="text-xs text-dnd-muted text-center py-1 opacity-60">
              No presets for this class.
            </p>
          )}
        </div>
      )}
    </Sheet>
  )
}

// ── Level Up Modal Wrapper ─────────────────────────────────────────────────────

function LevelUpModalWrapper({
  character, characterClasses, statScores, hpMax, allowedSources, onClose,
}: {
  character: CharacterData
  characterClasses: CharacterClass[]
  statScores: Record<StatKey, number>
  hpMax: number
  allowedSources: string[]
  onClose: () => void
}) {
  const primaryClass = characterClasses.find((c) => c.is_primary)?.class_name ?? character.class
  return (
    <LevelUpModal
      characterId={character.id}
      characterName={character.name}
      primaryClass={primaryClass}
      totalLevel={character.level}
      statScores={statScores}
      hpMax={hpMax}
      allowedSources={allowedSources}
      characterClasses={characterClasses as unknown as { id: string; character_id: string; class_name: string; level: number; is_primary: boolean; subclass: string | null; hit_die: number; class_id: string | null }[]}
      onClose={onClose}
      onLevelUpComplete={() => { onClose(); window.location.reload() }}
    />
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

function RightPanel({ character, statScores, profBonus, spellSlots, classInfo, raceInfo, items, setItems }:
  Pick<CharacterSheetProps, 'character'|'statScores'|'profBonus'|'spellSlots'|'classInfo'|'raceInfo'> & {
    items: CharacterItemWithItem[]
    setItems: React.Dispatch<React.SetStateAction<CharacterItemWithItem[]>>
  }
) {
  const [tab, setTab] = useState<Tab>('actions')
  const characterItems = items
  const setCharacterItems = setItems

  const tabs: { id: Tab; label: string }[] = [
    { id: 'actions',   label: 'Actions'   },
    { id: 'spells',    label: 'Spells'    },
    { id: 'features',  label: 'Features'  },
    { id: 'equipment', label: 'Items'     },
    { id: 'notes',     label: 'Notes'     },
  ]

  return (
    <div className="space-y-0">
      {/* Tab bar */}
      <div className="flex border-b border-dnd-border overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-shrink-0 py-2.5 px-3 text-xs font-bold tracking-wide uppercase whitespace-nowrap transition-colors border-b-2 ${
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
        {tab === 'actions'   && (
          <ActionsTab
            character={character}
            statScores={statScores}
            profBonus={profBonus}
            equippedWeapons={characterItems.filter((ci) => ci.equipped && isWeaponType(ci.magic_items.type))}
          />
        )}
        {tab === 'spells'    && <SpellsTab  spellSlots={spellSlots} character={character} />}
        {tab === 'features'  && <FeaturesTab classInfo={classInfo} raceInfo={raceInfo} character={character} />}
        {tab === 'equipment' && (
          <EquipmentTab
            characterId={character.id}
            items={characterItems}
            setItems={setCharacterItems}
          />
        )}
        {tab === 'notes'     && <NotesTab characterId={character.id} />}
      </div>
    </div>
  )
}

// ── Tab: Actions ───────────────────────────────────────────────────────────────

function ActionsTab({ character, statScores, profBonus, equippedWeapons }: {
  character: CharacterData
  statScores: Record<StatKey, number>
  profBonus: number
  equippedWeapons: CharacterItemWithItem[]
}) {
  const strMod = mod(statScores.STR)
  const dexMod = mod(statScores.DEX)

  // Base unarmed actions
  const baseActions = [
    {
      name: 'Unarmed Strike',
      category: 'Melee',
      toHit: strMod + profBonus,
      dmg: `1 + ${Math.max(0, strMod)} bludgeoning`,
      rarity: null as string | null,
    },
    ...(dexMod > strMod ? [{
      name: 'Finesse Strike',
      category: 'Melee',
      toHit: dexMod + profBonus,
      dmg: `1d6 + ${Math.max(0, dexMod)} piercing`,
      rarity: null as string | null,
    }] : []),
  ]

  // Equipped magic weapons
  const weaponActions = equippedWeapons.map((ci) => {
    const item    = ci.magic_items
    const bonus   = magicBonus(item.name)
    const finesse = isFinesseWeapon(item.name)
    const statMod = finesse ? Math.max(strMod, dexMod) : strMod
    const dmgInfo = weaponDamage(item.name)
    const totalDmgMod = statMod + bonus
    const dmgStr = dmgInfo
      ? `${dmgInfo.die}${totalDmgMod !== 0 ? ` ${totalDmgMod >= 0 ? '+' : ''}${totalDmgMod}` : ''} ${dmgInfo.type}`
      : 'Special'
    return {
      name: item.name,
      category: item.type ?? 'Weapon',
      toHit: statMod + profBonus + bonus,
      dmg: dmgStr,
      rarity: item.rarity,
    }
  })

  const allActions = [...baseActions, ...weaponActions]

  return (
    <div className="space-y-3">
      <Sheet label="Actions">
        <div className="space-y-2">
          {allActions.map((a) => (
            <div
              key={a.name}
              className={`flex items-center gap-3 py-2 px-3 rounded-lg border bg-dnd-subtle ${
                a.rarity ? rarityBorder(a.rarity) : 'border-dnd-border'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-dnd-text truncate">{a.name}</p>
                <p className="text-xs text-dnd-muted">
                  {a.category}
                  {a.rarity && (
                    <span className={`ml-1.5 ${rarityColor(a.rarity)}`}>{a.rarity}</span>
                  )}
                  {' · '}{a.dmg}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-lg font-bold ${modColor(a.toHit)}`}>{modStr(a.toHit)}</p>
                <p className="text-[9px] text-dnd-muted uppercase tracking-wide">to hit</p>
              </div>
            </div>
          ))}
        </div>
      </Sheet>

      <Sheet label="Proficiencies">
        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="text-dnd-muted min-w-[80px]">Armour:</span>
            <span className="text-dnd-text">
              {character.class === 'Barbarian' ? 'Light, Medium, Shields' : 'As class'}
            </span>
          </div>
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

// ── Tab: Equipment ─────────────────────────────────────────────────────────────

const MAX_ATTUNEMENT = 3

function EquipmentTab({ characterId, items, setItems }: {
  characterId: string
  items: CharacterItemWithItem[]
  setItems: React.Dispatch<React.SetStateAction<CharacterItemWithItem[]>>
}) {
  const supabase = createClient()
  const [showBrowser, setShowBrowser] = useState(false)
  const [error, setError] = useState('')

  const attunedCount = items.filter((i) => i.attuned).length

  const toggleEquip = async (id: string, current: boolean) => {
    const { error: err } = await supabase.from('character_items').update({ equipped: !current }).eq('id', id)
    if (err) { setError(err.message); return }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, equipped: !current } : i))
  }

  const toggleAttune = async (id: string, current: boolean) => {
    if (!current && attunedCount >= MAX_ATTUNEMENT) {
      setError(`Maximum ${MAX_ATTUNEMENT} attuned items reached.`)
      return
    }
    setError('')
    const { error: err } = await supabase.from('character_items').update({ attuned: !current }).eq('id', id)
    if (err) { setError(err.message); return }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, attuned: !current } : i))
  }

  const removeItem = async (id: string) => {
    const { error: err } = await supabase.from('character_items').delete().eq('id', id)
    if (err) { setError(err.message); return }
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const handleAdd = async (item: MagicItem) => {
    setError('')
    const { data, error: err } = await supabase
      .from('character_items')
      .insert({ character_id: characterId, item_id: item.id })
      .select('*, magic_items(*)')
      .single()
    if (err) {
      // 23505 = unique violation (already owned)
      setError(err.code === '23505' ? `${item.name} is already in your inventory.` : err.message)
      return
    }
    setItems((prev) => [...prev, data as CharacterItemWithItem])
    setShowBrowser(false)
  }

  return (
    <>
      <div className="space-y-3">
        {/* Attunement bar */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-dnd-muted uppercase tracking-widest">
            Attunement
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: MAX_ATTUNEMENT }).map((_, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  i < attunedCount
                    ? 'border-dnd-accent bg-dnd-accent/20'
                    : 'border-dnd-border'
                }`}
              >
                {i < attunedCount && <span className="text-dnd-accent text-[9px] leading-none">✦</span>}
              </div>
            ))}
            <span className="text-xs text-dnd-muted ml-1 self-center">{attunedCount}/{MAX_ATTUNEMENT}</span>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Item list */}
        {items.length === 0 ? (
          <p className="text-center py-8 text-dnd-muted text-sm">No items yet.</p>
        ) : (
          <div className="space-y-1.5">
            {items.map((ci) => {
              const item = ci.magic_items
              return (
                <div
                  key={ci.id}
                  className={`p-3 rounded-lg border bg-dnd-subtle transition-colors ${
                    rarityBorder(item.rarity)
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dnd-text truncate">{item.name}</p>
                      <p className="text-xs text-dnd-muted">
                        {item.type ?? 'Unknown'}
                        {' · '}
                        <span className={rarityColor(item.rarity)}>{item.rarity ?? 'Unknown'}</span>
                        {item.requires_attunement && (
                          <span className={`ml-1.5 text-xs ${ci.attuned ? 'text-dnd-accent' : 'text-dnd-muted'}`}>✦</span>
                        )}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Equip */}
                      <button
                        type="button"
                        title={ci.equipped ? 'Unequip' : 'Equip'}
                        onClick={() => toggleEquip(ci.id, ci.equipped)}
                        className={`p-1.5 rounded border transition-colors ${
                          ci.equipped
                            ? 'border-dnd-accent bg-dnd-accent/15 text-dnd-accent'
                            : 'border-dnd-border text-dnd-muted hover:border-dnd-accent/40 hover:text-dnd-accent'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill={ci.equipped ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>

                      {/* Attune — only for items that require it */}
                      {item.requires_attunement && (
                        <button
                          type="button"
                          title={ci.attuned ? 'Remove attunement' : 'Attune'}
                          onClick={() => toggleAttune(ci.id, ci.attuned)}
                          className={`p-1.5 rounded border transition-colors ${
                            ci.attuned
                              ? 'border-dnd-accent bg-dnd-accent/15 text-dnd-accent'
                              : 'border-dnd-border text-dnd-muted hover:border-dnd-accent/40 hover:text-dnd-accent'
                          }`}
                        >
                          <span className="text-[11px] leading-none">✦</span>
                        </button>
                      )}

                      {/* Remove */}
                      <button
                        type="button"
                        title="Remove from inventory"
                        onClick={() => removeItem(ci.id)}
                        className="p-1.5 rounded border border-dnd-border text-dnd-muted hover:border-red-500/40 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Status badges */}
                  {(ci.equipped || ci.attuned) && (
                    <div className="flex gap-1.5 mt-2">
                      {ci.equipped && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-dnd-accent/15 text-dnd-accent font-semibold tracking-wide">
                          EQUIPPED
                        </span>
                      )}
                      {ci.attuned && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-dnd-accent/15 text-dnd-accent font-semibold tracking-wide">
                          ATTUNED ✦
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Add item button */}
        <button
          type="button"
          onClick={() => { setError(''); setShowBrowser(true) }}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-dnd-border border-dashed rounded-lg text-sm text-dnd-muted hover:text-dnd-accent hover:border-dnd-accent/40 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Magic Item
        </button>
      </div>

      {/* ── Item browser modal ── */}
      {showBrowser && (
        <>
          {/* Solid dark backdrop — click to dismiss */}
          <div
            className="fixed inset-0 z-50 bg-black/80"
            onClick={() => setShowBrowser(false)}
          />

          {/* Modal panel */}
          <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-10 pb-6 pointer-events-none">
            <div className="w-full max-w-2xl max-h-[82vh] flex flex-col rounded-xl shadow-2xl border border-gray-700 bg-gray-900 pointer-events-auto">

              {/* Header — sticky */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 flex-shrink-0 bg-gray-900 rounded-t-xl">
                <h2 className="text-base font-bold text-white">Add Magic Item</h2>
                <button
                  type="button"
                  onClick={() => setShowBrowser(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1 p-4 dnd-scrollbar">
                <MagicItemBrowser onAdd={handleAdd} />
              </div>
            </div>
          </div>
        </>
      )}
    </>
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
