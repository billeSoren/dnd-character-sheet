'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  ClassName, ClassFeature, HIT_DICE, SUBCLASS_LEVEL,
  getASILevels, getProficiencyBonus, getFeaturesAtLevel,
} from '@/lib/class-progression'
import { checkPrerequisites } from '@/lib/multiclass-prerequisites'

// ── Types ──────────────────────────────────────────────────────────────────────

type StatKey = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'

interface CharacterClassRow {
  id: string
  character_id: string
  class_name: string
  level: number
  is_primary: boolean
  subclass: string | null
  hit_die: number
  class_id: string | null
}

interface Props {
  characterId: string
  characterName: string
  primaryClass: string
  totalLevel: number
  statScores: Record<StatKey, number>
  hpMax: number
  characterClasses: CharacterClassRow[]
  onClose: () => void
  onLevelUpComplete: (newLevel: number, hpGained: number) => void
}

type Step = 'choose_class' | 'hp' | 'features' | 'asi' | 'subclass' | 'summary'

const ALL_CLASS_NAMES: ClassName[] = [
  'Artificer', 'Barbarian', 'Bard', 'Cleric', 'Druid',
  'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue',
  'Sorcerer', 'Warlock', 'Wizard',
]

const STAT_KEYS: StatKey[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']

const STAT_LABELS: Record<StatKey, string> = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma',
}

const SUBCLASS_SUGGESTIONS: Partial<Record<ClassName, string[]>> = {
  Barbarian: ['Path of the Berserker', 'Path of the Totem Warrior', 'Path of the Storm Herald'],
  Bard:      ['College of Lore', 'College of Valor', 'College of Glamour'],
  Cleric:    ['Life Domain', 'Light Domain', 'War Domain', 'Forge Domain', 'Knowledge Domain'],
  Druid:     ['Circle of the Land', 'Circle of the Moon', 'Circle of Stars'],
  Fighter:   ['Champion', 'Battle Master', 'Eldritch Knight', 'Arcane Archer'],
  Monk:      ['Way of the Open Hand', 'Way of Shadow', 'Way of the Four Elements'],
  Paladin:   ['Oath of Devotion', 'Oath of the Ancients', 'Oath of Vengeance', 'Oathbreaker'],
  Ranger:    ['Hunter', 'Beast Master', 'Gloom Stalker'],
  Rogue:     ['Thief', 'Assassin', 'Arcane Trickster', 'Phantom'],
  Sorcerer:  ['Draconic Bloodline', 'Wild Magic', 'Storm Sorcery'],
  Warlock:   ['The Fiend', 'The Archfey', 'The Great Old One', 'The Hexblade'],
  Wizard:    ['Evocation', 'Abjuration', 'Divination', 'Conjuration', 'Bladesinging'],
  Artificer: ['Alchemist', 'Armorer', 'Artillerist', 'Battle Smith'],
}

const STEP_LABELS: Record<Step, string> = {
  choose_class: 'Class',
  hp:           'HP',
  features:     'Features',
  asi:          'ASI',
  subclass:     'Subclass',
  summary:      'Summary',
}

const STEP_ORDER: Step[] = ['choose_class', 'hp', 'features', 'asi', 'subclass', 'summary']

// ── Dice face SVG ──────────────────────────────────────────────────────────────

