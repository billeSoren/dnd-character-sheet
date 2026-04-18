import { createServerSupabaseClient } from '@/lib/supabase-server'
import { classes, races, skills as allSkills } from '@/lib/dnd-data'
import { StatKey } from '@/components/character-builder/types'
import HPTracker from '@/components/HPTracker'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

// ── Helpers ──────────────────────────────────────────────────────────────────

function proficiencyBonus(level: number) {
  return Math.floor((level - 1) / 4) + 2
}

function modifier(score: number) {
  return Math.floor((score - 10) / 2)
}

function modStr(score: number) {
  const m = modifier(score)
  return m >= 0 ? `+${m}` : `${m}`
}

const STAT_META: { key: StatKey; label: string; abbr: string }[] = [
  { key: 'STR', label: 'Styrke',      abbr: 'STR' },
  { key: 'DEX', label: 'Smidighed',   abbr: 'DEX' },
  { key: 'CON', label: 'Udholdenhed', abbr: 'CON' },
  { key: 'INT', label: 'Intelligens', abbr: 'INT' },
  { key: 'WIS', label: 'Visdom',      abbr: 'WIS' },
  { key: 'CHA', label: 'Karisma',     abbr: 'CHA' },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function CharacterPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!character) notFound()

  const [{ data: statsRow }, { data: hpRow }] = await Promise.all([
    supabase.from('character_stats').select('*').eq('character_id', params.id).single(),
    supabase.from('character_hp').select('*').eq('character_id', params.id).single(),
  ])

  // ── Derive data ────────────────────────────────────────────────────────────

  const classData = classes.find((c) => c.name === character.class)
  const raceData  = races.find((r) => r.name === character.race)
  const profBonus = proficiencyBonus(character.level)

  const statScores: Record<StatKey, number> = {
    STR: statsRow?.strength      ?? 10,
    DEX: statsRow?.dexterity     ?? 10,
    CON: statsRow?.constitution  ?? 10,
    INT: statsRow?.intelligence  ?? 10,
    WIS: statsRow?.wisdom        ?? 10,
    CHA: statsRow?.charisma      ?? 10,
  }

  const savingThrowProficiencies = new Set(classData?.savingThrows ?? [])

  const savingThrows = STAT_META.map(({ key, label }) => {
    const proficient = savingThrowProficiencies.has(key)
    const total = modifier(statScores[key]) + (proficient ? profBonus : 0)
    return { key, label, proficient, total }
  })

  const skillProficiencies = new Set(character.skill_proficiencies ?? [])

  const SKILL_ABILITY: Record<string, StatKey> = {
    'Acrobatics': 'DEX', 'Animal Handling': 'WIS', 'Arcana': 'INT',
    'Athletics': 'STR', 'Deception': 'CHA', 'History': 'INT',
    'Insight': 'WIS', 'Intimidation': 'CHA', 'Investigation': 'INT',
    'Medicine': 'WIS', 'Nature': 'INT', 'Perception': 'WIS',
    'Performance': 'CHA', 'Persuasion': 'CHA', 'Religion': 'INT',
    'Sleight of Hand': 'DEX', 'Stealth': 'DEX', 'Survival': 'WIS',
  }

  const skillList = allSkills.map((skill) => {
    const ability = (SKILL_ABILITY[skill.name] ?? skill.ability) as StatKey
    const proficient = skillProficiencies.has(skill.name)
    const total = modifier(statScores[ability]) + (proficient ? profBonus : 0)
    return { name: skill.name, ability, proficient, total }
  }).sort((a, b) => a.name.localeCompare(b.name))

  const maxHp      = hpRow?.max_hp      ?? 0
  const currentHp  = hpRow?.current_hp  ?? 0
  const tempHp     = hpRow?.temp_hp     ?? 0

  // Passive Perception = 10 + WIS modifier (+ proficiency if proficient)
  const wisSkill = skillList.find((s) => s.name === 'Perception')
  const passivePerception = 10 + (wisSkill?.total ?? modifier(statScores.WIS))

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-stone-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-stone-500 hover:text-amber-400 transition-colors text-sm">
            ← Tilbage
          </Link>
          <div className="h-4 w-px bg-stone-800" />
          <span className="text-amber-300 font-bold">{character.name}</span>
          <span className="text-stone-600 text-sm hidden sm:block">
            {character.race} · {character.class} · Niveau {character.level}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* ── Identity banner ───────────────────────────────────────────────── */}
        <div className="relative border border-amber-900/40 bg-stone-900/50 rounded-lg p-6">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-700/50 to-transparent rounded-t-lg" />
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-amber-200 leading-tight">
                {character.name}
              </h1>
              <p className="text-stone-400 mt-1">
                {character.race} · <span className="text-amber-400">{character.class}</span>
                {raceData && <span className="text-stone-600 text-sm"> · {raceData.size}, {raceData.speed} ft</span>}
              </p>
              <p className="text-stone-500 text-sm mt-1">Baggrund: {character.background}</p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <StatBadge label="Niveau" value={String(character.level)} />
              <StatBadge label="Proficiency Bonus" value={`+${profBonus}`} highlight />
              <StatBadge label="Passiv perception" value={String(passivePerception)} />
            </div>
          </div>
        </div>

        {/* ── Ability scores ────────────────────────────────────────────────── */}
        <section>
          <SectionHeading>Evnescores</SectionHeading>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {STAT_META.map(({ key, abbr, label }) => {
              const score = statScores[key]
              const mod   = modifier(score)
              return (
                <div
                  key={key}
                  className="border border-stone-800 bg-stone-900/50 rounded-lg p-4 flex flex-col items-center gap-1 text-center"
                >
                  <span className="text-xs font-bold text-amber-400/70 tracking-widest">{abbr}</span>
                  <span
                    className={`text-3xl font-bold leading-none mt-1 ${
                      mod > 0 ? 'text-green-400' : mod < 0 ? 'text-red-400' : 'text-stone-400'
                    }`}
                  >
                    {modStr(score)}
                  </span>
                  <div className="mt-2 w-10 h-10 rounded-full border-2 border-stone-700 flex items-center justify-center">
                    <span className="text-amber-100 font-semibold text-sm">{score}</span>
                  </div>
                  <span className="text-stone-600 text-xs">{label}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── HP + Saving Throws + Skills ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* HP Tracker */}
          <div>
            <SectionHeading>Hit Points</SectionHeading>
            <HPTracker
              characterId={character.id}
              maxHp={maxHp}
              initialCurrentHp={currentHp}
              initialTempHp={tempHp}
            />
          </div>

          {/* Saving Throws */}
          <div>
            <SectionHeading>Saving Throws</SectionHeading>
            <div className="border border-stone-800 bg-stone-900/50 rounded-lg overflow-hidden">
              {savingThrows.map((save, i) => (
                <div
                  key={save.key}
                  className={`flex items-center gap-3 px-4 py-2.5 ${i < savingThrows.length - 1 ? 'border-b border-stone-800/60' : ''}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      save.proficient ? 'bg-amber-600 border-amber-500' : 'border-stone-700'
                    }`}
                  />
                  <span className={`flex-1 text-sm ${save.proficient ? 'text-amber-200 font-medium' : 'text-stone-400'}`}>
                    {save.label}
                  </span>
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      save.total > 0 ? 'text-green-400' : save.total < 0 ? 'text-red-400' : 'text-stone-500'
                    }`}
                  >
                    {save.total >= 0 ? '+' : ''}{save.total}
                  </span>
                </div>
              ))}
            </div>
            {classData && (
              <p className="text-xs text-stone-600 mt-2 px-1">
                {character.class} er proficient i {classData.savingThrows.join(' og ')} saving throws
              </p>
            )}
          </div>

          {/* Skills */}
          <div>
            <SectionHeading>
              Færdigheder
              <span className="ml-2 text-amber-700 font-normal">
                ({skillList.filter((s) => s.proficient).length} proficient)
              </span>
            </SectionHeading>
            <div className="border border-stone-800 bg-stone-900/50 rounded-lg overflow-hidden max-h-[460px] overflow-y-auto">
              {skillList.map((skill, i) => (
                <div
                  key={skill.name}
                  className={`flex items-center gap-3 px-4 py-2 ${i < skillList.length - 1 ? 'border-b border-stone-800/40' : ''} ${skill.proficient ? 'bg-amber-950/20' : ''}`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${
                      skill.proficient ? 'bg-amber-600 border-amber-500' : 'border-stone-700'
                    }`}
                  />
                  <span className={`flex-1 text-sm ${skill.proficient ? 'text-amber-200 font-medium' : 'text-stone-400'}`}>
                    {skill.name}
                  </span>
                  <span className="text-xs text-stone-600 tabular-nums w-8 text-center">
                    {skill.ability}
                  </span>
                  <span
                    className={`text-sm font-bold tabular-nums w-8 text-right ${
                      skill.total > 0 ? 'text-green-400' : skill.total < 0 ? 'text-red-400' : 'text-stone-500'
                    }`}
                  >
                    {skill.total >= 0 ? '+' : ''}{skill.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatBadge({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex flex-col items-center px-4 py-2.5 rounded-lg border ${highlight ? 'border-amber-700/50 bg-amber-900/20' : 'border-stone-800 bg-stone-900/40'}`}>
      <span className={`text-xl font-bold ${highlight ? 'text-amber-300' : 'text-amber-100'}`}>{value}</span>
      <span className="text-xs text-stone-500 mt-0.5 whitespace-nowrap">{label}</span>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider mb-3">
      {children}
    </h2>
  )
}
