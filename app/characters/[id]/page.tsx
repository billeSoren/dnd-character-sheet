import { createServerSupabaseClient } from '@/lib/supabase-server'
import { StatKey } from '@/components/character-builder/types'
import CharacterSheet from '@/components/CharacterSheet'
import { notFound, redirect } from 'next/navigation'
import { calculateAC } from '@/lib/ac-calculator'

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

// ── Runtime helpers ───────────────────────────────────────────────────────────

/** Coerce a DB value that should be string[] but may arrive as string | null */
function toArr(v: unknown): string[] {
  if (v == null) return []
  if (Array.isArray(v)) return v as string[]
  if (typeof v === 'string') return v.length > 0 ? [v] : []
  return []
}

/** Coerce a DB value that should be Record<string,number> but may arrive as null */
function toNumRecord(v: unknown): Record<string, number> {
  if (v != null && typeof v === 'object' && !Array.isArray(v)) {
    return v as Record<string, number>
  }
  return {}
}

export default async function CharacterPage({ params }: { params: { id: string } }) {
  try {
    return await renderCharacterPage(params)
  } catch (err) {
    console.error('[CharacterPage] Unhandled error:', err)
    throw err
  }
}

async function renderCharacterPage({ id }: { id: string }) {
  console.log('[CharacterPage] start id=', id)
  const supabase = await createServerSupabaseClient()
  console.log('[CharacterPage] supabase ready')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  console.log('[CharacterPage] user ok')

  const [
    { data: character, error: charErr },
    { data: statsRow },
    { data: hpRow },
    { data: itemRows },
    { data: activeEffectRows },
    { data: charClassRows },
  ] = await Promise.all([
    supabase.from('characters').select('*').eq('id', id).single(),
    supabase.from('character_stats').select('*').eq('character_id', id).single(),
    supabase.from('character_hp').select('*').eq('character_id', id).single(),
    supabase.from('character_items').select('*, magic_items(*)').eq('character_id', id),
    supabase.from('character_active_effects').select('*').eq('character_id', id),
    supabase.from('character_classes').select('*').eq('character_id', id).order('is_primary', { ascending: false }),
  ])

  if (charErr) console.error('[CharacterPage] character query error:', charErr)
  if (!character) notFound()
  console.log('[CharacterPage] character=', character!.name, 'class=', character!.class)

  // Fetch live class + race from Supabase (prefer PHB source, fall back to first)
  const [{ data: classRows, error: classErr }, { data: raceRows, error: raceErr }] = await Promise.all([
    supabase.from('dnd_classes').select('*').eq('name', character!.class).order('source'),
    supabase.from('races').select('*').eq('name', character!.race).order('source'),
  ])
  if (classErr) console.error('[CharacterPage] dnd_classes error:', classErr)
  if (raceErr)  console.error('[CharacterPage] races error:', raceErr)

  const classRow = classRows?.find((r) => r.source === 'PHB') ?? classRows?.[0] ?? null
  const raceRow  = raceRows?.find((r) => r.source === 'PHB') ?? raceRows?.[0] ?? null
  console.log('[CharacterPage] classRow=', classRow?.name ?? 'null', 'raceRow=', raceRow?.name ?? 'null')

  // ── Derived values ────────────────────────────────────────────────────────

  const pb = profBonus(character!.level)

  const statScores: Record<StatKey, number> = {
    STR: statsRow?.strength     ?? 10,
    DEX: statsRow?.dexterity    ?? 10,
    CON: statsRow?.constitution ?? 10,
    INT: statsRow?.intelligence ?? 10,
    WIS: statsRow?.wisdom       ?? 10,
    CHA: statsRow?.charisma     ?? 10,
  }
  console.log('[CharacterPage] statScores ok')

  const savingThrowProfs = new Set<StatKey>(
    toArr(classRow?.saving_throws).map(toStatKey).filter(Boolean) as StatKey[]
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
  const proficiencySet = new Set(character!.skill_proficiencies ?? [])
  const skillList = Object.entries(SKILL_ABILITY)
    .map(([name, ability]) => {
      const proficient = proficiencySet.has(name)
      return { name, ability, proficient, total: mod(statScores[ability]) + (proficient ? pb : 0) }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const perception = skillList.find((s) => s.name === 'Perception')
  const passivePerception = 10 + (perception?.total ?? mod(statScores.WIS))

  const speed = (raceRow?.speed as number | null) ?? 30

  // ── Character classes for multiclass support ──────────────────────────────
  const characterClassList = (charClassRows ?? []).map((r) => ({
    id:           r.id as string,
    character_id: r.character_id as string,
    class_id:     r.class_id as string | null,
    class_name:   r.class_name as string,
    level:        r.level as number,
    subclass:     r.subclass as string | null,
    is_primary:   r.is_primary as boolean,
    hit_die:      r.hit_die as number,
  }))

  // ── Compute initial AC server-side (client will recompute when effects change)
  const initialItems = (itemRows ?? []) as Array<{
    id: string; character_id: string; item_id: string; equipped: boolean; attuned: boolean
    added_at: string; quantity: number; notes: string | null
    magic_items: { id: string; name: string; type: string | null; rarity: string | null; requires_attunement: boolean | null; description: string | null; source: string | null; is_official: boolean | null; hidden: boolean | null }
  }>

  const primarySubclass = characterClassList.find((c) => c.is_primary)?.subclass ?? null

  const initialAC = calculateAC({
    statScores,
    equippedItems: initialItems
      .filter((ci) => ci.equipped)
      .map((ci) => ({ name: ci.magic_items.name, type: ci.magic_items.type, equipped: true })),
    activeEffects: (activeEffectRows ?? []).map((e) => ({
      id: e.id as string,
      effect_name: e.effect_name as string,
      effect_type: e.effect_type as string,
      value: e.value as number,
      source: e.source as string | null,
      source_name: e.source_name as string | null,
    })),
    race: character!.race,
    className: character!.class,
    subclass: primarySubclass,
    level: character!.level,
    characterClasses: characterClassList,
  })

  console.log('[CharacterPage] derived values ok, ac=', initialAC.total, 'rendering')

  return (
    <CharacterSheet
      character={{
        id: character!.id,
        name: character!.name,
        race: character!.race,
        class: character!.class,
        level: character!.level,
        background: character!.background,
        skill_proficiencies: character!.skill_proficiencies ?? [],
      }}
      statScores={statScores}
      hp={{ max: hpRow?.max_hp ?? 0, current: hpRow?.current_hp ?? 0, temp: hpRow?.temp_hp ?? 0 }}
      profBonus={pb}
      initiative={mod(statScores.DEX)}
      initialAC={initialAC.total}
      initialACBreakdown={initialAC.breakdown}
      speed={speed}
      size={(raceRow?.size as string | null) ?? 'Medium'}
      passivePerception={passivePerception}
      savingThrows={savingThrows}
      skillList={skillList}
      spellSlots={computeSpellSlots(character!.class, character!.level)}
      initialItems={initialItems}
      initialActiveEffects={(activeEffectRows ?? []).map((e) => ({
        id: e.id as string,
        character_id: e.character_id as string,
        effect_name: e.effect_name as string,
        effect_type: e.effect_type as string,
        value: e.value as number,
        source: e.source as string | null,
        source_name: e.source_name as string | null,
        expires_at: e.expires_at as string | null,
        created_at: e.created_at as string,
      }))}
      characterClasses={characterClassList}
      classInfo={classRow ? {
        description: classRow.description ?? '',
        hit_die: classRow.hit_die ?? 8,
        armor_proficiencies: toArr(classRow.armor_proficiencies).join(', '),
        weapon_proficiencies: toArr(classRow.weapon_proficiencies).join(', '),
        primary_ability: toArr(classRow.primary_ability).join(', '),
        saving_throws: toArr(classRow.saving_throws),
      } : null}
      raceInfo={raceRow ? {
        description: raceRow.description ?? '',
        traits:          toArr(raceRow.traits),
        languages:       toArr(raceRow.languages),
        ability_bonuses: toNumRecord(raceRow.ability_bonuses),
      } : null}
    />
  )
}