function DieFace({ value, sides, animating }: { value: number | null; sides: number; animating: boolean }) {
  return (
    <div className={`
      w-24 h-24 mx-auto rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-100
      ${animating
        ? 'border-amber-400 bg-amber-500/20 scale-105 shadow-lg shadow-amber-500/30'
        : value !== null
          ? 'border-amber-500 bg-amber-500/10'
          : 'border-gray-600 bg-gray-800'
      }
    `}>
      <span className="text-xs text-gray-400 uppercase tracking-widest">d{sides}</span>
      <span className={`text-4xl font-bold leading-none ${animating ? 'text-amber-300' : 'text-amber-400'}`}>
        {value ?? '?'}
      </span>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function LevelUpModal({
  characterId,
  characterName,
  primaryClass,
  totalLevel,
  statScores,
  hpMax,
  characterClasses,
  onClose,
  onLevelUpComplete,
}: Props) {

  // ── Class selection state ──────────────────────────────────────────────────
  const [selectedClassName, setSelectedClassName] = useState<string>(() => {
    // Pre-select primary class by default
    return primaryClass
  })
  const [isAddingNewClass, setIsAddingNewClass] = useState(false)
  const [newClassName, setNewClassName] = useState<ClassName | ''>('')

  // ── HP state ──────────────────────────────────────────────────────────────
  const [hpMethod, setHpMethod] = useState<'fixed' | 'rolled'>('fixed')
  const [rolledValue, setRolledValue] = useState<number | null>(null)
  const [diceAnimating, setDiceAnimating] = useState(false)

  // ── ASI state ─────────────────────────────────────────────────────────────
  const [asiChoice, setAsiChoice] = useState<'double' | 'split'>('double')
  const [asiStat1, setAsiStat1] = useState<StatKey>('STR')
  const [asiStat2, setAsiStat2] = useState<StatKey>('DEX')

  // ── Subclass state ────────────────────────────────────────────────────────
  const [subclassChoice,    setSubclassChoice]    = useState('')
  const [dbSubclasses,      setDbSubclasses]      = useState<Array<{
    id: string; name: string; description: string | null; source: string | null
  }>>([])
  const [loadingSubclasses, setLoadingSubclasses] = useState(false)
  const [subclassFetchDone, setSubclassFetchDone] = useState(false)

  // ── Flow state ────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('choose_class')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // ── Subclass DB fetch ──────────────────────────────────────────────────────
  // Reset subclass fetch state when the selected class changes so a new fetch
  // fires if the user goes back and picks a different class.
  const prevClassRef = useRef(selectedClassName)
  useEffect(() => {
    if (prevClassRef.current === selectedClassName) return
    prevClassRef.current = selectedClassName
    setDbSubclasses([])
    setSubclassFetchDone(false)
  }, [selectedClassName])

  // Fetch subclasses from the `subclasses` table when the subclass step
  // becomes active.  Gracefully falls back to empty (and custom input) when
  // the table doesn't exist yet.
  useEffect(() => {
    if (step !== 'subclass' || subclassFetchDone || !selectedClassName) return
    let cancelled = false
    setLoadingSubclasses(true)

    const sb = createClient()
    // The cast silences TS — the `subclasses` table may not exist in the
    // generated types yet.  The fetch will simply return an error which we
    // handle gracefully.
    ;(sb.from as (t: string) => ReturnType<typeof sb.from>)('subclasses')
      .select('id, name, description, source')
      .ilike('class', selectedClassName)
      .order('name')
      .then(({ data, error: fetchErr }: { data: unknown; error: unknown }) => {
        if (cancelled) return
        if (!fetchErr && Array.isArray(data) && data.length > 0) {
          setDbSubclasses(
            data as Array<{ id: string; name: string; description: string | null; source: string | null }>
          )
        }
        setLoadingSubclasses(false)
        setSubclassFetchDone(true)
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedClassName, subclassFetchDone])

  // ── Derived computations ──────────────────────────────────────────────────

  // Which class row are we leveling up?
  const classRowToLevel: CharacterClassRow | null = (() => {
    if (isAddingNewClass) return null
    if (characterClasses.length === 0) return null
    return characterClasses.find((r) => r.class_name === selectedClassName) ?? null
  })()

  // Next level for chosen class
  const nextClassLevel: number = (classRowToLevel?.level ?? (
    characterClasses.length === 0 ? totalLevel : 0
  )) + 1

  // New total character level
  const newTotalLevel: number = totalLevel + 1

  // Hit die for chosen class
  const hitDie: number = HIT_DICE[selectedClassName as ClassName] ?? 8

  // CON modifier
  const conMod: number = Math.floor((statScores.CON - 10) / 2)

  // Fixed HP: floor(hitDie/2)+1 + conMod, minimum 1
  const fixedHP: number = Math.max(1, Math.floor(hitDie / 2) + 1 + conMod)

  // Is this an ASI level?
  const isASILevel: boolean = selectedClassName
    ? getASILevels(selectedClassName as ClassName).includes(nextClassLevel)
    : false

  // Is this a subclass level?
  const subclassLvl = selectedClassName ? (SUBCLASS_LEVEL[selectedClassName as ClassName] ?? 3) : 3
  const isSubclassLevel: boolean = nextClassLevel === subclassLvl
  const alreadyHasSubclass: boolean = (classRowToLevel?.subclass ?? '') !== ''

  // Features at this level
  const newFeatures: ClassFeature[] = selectedClassName
    ? getFeaturesAtLevel(selectedClassName as ClassName, nextClassLevel)
    : []

  // Proficiency bonus
  const oldPB: number = getProficiencyBonus(totalLevel)
  const newPB: number = getProficiencyBonus(newTotalLevel)

  // HP gained
  const hpGained: number = Math.max(1, hpMethod === 'fixed' ? fixedHP : (rolledValue ?? fixedHP))

  // ── Step navigation ────────────────────────────────────────────────────────

  function getNextStep(current: Step): Step {
    if (current === 'choose_class') return 'hp'
    if (current === 'hp') return 'features'
    if (current === 'features') {
      if (isASILevel) return 'asi'
      if (isSubclassLevel && !alreadyHasSubclass) return 'subclass'
      return 'summary'
    }
    if (current === 'asi') {
      if (isSubclassLevel && !alreadyHasSubclass) return 'subclass'
      return 'summary'
    }
    if (current === 'subclass') return 'summary'
    return 'summary'
  }

  function getPrevStep(current: Step): Step {
    if (current === 'hp') return 'choose_class'
    if (current === 'features') return 'hp'
    if (current === 'asi') return 'features'
    if (current === 'subclass') return isASILevel ? 'asi' : 'features'
    if (current === 'summary') {
      if (isSubclassLevel && !alreadyHasSubclass) return 'subclass'
      if (isASILevel) return 'asi'
      return 'features'
    }
    return 'choose_class'
  }

  // Which steps are visible in the indicator?
  const visibleSteps = STEP_ORDER.filter((s) => {
    if (s === 'asi') return isASILevel
    if (s === 'subclass') return isSubclassLevel && !alreadyHasSubclass
    return true
  })

  // ── Dice roll animation ────────────────────────────────────────────────────

  const rollDie = () => {
    if (diceAnimating) return
    setDiceAnimating(true)
    setRolledValue(null)
    let count = 0
    const total = Math.ceil(1000 / 80)
    const interval = setInterval(() => {
      setRolledValue(Math.floor(Math.random() * hitDie) + 1)
      count++
      if (count >= total) {
        clearInterval(interval)
        const finalRoll = Math.floor(Math.random() * hitDie) + 1
        setRolledValue(finalRoll)
        setDiceAnimating(false)
      }
    }, 80)
  }

  // ── Confirm handler ────────────────────────────────────────────────────────

  const handleConfirm = async () => {
    setSaving(true)
    setError('')
    try {
      const supabase = createClient()

      // 1. Increment total level on characters table
      await supabase.from('characters').update({ level: newTotalLevel }).eq('id', characterId)

      // 2. Increment HP
      await supabase.from('character_hp')
        .update({ max_hp: hpMax + hpGained, current_hp: hpMax + hpGained })
        .eq('character_id', characterId)

      // 3. Update character_classes if it exists
      if (classRowToLevel) {
        await supabase.from('character_classes')
          .update({
            level: nextClassLevel,
            ...(subclassChoice ? { subclass: subclassChoice } : {}),
          })
          .eq('id', classRowToLevel.id)
      } else if (isAddingNewClass && newClassName) {
        // Insert new class row
        await supabase.from('character_classes').insert({
          character_id: characterId,
          class_name: newClassName,
          level: 1,
          is_primary: false,
          hit_die: HIT_DICE[newClassName as ClassName] ?? 8,
        })
      }

      // 4. Apply ASI if chosen
      if (isASILevel) {
        // Build a typed stat update — Supabase schema uses lowercase column names
        const statColumnMap: Record<StatKey, string> = {
          STR: 'strength', DEX: 'dexterity', CON: 'constitution',
          INT: 'intelligence', WIS: 'wisdom', CHA: 'charisma',
        }
        if (asiChoice === 'double') {
          const col = statColumnMap[asiStat1]
          const patch = { [col]: Math.min(20, statScores[asiStat1] + 2) } as Record<string, number>
          await supabase.from('character_stats')
            // @ts-expect-error dynamic column name not in generated types
            .update(patch)
            .eq('character_id', characterId)
        } else {
          const col1 = statColumnMap[asiStat1]
          const col2 = statColumnMap[asiStat2]
          const payload: Record<string, number> = {
            [col1]: Math.min(20, statScores[asiStat1] + 1),
            [col2]: Math.min(20, statScores[asiStat2] + 1),
          }
          // @ts-expect-error dynamic column name not in generated types
          await supabase.from('character_stats').update(payload).eq('character_id', characterId)
        }
      }

      // 5. Insert level history
      await supabase.from('character_level_history').insert({
        character_id: characterId,
        total_level: newTotalLevel,
        class_name: isAddingNewClass ? (newClassName ?? selectedClassName) : selectedClassName,
        hp_gained: hpGained,
        choices: {
          ...(isASILevel
            ? { asi: asiChoice === 'double' ? { [asiStat1]: 2 } : { [asiStat1]: 1, [asiStat2]: 1 } }
            : {}),
          ...(subclassChoice ? { subclass: subclassChoice } : {}),
        },
      })

      onLevelUpComplete(newTotalLevel, hpGained)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setSaving(false)
    }
  }

  // ── Handle class selection ─────────────────────────────────────────────────

  const handleSelectExistingClass = (className: string) => {
    setSelectedClassName(className)
    setIsAddingNewClass(false)
    setNewClassName('')
  }

  const handleSelectNewClass = (cn: ClassName) => {
    setNewClassName(cn)
    setSelectedClassName(cn)
    setIsAddingNewClass(true)
  }

  // ── Backdrop click ─────────────────────────────────────────────────────────

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-lg w-full mx-4 overflow-y-auto max-h-[90vh] flex flex-col shadow-2xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-amber-400 tracking-wide">Level Up</h2>
            <p className="text-xs text-gray-400 mt-0.5">{characterName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Step indicator ── */}
        <div className="flex items-center justify-center gap-1.5 px-5 py-3 border-b border-gray-700/50 flex-shrink-0">
          {visibleSteps.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`
                flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border transition-all
                ${s === step
                  ? 'bg-amber-500 border-amber-500 text-gray-900'
                  : STEP_ORDER.indexOf(s) < STEP_ORDER.indexOf(step)
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                    : 'bg-gray-800 border-gray-600 text-gray-500'
                }
              `}>
                {i + 1}
              </div>
              <span className={`text-[10px] uppercase tracking-wider hidden sm:block ${
                s === step ? 'text-amber-400' : 'text-gray-500'
              }`}>
                {STEP_LABELS[s]}
              </span>
              {i < visibleSteps.length - 1 && (
                <div className="w-4 h-px bg-gray-700 mx-0.5" />
              )}
            </div>
          ))}
        </div>

        {/* ── Step content ── */}
        <div className="flex-1 px-5 py-5 min-h-0">

          {/* ── STEP: choose_class ── */}
          {step === 'choose_class' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Choose a Class to Level Up</h3>

              {/* Existing classes */}
              {characterClasses.length === 0 ? (
                // Migration not run — fallback to primary class
                <button
                  onClick={() => handleSelectExistingClass(primaryClass)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                    selectedClassName === primaryClass && !isAddingNewClass
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-amber-500/50 hover:text-amber-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{primaryClass}</span>
                    <span className="text-xs text-gray-500">
                      Level {totalLevel} → {totalLevel + 1}
                    </span>
                  </div>
                  {selectedClassName === primaryClass && !isAddingNewClass && (
                    <span className="text-amber-400 text-sm">✓</span>
                  )}
                </button>
              ) : (
                <div className="space-y-2">
                  {characterClasses.map((row) => (
                    <button
                      key={row.id}
                      onClick={() => handleSelectExistingClass(row.class_name)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                        selectedClassName === row.class_name && !isAddingNewClass
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-amber-500/50 hover:text-amber-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{row.class_name}</span>
                        {row.subclass && (
                          <span className="text-xs text-amber-600">{row.subclass}</span>
                        )}
                        <span className="text-xs text-gray-500">
                          Level {row.level} → {row.level + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {row.is_primary && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-semibold tracking-wide">
                            PRIMARY
                          </span>
                        )}
                        {selectedClassName === row.class_name && !isAddingNewClass && (
                          <span className="text-amber-400 text-sm">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Multiclass section */}
              <div className="border-t border-gray-700 pt-4">
                <button
                  onClick={() => setIsAddingNewClass((p) => !p)}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-sm font-semibold ${
                    isAddingNewClass
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                      : 'border-gray-600 border-dashed text-gray-400 hover:border-amber-500/40 hover:text-amber-400'
                  }`}
                >
                  <span className="text-lg leading-none">+</span>
                  Add New Class (Multiclass)
                </button>

                {isAddingNewClass && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-500">
                      Select a class. Prerequisites are shown below.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ALL_CLASS_NAMES.map((cn) => {
                        // Skip classes already owned
                        const alreadyOwns = characterClasses.some((r) => r.class_name === cn)
                        const prereqResult = checkPrerequisites(cn, statScores)
                        const isSelected = newClassName === cn

                        return (
                          <button
                            key={cn}
                            onClick={() => handleSelectNewClass(cn)}
                            disabled={alreadyOwns}
                            title={
                              alreadyOwns
                                ? 'Already in this class'
                                : !prereqResult.met
                                  ? prereqResult.requirements
                                      .filter((r) => !r.met)
                                      .map((r) => `${r.stat} ${r.minimum} required (have ${r.actual})`)
                                      .join(', ')
                                  : undefined
                            }
                            className={`
                              relative flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg border text-xs font-semibold transition-all
                              ${alreadyOwns
                                ? 'opacity-30 cursor-not-allowed border-gray-700 text-gray-500'
                                : isSelected
                                  ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                  : prereqResult.met
                                    ? 'border-gray-600 bg-gray-800 text-gray-300 hover:border-green-500/50 hover:text-green-400'
                                    : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-red-500/40'
                              }
                            `}
                          >
                            <span>{cn}</span>
                            {!alreadyOwns && (
                              <span className={`text-[10px] ${prereqResult.met ? 'text-green-500' : 'text-red-400'}`}>
                                {prereqResult.met ? 'Prereqs met' : 'Prereqs unmet'}
                              </span>
                            )}
                            {isSelected && (
                              <span className="absolute top-1 right-1 text-amber-400 text-[10px] leading-none">✓</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                    {newClassName && !checkPrerequisites(newClassName, statScores).met && (
                      <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs">
                        Warning: your stats do not meet multiclassing prerequisites for {newClassName}.
                        You can still proceed, but check with your DM.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP: hp ── */}
          {step === 'hp' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Choose HP Gain Method</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedClassName} · d{hitDie} · CON {conMod >= 0 ? `+${conMod}` : conMod}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {/* Fixed card */}
                <button
                  onClick={() => { setHpMethod('fixed'); setRolledValue(null) }}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl border transition-all text-left ${
                    hpMethod === 'fixed'
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-gray-600 bg-gray-800 hover:border-amber-500/40'
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl border border-gray-600 flex flex-col items-center justify-center bg-gray-700 flex-shrink-0">
                    <span className="text-[10px] text-gray-400">d{hitDie}</span>
                    <span className="text-xl font-bold text-amber-400">{Math.floor(hitDie / 2) + 1}</span>
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Fixed (Average)</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      d{hitDie}: {Math.floor(hitDie / 2) + 1}
                      {conMod !== 0 && ` ${conMod >= 0 ? '+' : ''}${conMod} CON`}
                      {' '}= <span className="text-amber-400 font-bold">+{fixedHP} HP</span>
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">Guaranteed, predictable gain</p>
                  </div>
                  {hpMethod === 'fixed' && (
                    <span className="ml-auto text-amber-400 text-xl flex-shrink-0">✓</span>
                  )}
                </button>

                {/* Roll card */}
                <div
                  className={`flex flex-col gap-3 px-4 py-4 rounded-xl border transition-all ${
                    hpMethod === 'rolled'
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-gray-600 bg-gray-800'
                  }`}
                >
                  <button
                    onClick={() => setHpMethod('rolled')}
                    className="flex items-center gap-4 text-left w-full"
                  >
                    <div className="w-14 h-14 rounded-xl border border-gray-600 flex flex-col items-center justify-center bg-gray-700 flex-shrink-0">
                      <span className="text-[10px] text-gray-400">d{hitDie}</span>
                      <span className="text-xl font-bold text-amber-400">{rolledValue ?? '?'}</span>
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">Roll the Die</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {rolledValue !== null
                          ? <>Roll: {rolledValue}{conMod !== 0 && ` ${conMod >= 0 ? '+' : ''}${conMod} CON`} = <span className="text-amber-400 font-bold">+{Math.max(1, rolledValue + conMod)} HP</span></>
                          : 'Click the die to roll'
                        }
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">Risk it for a bigger reward</p>
                    </div>
                    {hpMethod === 'rolled' && rolledValue !== null && (
                      <span className="ml-auto text-amber-400 text-xl flex-shrink-0">✓</span>
                    )}
                  </button>

                  {hpMethod === 'rolled' && (
                    <div className="flex flex-col items-center gap-3 pt-1 border-t border-gray-700">
                      <DieFace value={rolledValue} sides={hitDie} animating={diceAnimating} />
                      <button
                        onClick={rollDie}
                        disabled={diceAnimating}
                        className="px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-bold rounded-lg transition-colors text-sm"
                      >
                        {diceAnimating ? 'Rolling…' : rolledValue !== null ? 'Re-roll' : 'Roll d' + hitDie}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-center">
                <span className="text-xs text-gray-400">
                  HP gained:{' '}
                  <span className="text-green-400 font-bold text-base">
                    +{hpGained}
                  </span>
                  <span className="text-gray-500"> (new max: {hpMax + hpGained})</span>
                </span>
              </div>
            </div>
          )}

          {/* ── STEP: features ── */}
          {step === 'features' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">New Features</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedClassName} Level {nextClassLevel}
                </p>
              </div>

              {newFeatures.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <span className="text-4xl mb-3">—</span>
                  <p className="text-gray-400 font-medium">No new features at this level.</p>
                  <p className="text-xs text-gray-600 mt-1">Continue to the next step.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {newFeatures.map((feature, i) => (
                    <div key={i} className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl">
                      <p className="font-bold text-amber-400 text-sm mb-1">{feature.name}</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STEP: asi ── */}
          {step === 'asi' && isASILevel && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Ability Score Improvement</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Choose how to spend your ASI at {selectedClassName} Level {nextClassLevel}
                </p>
              </div>

              {/* Choice selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAsiChoice('double')}
                  className={`px-3 py-3 rounded-xl border transition-all text-sm font-semibold ${
                    asiChoice === 'double'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-amber-500/40'
                  }`}
                >
                  <p className="text-lg font-bold">+2</p>
                  <p className="text-xs mt-0.5 font-normal text-gray-400">One ability</p>
                </button>
                <button
                  onClick={() => setAsiChoice('split')}
                  className={`px-3 py-3 rounded-xl border transition-all text-sm font-semibold ${
                    asiChoice === 'split'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-amber-500/40'
                  }`}
                >
                  <p className="text-lg font-bold">+1 / +1</p>
                  <p className="text-xs mt-0.5 font-normal text-gray-400">Two abilities</p>
                </button>
              </div>

              {/* +2 one stat */}
              {asiChoice === 'double' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Choose stat (+2)</p>
                  <div className="grid grid-cols-3 gap-2">
                    {STAT_KEYS.map((stat) => {
                      const current = statScores[stat]
                      const newVal = Math.min(20, current + 2)
                      const capped = current >= 20
                      return (
                        <button
                          key={stat}
                          onClick={() => !capped && setAsiStat1(stat)}
                          disabled={capped}
                          className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all ${
                            capped
                              ? 'opacity-40 cursor-not-allowed border-gray-700 bg-gray-800/50'
                              : asiStat1 === stat
                                ? 'border-amber-500 bg-amber-500/10'
                                : 'border-gray-600 bg-gray-800 hover:border-amber-500/40'
                          }`}
                        >
                          <span className={`text-xs font-bold uppercase ${asiStat1 === stat ? 'text-amber-400' : 'text-gray-400'}`}>
                            {stat}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {current}
                            {!capped && <span className="text-green-400"> → {newVal}</span>}
                            {capped && <span className="text-gray-600"> max</span>}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-center text-xs text-gray-400">
                    {STAT_LABELS[asiStat1]}:{' '}
                    <span className="text-white font-bold">{statScores[asiStat1]}</span>
                    {' '}<span className="text-gray-500">→</span>{' '}
                    <span className="text-green-400 font-bold">{Math.min(20, statScores[asiStat1] + 2)}</span>
                  </div>
                </div>
              )}

              {/* +1/+1 two stats */}
              {asiChoice === 'split' && (
                <div className="space-y-3">
                  <div className="space-y-3">
                    {([1, 2] as const).map((slot) => {
                      const currentStat = slot === 1 ? asiStat1 : asiStat2
                      const otherStat = slot === 1 ? asiStat2 : asiStat1
                      const setStat = slot === 1 ? setAsiStat1 : setAsiStat2

                      return (
                        <div key={slot}>
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
                            Stat {slot} (+1)
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {STAT_KEYS.map((stat) => {
                              const current = statScores[stat]
                              const capped = current >= 20
                              const isOther = stat === otherStat
                              return (
                                <button
                                  key={stat}
                                  onClick={() => !capped && setStat(stat)}
                                  disabled={capped}
                                  className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border transition-all ${
                                    capped
                                      ? 'opacity-40 cursor-not-allowed border-gray-700 bg-gray-800/50'
                                      : currentStat === stat
                                        ? 'border-amber-500 bg-amber-500/10'
                                        : isOther
                                          ? 'border-blue-500/40 bg-blue-500/5'
                                          : 'border-gray-600 bg-gray-800 hover:border-amber-500/40'
                                  }`}
                                >
                                  <span className={`text-xs font-bold uppercase ${
                                    currentStat === stat ? 'text-amber-400' : isOther ? 'text-blue-400' : 'text-gray-400'
                                  }`}>
                                    {stat}
                                  </span>
                                  <span className="text-gray-500 text-xs">
                                    {current}
                                    {!capped && <span className="text-green-400"> → {Math.min(20, current + 1)}</span>}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {asiStat1 === asiStat2 && (
                    <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs">
                      Both stats are the same — the +1 and +1 will apply to the same stat (+2 total).
                    </div>
                  )}
                  <div className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-400 space-y-0.5">
                    <div>{STAT_LABELS[asiStat1]}: <span className="text-white font-bold">{statScores[asiStat1]}</span> → <span className="text-green-400 font-bold">{Math.min(20, statScores[asiStat1] + 1)}</span></div>
                    {asiStat1 !== asiStat2 && (
                      <div>{STAT_LABELS[asiStat2]}: <span className="text-white font-bold">{statScores[asiStat2]}</span> → <span className="text-green-400 font-bold">{Math.min(20, statScores[asiStat2] + 1)}</span></div>
                    )}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-gray-600 text-center italic">
                Feat system coming soon
              </p>
            </div>
          )}

          {/* ── STEP: subclass ── */}
          {step === 'subclass' && isSubclassLevel && !alreadyHasSubclass && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Choose Your Subclass</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedClassName} Level {nextClassLevel} — Subclass feature unlocked
                </p>
              </div>

              {/* ── DB subclass cards (loading / results / empty) ── */}
              {loadingSubclasses ? (
                /* Loading skeleton */
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-16 rounded-xl border border-gray-700 bg-gray-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : dbSubclasses.length > 0 ? (
                /* Subclass cards from DB */
                <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                  {dbSubclasses.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSubclassChoice(sub.name)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        subclassChoice === sub.name
                          ? 'border-amber-500 bg-amber-500/10 shadow-sm shadow-amber-500/20'
                          : 'border-gray-700 bg-gray-800 hover:border-amber-500/40 hover:bg-gray-750'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-semibold text-sm leading-tight ${
                          subclassChoice === sub.name ? 'text-amber-400' : 'text-white'
                        }`}>
                          {sub.name}
                        </span>
                        {sub.source && (
                          <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400 font-medium tracking-wide">
                            {sub.source}
                          </span>
                        )}
                      </div>
                      {sub.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                          {sub.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              ) : subclassFetchDone ? (
                /* Table missing or no results */
                <p className="text-xs text-gray-500 py-1">
                  No subclasses found in database — enter a name below.
                </p>
              ) : null}

              {/* Custom / fallback text input */}
              <div>
                <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
                  {dbSubclasses.length > 0 ? 'Or type a custom subclass name' : 'Subclass Name'}
                </label>
                <input
                  type="text"
                  value={subclassChoice}
                  onChange={(e) => setSubclassChoice(e.target.value)}
                  placeholder={`e.g. ${(SUBCLASS_SUGGESTIONS[selectedClassName as ClassName] ?? ['Champion'])[0]}`}
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder:text-gray-600 outline-none focus:border-amber-500 transition-colors text-sm"
                />
              </div>

              {subclassChoice && (
                <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs">
                  Selected: <span className="font-bold">{subclassChoice}</span>
                </div>
              )}
            </div>
          )}

          {/* ── STEP: summary ── */}
          {step === 'summary' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Level Up Summary</h3>

              <div className="space-y-2">
                {/* Level */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl">
                  <span className="text-lg text-amber-400">⬆</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Level</p>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {totalLevel} <span className="text-gray-500">→</span> <span className="text-amber-400">{newTotalLevel}</span>
                      {newPB > oldPB && (
                        <span className="ml-2 text-xs text-green-400 font-normal">
                          (Proficiency Bonus: +{oldPB} → +{newPB})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isAddingNewClass ? `New class: ${selectedClassName}` : `${selectedClassName} Level ${nextClassLevel}`}
                    </p>
                  </div>
                </div>

                {/* HP */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl">
                  <span className="text-lg text-green-400">♥</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Hit Points</p>
                    <p className="text-sm font-bold text-white mt-0.5">
                      <span className="text-green-400">+{hpGained} HP</span>
                      <span className="text-gray-500 text-xs font-normal ml-2">
                        (new max: {hpMax} → {hpMax + hpGained})
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {hpMethod === 'fixed' ? 'Fixed average' : `Rolled ${rolledValue}`}
                    </p>
                  </div>
                </div>

                {/* Features */}
                {newFeatures.length > 0 && (
                  <div className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Features Gained</p>
                    <div className="space-y-1">
                      {newFeatures.map((f, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-amber-400 text-xs mt-0.5 flex-shrink-0">✦</span>
                          <div>
                            <span className="text-sm font-semibold text-amber-400">{f.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ASI */}
                {isASILevel && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl">
                    <span className="text-lg text-blue-400">★</span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Ability Score Improvement</p>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {asiChoice === 'double'
                          ? <><span className="text-blue-400">{STAT_LABELS[asiStat1]}</span> +2 ({statScores[asiStat1]} → {Math.min(20, statScores[asiStat1] + 2)})</>
                          : <>
                              <span className="text-blue-400">{STAT_LABELS[asiStat1]}</span> +1,{' '}
                              <span className="text-blue-400">{STAT_LABELS[asiStat2]}</span> +1
                            </>
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Subclass */}
                {subclassChoice && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl">
                    <span className="text-lg text-purple-400">⚔</span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Subclass</p>
                      <p className="text-sm font-bold text-purple-300 mt-0.5">{subclassChoice}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm button */}
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-bold rounded-xl text-sm tracking-wide transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>Confirm Level Up ⬆</>
                )}
              </button>

              {error && (
                <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer navigation ── */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-700 flex-shrink-0">
          {/* Back button */}
          {step !== 'choose_class' ? (
            <button
              onClick={() => setStep(getPrevStep(step))}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 transition-colors text-sm font-semibold disabled:opacity-30"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
          )}

          {/* Next button (hidden on summary — uses confirm button instead) */}
          {step !== 'summary' && (
            <button
              onClick={() => {
                if (step === 'choose_class') {
                  // Validate selection
                  if (isAddingNewClass && !newClassName) {
                    setError('Please select a class to multiclass into.')
                    return
                  }
                  if (!selectedClassName) {
                    setError('Please select a class.')
                    return
                  }
                }
                if (step === 'hp' && hpMethod === 'rolled' && rolledValue === null) {
                  setError('Please roll the die first, or switch to fixed HP.')
                  return
                }
                setError('')
                setStep(getNextStep(step))
              }}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-900 font-bold text-sm transition-colors"
            >
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {step === 'summary' && <div />}
        </div>

        {/* Footer error (outside summary step) */}
        {error && step !== 'summary' && (
          <div className="px-5 pb-4 flex-shrink-0">
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
