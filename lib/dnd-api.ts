/**
 * Typed fetch helpers for D&D reference tables in Supabase.
 * These replace the static @/lib/dnd-data imports in the character builder.
 */
import { createClient } from '@/lib/supabase'

export const DEFAULT_SOURCE = "Player's Handbook"

// ── Row types matching the Supabase schema ─────────────────────────────────

export interface DndClass {
  id: string
  name: string
  source: string
  hit_die: number
  primary_ability: string[]
  saving_throws: string[]
  armor_proficiencies: string[]
  weapon_proficiencies: string[]
  skill_choices: string[]
  num_skill_choices: number
  description: string
  subclasses: string[]
  spellcasting: string | null
}

export interface DndBackground {
  id: string
  name: string
  source: string
  description: string
  skill_proficiencies: string[]
  tool_proficiencies: string[]
  languages: string[]
  feature_name: string
  feature_description: string
}

export interface DndRace {
  id: string
  name: string
  source: string
  /** Dict of stat key → bonus, e.g. { STR: 0, DEX: 0, CON: 2, INT: 0, WIS: 0, CHA: 0 } */
  ability_bonuses: Record<string, number>
  speed: number
  size: string
  traits: string[]
  languages: string[]
  description: string
}

// ── Fetch functions ────────────────────────────────────────────────────────

export async function fetchClasses(): Promise<DndClass[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('dnd_classes')
    .select(
      'id, name, source, hit_die, primary_ability, saving_throws, ' +
      'armor_proficiencies, weapon_proficiencies, skill_choices, ' +
      'num_skill_choices, description, subclasses, spellcasting'
    )
    .order('name')
  if (error) throw new Error(`fetchClasses: ${error.message}`)
  return (data ?? []) as unknown as DndClass[]
}

export async function fetchBackgrounds(): Promise<DndBackground[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('backgrounds')
    .select(
      'id, name, source, description, skill_proficiencies, ' +
      'tool_proficiencies, languages, feature_name, feature_description'
    )
    .order('name')
  if (error) throw new Error(`fetchBackgrounds: ${error.message}`)
  return (data ?? []) as unknown as DndBackground[]
}

export async function fetchRaces(): Promise<DndRace[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('races')
    .select(
      'id, name, source, ability_bonuses, speed, size, traits, languages, description'
    )
    .order('name')
  if (error) throw new Error(`fetchRaces: ${error.message}`)
  return (data ?? []) as DndRace[]
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Format the ability_bonuses dict into a human-readable string.
 * Skips stats with 0 bonus.
 * e.g. { STR: 0, DEX: 0, CON: 2, INT: 0, WIS: 1, CHA: 0 } → "CON +2, WIS +1"
 */
export function formatAbilityBonuses(bonuses: Record<string, number>): string {
  return Object.entries(bonuses)
    .filter(([, v]) => v !== 0)
    .map(([k, v]) => `${k} +${v}`)
    .join(', ')
}
