'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { classes, races, backgrounds } from '@/lib/dnd-data'
import {
  CharacterFormData, DEFAULT_FORM_DATA, StatKey,
  modifier, calculateMaxHP, totalPBSpent, PB_BUDGET, STANDARD_ARRAY,
} from '@/components/character-builder/types'
import StepClass from '@/components/character-builder/StepClass'
import StepBackground from '@/components/character-builder/StepBackground'
import StepSpecies from '@/components/character-builder/StepSpecies'
import StepAbilities from '@/components/character-builder/StepAbilities'
import StepFinish from '@/components/character-builder/StepFinish'
import ThemeToggle from '@/components/ThemeToggle'

// ── Step metadata ─────────────────────────────────────────────────────────────

const TABS = ['CLASS', 'BACKGROUND', 'SPECIES', 'ABILITIES', 'EQUIPMENT'] as const
const TOTAL_STEPS = TABS.length

// ── Validation ────────────────────────────────────────────────────────────────

function validateStep(step: number, data: CharacterFormData): string | null {
  switch (step) {
    case 1: return data.className ? null : 'Select a class to continue.'
    case 2: return data.background ? null : 'Select a background to continue.'
    case 3: return data.race ? null : 'Select a species to continue.'
    case 4: {
      if (data.abilityMethod === 'standard') {
        const allAssigned = STANDARD_ARRAY.length === 6 &&
          Object.values(data.standardArrayAssignments).every((v) => v !== null)
        return allAssigned ? null : 'Assign all 6 standard array values to continue.'
      }
      if (data.abilityMethod === 'pointbuy') {
        return totalPBSpent(data.baseStats) <= PB_BUDGET ? null : 'Reduce your ability scores to fit the budget.'
      }
      return null
    }
    default: return null
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function NewCharacterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<CharacterFormData>(DEFAULT_FORM_DATA)
  const [stepError, setStepError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else setAuthChecked(true)
    })
  }, [router, supabase])

  const updateForm = (partial: Partial<CharacterFormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }))
    setStepError('')
  }

  const goNext = () => {
    const err = validateStep(step, formData)
    if (err) { setStepError(err); return }
    setStepError('')
    setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  }

  const goBack = () => {
    setStepError('')
    setStep((s) => Math.max(1, s - 1))
  }

  const jumpTo = (target: number) => {
    if (target < step) { setStepError(''); setStep(target) }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) { setSaveError('Enter a name for your character.'); return }

    setSaving(true)
    setSaveError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const selectedClass = classes.find((c) => c.name === formData.className)
    const selectedRace  = races.find((r) => r.name === formData.race)
    const selectedBg    = backgrounds.find((b) => b.name === formData.background)

    const racialBonus = (stat: StatKey) =>
      selectedRace?.abilityBonuses.find((b) => b.ability === stat)?.bonus ?? 0

    const finalStats = {
      STR: formData.baseStats.STR + racialBonus('STR'),
      DEX: formData.baseStats.DEX + racialBonus('DEX'),
      CON: formData.baseStats.CON + racialBonus('CON'),
      INT: formData.baseStats.INT + racialBonus('INT'),
      WIS: formData.baseStats.WIS + racialBonus('WIS'),
      CHA: formData.baseStats.CHA + racialBonus('CHA'),
    }

    const hitDie  = selectedClass?.hitDie ?? 8
    const conMod  = modifier(finalStats.CON)
    const maxHP   = calculateMaxHP(hitDie, conMod, formData.level)
    const allSkills = [
      ...(selectedBg?.skillProficiencies ?? []),
      ...formData.selectedSkills,
    ]

    const { data: char, error: charErr } = await supabase
      .from('characters')
      .insert({
        user_id: user.id,
        name: formData.name.trim(),
        race: formData.race,
        class: formData.className,
        level: formData.level,
        background: formData.background,
        skill_proficiencies: allSkills,
      })
      .select()
      .single()

    if (charErr || !char) { setSaveError(charErr?.message ?? 'Error creating character.'); setSaving(false); return }

    const { error: statsErr } = await supabase.from('character_stats').insert({
      character_id: char.id,
      strength: finalStats.STR, dexterity: finalStats.DEX, constitution: finalStats.CON,
      intelligence: finalStats.INT, wisdom: finalStats.WIS, charisma: finalStats.CHA,
    })
    if (statsErr) { setSaveError(statsErr.message); setSaving(false); return }

    const { error: hpErr } = await supabase.from('character_hp').insert({
      character_id: char.id, max_hp: maxHP, current_hp: maxHP, temp_hp: 0,
    })
    if (hpErr) { setSaveError(hpErr.message); setSaving(false); return }

    router.push('/')
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-dnd-bg flex items-center justify-center">
        <div className="text-dnd-muted text-sm animate-pulse">Loading…</div>
      </div>
    )
  }

  const stepLabel = formData.className || formData.background || formData.race
    ? [formData.className, formData.background, formData.race].filter(Boolean).join(' · ')
    : 'New Character'

  return (
    <div className="min-h-screen bg-dnd-bg relative">

      {/* ── Decorative side panels (lg+) ──────────────────────────────────── */}
      <div
        className="hidden lg:block fixed left-0 top-0 bottom-0 pointer-events-none"
        style={{ width: 'calc(50% - 380px)' }}
      >
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, var(--dnd-bg) 0%, color-mix(in srgb, var(--dnd-bg) 85%, var(--dnd-accent)) 50%, var(--dnd-bg) 100%)',
        }} />
        <div className="absolute right-0 top-0 bottom-0 w-px opacity-30"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--dnd-accent), transparent)' }} />
        <div className="absolute inset-0 flex items-center justify-center opacity-5 text-9xl select-none">
          ⚔️
        </div>
      </div>
      <div
        className="hidden lg:block fixed right-0 top-0 bottom-0 pointer-events-none"
        style={{ width: 'calc(50% - 380px)' }}
      >
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(225deg, var(--dnd-bg) 0%, color-mix(in srgb, var(--dnd-bg) 85%, var(--dnd-accent)) 50%, var(--dnd-bg) 100%)',
        }} />
        <div className="absolute left-0 top-0 bottom-0 w-px opacity-30"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--dnd-accent), transparent)' }} />
        <div className="absolute inset-0 flex items-center justify-center opacity-5 text-9xl select-none">
          🐉
        </div>
      </div>

      {/* ── Center column ─────────────────────────────────────────────────── */}
      <div
        className="relative mx-auto min-h-screen flex flex-col shadow-2xl"
        style={{ maxWidth: '760px', background: 'var(--dnd-card)' }}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-3.5 border-b border-dnd-border flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 text-dnd-muted hover:text-dnd-accent transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </Link>
          <span className="text-dnd-muted text-xs truncate max-w-[200px]">{stepLabel}</span>
          <ThemeToggle />
        </header>

        {/* Tab navigation */}
        <nav className="flex border-b border-dnd-border flex-shrink-0 overflow-x-auto">
          {TABS.map((tab, i) => {
            const tabStep = i + 1
            const isActive    = step === tabStep
            const isCompleted = step > tabStep
            const isClickable = isCompleted

            return (
              <button
                key={tab}
                onClick={() => isClickable && jumpTo(tabStep)}
                disabled={!isClickable && !isActive}
                className={`flex-1 min-w-[80px] flex flex-col items-center gap-1 py-3 px-2 text-xs font-bold tracking-widest uppercase transition-colors border-b-2 ${
                  isActive
                    ? 'border-b-dnd-accent text-dnd-accent'
                    : isCompleted
                    ? 'border-b-transparent text-green-500 hover:text-dnd-accent cursor-pointer'
                    : 'border-b-transparent text-dnd-muted cursor-default'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-dnd-accent text-white'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-dnd-border text-dnd-muted'
                }`}>
                  {isCompleted ? '✓' : tabStep}
                </span>
                <span className="hidden sm:block">{tab}</span>
              </button>
            )
          })}
        </nav>

        {/* Step content */}
        <div className="flex-1 px-5 py-6 overflow-y-auto dnd-scrollbar">
          {step === 1 && <StepClass       data={formData} onChange={updateForm} />}
          {step === 2 && <StepBackground  data={formData} onChange={updateForm} />}
          {step === 3 && <StepSpecies     data={formData} onChange={updateForm} />}
          {step === 4 && <StepAbilities   data={formData} onChange={updateForm} />}
          {step === 5 && (
            <StepFinish
              data={formData}
              onChange={updateForm}
              onSave={handleSave}
              saving={saving}
              error={saveError}
            />
          )}

          {stepError && (
            <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {stepError}
            </div>
          )}
        </div>

        {/* Footer navigation */}
        {step < TOTAL_STEPS && (
          <footer className="flex items-center justify-between px-5 py-4 border-t border-dnd-border flex-shrink-0">
            <button
              onClick={goBack}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2 border border-dnd-border text-dnd-muted hover:text-dnd-text hover:border-dnd-text disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <span className="text-dnd-muted text-xs">{step} / {TOTAL_STEPS}</span>
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-5 py-2 bg-dnd-accent hover:opacity-90 text-white font-semibold rounded-lg text-sm transition-opacity"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </footer>
        )}
        {step === TOTAL_STEPS && (
          <footer className="flex items-center px-5 py-4 border-t border-dnd-border flex-shrink-0">
            <button
              onClick={goBack}
              className="flex items-center gap-2 px-4 py-2 border border-dnd-border text-dnd-muted hover:text-dnd-text hover:border-dnd-text rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </footer>
        )}
      </div>
    </div>
  )
}
