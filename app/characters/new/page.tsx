'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { classes, races, backgrounds } from '@/lib/dnd-data'
import {
  CharacterFormData,
  DEFAULT_FORM_DATA,
  StatKey,
  modifier,
  calculateMaxHP,
} from '@/components/character-builder/types'
import StepIndicator from '@/components/character-builder/StepIndicator'
import Step1BasicInfo from '@/components/character-builder/Step1BasicInfo'
import Step2AbilityScores from '@/components/character-builder/Step2AbilityScores'
import Step3HP from '@/components/character-builder/Step3HP'
import Step4Skills from '@/components/character-builder/Step4Skills'
import Step5Summary from '@/components/character-builder/Step5Summary'

const STEP_LABELS = ['Grundinfo', 'Evner', 'HP', 'Færdigheder', 'Opsummering']
const TOTAL_STEPS = 5

function validateStep(step: number, data: CharacterFormData): string | null {
  if (step === 1) {
    if (!data.name.trim()) return 'Angiv et navn til din karakter.'
    if (!data.race) return 'Vælg en race.'
    if (!data.className) return 'Vælg en klasse.'
    if (!data.background) return 'Vælg en baggrund.'
  }
  if (step === 4) {
    const cls = classes.find((c) => c.name === data.className)
    const needed = cls?.skillChoices.choose ?? 0
    if (data.selectedSkills.length < needed) {
      return `Vælg ${needed - data.selectedSkills.length} færdighed(er) mere fra din klasse.`
    }
  }
  return null
}

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

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const selectedClass = classes.find((c) => c.name === formData.className)
    const selectedRace = races.find((r) => r.name === formData.race)

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

    const hitDie = selectedClass?.hitDie ?? 8
    const conMod = modifier(finalStats.CON)
    const maxHP = calculateMaxHP(hitDie, conMod, formData.level)

    const selectedBg = backgrounds.find((b) => b.name === formData.background)
    const allSkills = [
      ...(selectedBg?.skillProficiencies ?? []),
      ...formData.selectedSkills,
    ]

    // Insert character
    const { data: char, error: charError } = await supabase
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

    if (charError || !char) {
      setSaveError(charError?.message ?? 'Kunne ikke gemme karakteren.')
      setSaving(false)
      return
    }

    // Insert stats
    const { error: statsError } = await supabase.from('character_stats').insert({
      character_id: char.id,
      strength: finalStats.STR,
      dexterity: finalStats.DEX,
      constitution: finalStats.CON,
      intelligence: finalStats.INT,
      wisdom: finalStats.WIS,
      charisma: finalStats.CHA,
    })

    if (statsError) {
      setSaveError(statsError.message)
      setSaving(false)
      return
    }

    // Insert HP
    const { error: hpError } = await supabase.from('character_hp').insert({
      character_id: char.id,
      max_hp: maxHP,
      current_hp: maxHP,
      temp_hp: 0,
    })

    if (hpError) {
      setSaveError(hpError.message)
      setSaving(false)
      return
    }

    router.push('/')
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-stone-500 text-sm">Indlæser…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-stone-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-amber-300 hover:text-amber-200 transition-colors">
            <span className="text-xl">⚔️</span>
            <span className="font-bold tracking-wide">D&D Karakterark</span>
          </Link>
          <span className="text-stone-500 text-sm">Trin {step} af {TOTAL_STEPS}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} labels={STEP_LABELS} />

        {/* Step content */}
        <div className="relative border border-amber-900/30 bg-stone-900/40 rounded-lg p-6 sm:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-700/40 to-transparent rounded-t-lg" />

          {step === 1 && <Step1BasicInfo data={formData} onChange={updateForm} />}
          {step === 2 && <Step2AbilityScores data={formData} onChange={updateForm} />}
          {step === 3 && <Step3HP data={formData} />}
          {step === 4 && <Step4Skills data={formData} onChange={updateForm} />}
          {step === 5 && (
            <Step5Summary
              data={formData}
              onSave={handleSave}
              saving={saving}
              error={saveError}
            />
          )}

          {/* Step error */}
          {stepError && (
            <p className="mt-4 text-red-400 text-sm bg-red-900/20 border border-red-900/40 rounded px-3 py-2">
              {stepError}
            </p>
          )}
        </div>

        {/* Navigation */}
        {step < TOTAL_STEPS && (
          <div className="flex justify-between mt-6">
            <button
              onClick={goBack}
              disabled={step === 1}
              className="px-5 py-2.5 border border-stone-700 text-stone-400 hover:text-stone-200 hover:border-stone-600 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
            >
              ← Tilbage
            </button>
            <button
              onClick={goNext}
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-600 text-stone-100 font-semibold rounded transition-colors"
            >
              Næste →
            </button>
          </div>
        )}
        {step === TOTAL_STEPS && (
          <div className="flex justify-start mt-6">
            <button
              onClick={goBack}
              className="px-5 py-2.5 border border-stone-700 text-stone-400 hover:text-stone-200 hover:border-stone-600 rounded transition-colors"
            >
              ← Tilbage
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
