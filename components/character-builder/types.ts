export type StatKey = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'
export type AbilityMethod = 'standard' | 'pointbuy' | 'manual'
export type Edition = '5e' | '5.5e'
export type AdvancementType = 'milestone' | 'xp'
export type HitPointType = 'fixed' | 'rolled'

const BASE_SOURCES: Record<Edition, string[]> = {
  '5e':   ['PHB', 'BR'],
  '5.5e': ['PHB24', 'BR'],
}
const EXPANDED_SOURCES    = ['TCE', 'XGE']
const THIRD_PARTY_SOURCES = ['FOA', 'BHC', 'D&DV']

export function computeAllowedSources(
  edition: Edition,
  expandedRules: boolean,
  thirdParty: boolean,
): string[] {
  return [
    ...BASE_SOURCES[edition],
    ...(expandedRules && edition === '5e' ? EXPANDED_SOURCES : []),
    ...(thirdParty ? THIRD_PARTY_SOURCES : []),
  ]
}

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const

export const PB_COST: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
}
export const PB_BUDGET = 27

export interface CharacterFormData {
  // Step 0 — preferences
  edition: Edition
  expandedRules: boolean
  thirdParty: boolean
  allowedSources: string[]
  advancementType: AdvancementType
  hitPointType: HitPointType
  // Step 1
  className: string
  classId: string | null
  // Step 2
  background: string
  backgroundId: string | null
  // Step 3
  race: string
  raceId: string | null
  // Step 4
  abilityMethod: AbilityMethod
  baseStats: Record<StatKey, number>
  standardArrayAssignments: Record<StatKey, number | null>
  // Step 5
  name: string
  level: number
  selectedSkills: string[]
}

export const DEFAULT_FORM_DATA: CharacterFormData = {
  edition: '5e',
  expandedRules: false,
  thirdParty: false,
  allowedSources: ['PHB', 'BR'],
  advancementType: 'milestone',
  hitPointType: 'fixed',
  className: '',
  classId: null,
  background: '',
  backgroundId: null,
  race: '',
  raceId: null,
  abilityMethod: 'standard',
  baseStats: { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 },
  standardArrayAssignments: { STR: null, DEX: null, CON: null, INT: null, WIS: null, CHA: null },
  name: '',
  level: 1,
  selectedSkills: [],
}

export const STAT_LABELS: Record<StatKey, string> = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma',
}

export const STAT_KEYS: StatKey[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']

export function modifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function modStr(score: number): string {
  const m = modifier(score)
  return m >= 0 ? `+${m}` : `${m}`
}

export function rollStat(): number {
  const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1)
  rolls.sort((a, b) => a - b)
  return rolls.slice(1).reduce((a, b) => a + b, 0)
}

export function calculateMaxHP(hitDie: number, conMod: number, level: number): number {
  const first = hitDie + conMod
  if (level === 1) return Math.max(1, first)
  const avgPerLevel = Math.floor(hitDie / 2) + 1 + conMod
  return Math.max(1, first + (level - 1) * Math.max(1, avgPerLevel))
}

export function totalPBSpent(stats: Record<StatKey, number>): number {
  return STAT_KEYS.reduce((sum, k) => sum + (PB_COST[stats[k]] ?? 0), 0)
}
