import { createServerSupabaseClient } from '@/lib/supabase-server'
import { skills as allSkills } from '@/lib/dnd-data'
import { StatKey } from '@/components/character-builder/types'
import CharacterSheet from '@/components/CharacterSheet'
import { notFound, redirect } from 'next/navigation'

// ── Helpers ───────────────────────────────────────────────────────────────────

function profBonus(level: number) {
  return Math.floor((level - 1) / 4) + 2
}
function mod(score: number) {
  return Math.floor((score - 10) / 2)
}

const STAT_ABBR_MAP: Record<string, StatKey> = {
  str: 'STR', strength: 'STR',
  dex: 'DEX', dexterity: 'DEX',
  con: 'CON', constitution: 'CON',
  int: 'INT', intelligence: 'INT',
  wis: 'WIS', wisdom: 'WIS',
  cha: 'CHA', charisma: 'CHA',
}
function toStatKey(s: string): StatKey | null {
  return STAT_ABBR_MAP[s.toLowerCase()] ?? null
}

// Standard spell slot table indexed by [level-1][slotLevel-1] for full casters.
const FULL_CASTER_SLOTS: number[][] = [
  [2,0,0,0,0,0,0,0,0],
  [3,0,0,0,0,0,0,0,0],
  [4,2,0,0,0,0,0,0,0],
  [4,3,0,0,0,0,0,0,0],
  [4,3,2,0,0,0,0,0,0],
  [4,3,3,0,0,0,0,0,0],
  [4,3,3,1,0,0,0,0,0],
  [4,3,3,2,0,0,0,0,0],
  [4,3,3,3,1,0,0,0,0],
  [4,3,3,3,2,0,0,0,0],
  [4,3,3,3,2,1,0,0,0],
  [4,3,3,3,2,1,0,0,0],
  [4,3,3,3,2,1,1,0,0],
  [4,3,3,3,2,1,1,0,0],
  [4,3,3,3,2,1,1,1,0],
  [4,3,3,3,2,1,1,1,0],
  [4,3,3,3,2,1,1,1,1],
  [4,3,3,3,3,1,1,1,1],
  [4,3,3,3,3,2,1,1,1],
  [4,3,3,3,3,2,2,1,1],
]

const WARLOCK_SLOTS: { slots: number; level: number }[] = [
  {slots:1,level:1},{slots:2,level:1},{slots:2,level:2},{slots:2,level:2},
  {slots:2,level:3},{slots:2,level:3},{slots:2,level:4},{slots:2,level:4},
  {slots:2,level:5},{slots:2,level:5},{slots:3,level:5},{slots:3,level:5},
  {slots:3,level:5},{slots:3,level:5},{slots:3,level:5},{slots:3,level:5},
  {slots:4,level:5},{slots:4,level:5},{slots:4,level:5},{slots:4,level:5},
]

type CasterType = 'full' | 'half' | 'third' | 'warlock' | 'none'

const CLASS_CASTER_TYPE: Record<string, CasterType> = {
  Bard: 'full', Cleric: 'full', Druid: 'full', Sorcerer: 'full', Wizard: 'full',
  Paladin: 'half', Ranger: 'half',
  Artificer: 'third',
  Warlock: 'warlock',
  Barbarian: 'none', Fighter: 'none', Monk: 'none', Rogue: 'none',
  'Blood Hunter': 'none',
}

