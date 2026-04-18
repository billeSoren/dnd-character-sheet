export type StatKey = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'

export interface CharacterFormData {
  name: string
  race: string
  className: string
  background: string
  level: number
  baseStats: Record<StatKey, number>
  selectedSkills: string[]
}

export const DEFAULT_FORM_DATA: CharacterFormData = {
  name: '',
  race: '',
  className: '',
  background: '',
  level: 1,
  baseStats: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
  selectedSkills: [],
}

export const STAT_LABELS: Record<StatKey, string> = {
  STR: 'Styrke',
  DEX: 'Smidighed',
  CON: 'Udholdenhed',
  INT: 'Intelligens',
  WIS: 'Visdom',
  CHA: 'Karisma',
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