function computeSpellSlots(className: string, level: number): number[] {
  const type = CLASS_CASTER_TYPE[className] ?? 'none'
  const L = Math.max(1, Math.min(20, level)) - 1

  if (type === 'full') return FULL_CASTER_SLOTS[L]
  if (type === 'half') {
    const eff = Math.max(0, Math.floor(level / 2) - 1)
    return eff < 0 ? Array(9).fill(0) : FULL_CASTER_SLOTS[Math.min(eff, 19)]
  }
  if (type === 'third') {
    const eff = Math.max(0, Math.floor((level + 1) / 3) - 1)
    return eff < 0 ? Array(9).fill(0) : FULL_CASTER_SLOTS[Math.min(eff, 19)]
  }
  if (type === 'warlock') {
    const w = WARLOCK_SLOTS[L]
    const row = Array(9).fill(0)
    row[w.level - 1] = w.slots
    return row
  }
  return Array(9).fill(0)
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CharacterPage({ params }: { params: { id: string } }) {
  try {
    return await renderCharacterPage(params)
  } catch (err) {
    console.error('[CharacterPage] Unhandled error:', err)
    throw err
  }
}

async function renderCharacterPage({ id }: { id: string }) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: character },
    { data: statsRow },
    { data: hpRow },
  ] = await Promise.all([
    supabase.from('characters').select('*').eq('id', id).single(),
    supabase.from('character_stats').select('*').eq('character_id', id).single(),
    supabase.from('character_hp').select('*').eq('character_id', id).single(),
  ])

  if (!character) notFound()

  // Fetch live class + race from Supabase (prefer PHB source, fall back to first)
  const [{ data: classRows }, { data: raceRows }] = await Promise.all([
    supabase.from('dnd_classes').select('*').eq('name', character.class).order('source'),
    supabase.from('races').select('*').eq('name', character.race).order('source'),
  ])

  const classRow = classRows?.find((r) => r.source === 'PHB') ?? classRows?.[0] ?? null
  const raceRow  = raceRows?.find((r) => r.source === 'PHB') ?? raceRows?.[0] ?? null

  // ── Derived values ────────────────────────────────────────────────────────

  const pb = profBonus(character.level)

  const statScores: Record<StatKey, number> = {
    STR: statsRow?.strength     ?? 10,
    DEX: statsRow?.dexterity    ?? 10,
    CON: statsRow?.constitution ?? 10,
    INT: statsRow?.intelligence ?? 10,
    WIS: statsRow?.wisdom       ?? 10,
    CHA: statsRow?.charisma     ?? 10,
  }

  const savingThrowProfs = new Set<StatKey>(
    (classRow?.saving_throws ?? []).map(toStatKey).filter(Boolean) as StatKey[]
  )

  const STAT_META: { key: StatKey; label: string }[] = [
    { key: 'STR', label: 'Strength' },    { key: 'DEX', label: 'Dexterity' },
    { key: 'CON', label: 'Constitution' },{ key: 'INT', label: 'Intelligence' },
    { key: 'WIS', label: 'Wisdom' },      { key: 'CHA', label: 'Charisma' },
  ]

  const savingThrows = STAT_META.map(({ key, label }) => {
    const proficient = savingThrowProfs.has(key)
    return { key, label, proficient, total: mod(statScores[key]) + (proficient ? pb : 0) }
  })

  const SKILL_ABILITY: Record<string, StatKey> = {
    Acrobatics: 'DEX', 'Animal Handling': 'WIS', Arcana: 'INT',
    Athletics: 'STR', Deception: 'CHA', History: 'INT',
    Insight: 'WIS', Intimidation: 'CHA', Investigation: 'INT',
    Medicine: 'WIS', Nature: 'INT', Perception: 'WIS',
    Performance: 'CHA', Persuasion: 'CHA', Religion: 'INT',
    'Sleight of Hand': 'DEX', Stealth: 'DEX', Survival: 'WIS',
  }
  const proficiencySet = new Set(character.skill_proficiencies ?? [])
  const skillList = allSkills
    .map((skill) => {
      const ability = (SKILL_ABILITY[skill.name] ?? skill.ability) as StatKey
      const proficient = proficiencySet.has(skill.name)
      return { name: skill.name, ability, proficient, total: mod(statScores[ability]) + (proficient ? pb : 0) }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const perception = skillList.find((s) => s.name === 'Perception')
  const passivePerception = 10 + (perception?.total ?? mod(statScores.WIS))

  const speed = (raceRow?.speed as number | null) ?? 30

  return (
    <CharacterSheet
      character={{
        id: character.id,
        name: character.name,
        race: character.race,
        class: character.class,
        level: character.level,
        background: character.background,
        skill_proficiencies: character.skill_proficiencies ?? [],
      }}
      statScores={statScores}
      hp={{ max: hpRow?.max_hp ?? 0, current: hpRow?.current_hp ?? 0, temp: hpRow?.temp_hp ?? 0 }}
      profBonus={pb}
      initiative={mod(statScores.DEX)}
      ac={10 + mod(statScores.DEX)}
      speed={speed}
      size={(raceRow?.size as string | null) ?? 'Medium'}
      passivePerception={passivePerception}
      savingThrows={savingThrows}
      skillList={skillList}
      spellSlots={computeSpellSlots(character.class, character.level)}
      classInfo={classRow ? {
        description: classRow.description ?? '',
        hit_die: classRow.hit_die ?? 8,
        armor_proficiencies: (classRow.armor_proficiencies ?? []).join(', '),
        weapon_proficiencies: (classRow.weapon_proficiencies ?? []).join(', '),
        primary_ability: (classRow.primary_ability ?? []).join(', '),
        saving_throws: classRow.saving_throws ?? [],
      } : null}
      raceInfo={raceRow ? {
        description: raceRow.description ?? '',
        traits: (raceRow.traits as string[] | null) ?? [],
        languages: (raceRow.languages as string[] | null) ?? [],
        ability_bonuses: (raceRow.ability_bonuses as Record<string, number> | null) ?? {},
      } : null}
    />
  )
}
