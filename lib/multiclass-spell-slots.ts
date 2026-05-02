export interface CharacterClassEntry {
  class_name: string
  level: number
  subclass?: string | null
}

// Caster type for multiclass purposes
export type MulticlassCasterType = 'full' | 'half' | 'third' | 'warlock' | 'none'

// Spell slots by combined caster level (index 0 = caster level 1, index 19 = caster level 20)
// Each row: [1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th]
const FULL_CASTER_SLOTS: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // level  1
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // level  2
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // level  3
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // level  4
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // level  5
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // level  6
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // level  7
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // level  8
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // level  9
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // level 10
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // level 11
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // level 12
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // level 13
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // level 14
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // level 15
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // level 16
  [4, 3, 3, 3, 2, 1, 1, 1, 1], // level 17
  [4, 3, 3, 3, 3, 1, 1, 1, 1], // level 18
  [4, 3, 3, 3, 3, 2, 1, 1, 1], // level 19
  [4, 3, 3, 3, 3, 2, 2, 1, 1], // level 20
]

// Warlock pact magic table: indexed by warlock level (0-based, index 0 = level 1)
// Each entry: [slots, slotLevel]
const WARLOCK_PACT_MAGIC: Array<[number, number]> = [
  [1, 1], // level  1
  [2, 1], // level  2
  [2, 2], // level  3
  [2, 2], // level  4
  [2, 3], // level  5
  [2, 3], // level  6
  [2, 4], // level  7
  [2, 4], // level  8
  [2, 5], // level  9
  [2, 5], // level 10
  [3, 5], // level 11
  [3, 5], // level 12
  [3, 5], // level 13
  [3, 5], // level 14
  [3, 5], // level 15
  [3, 5], // level 16
  [4, 5], // level 17
  [4, 5], // level 18
  [4, 5], // level 19
  [4, 5], // level 20
]

/**
 * Returns the multiclass caster type for a given class and optional subclass.
 *
 * - full:    Bard, Cleric, Druid, Sorcerer, Wizard
 * - half:    Paladin, Ranger (contribute floor(level/2), minimum level 2)
 * - third:   Artificer; Fighter (Eldritch Knight); Rogue (Arcane Trickster) — floor(level/3), minimum level 3
 * - warlock: Warlock (separate pact magic, not added to combined total)
 * - none:    Barbarian, Fighter (non-EK), Monk, Rogue (non-AT), and any unrecognised class
 */
export function getMulticlassCasterType(
  className: string,
  subclass?: string | null
): MulticlassCasterType {
  const name = className.trim()
  const sub = (subclass ?? '').trim().toLowerCase()

  switch (name) {
    case 'Bard':
    case 'Cleric':
    case 'Druid':
    case 'Sorcerer':
    case 'Wizard':
      return 'full'

    case 'Paladin':
    case 'Ranger':
      return 'half'

    case 'Artificer':
      return 'third'

    case 'Fighter':
      // Eldritch Knight subclass grants third-caster progression
      if (sub.includes('eldritch knight')) return 'third'
      return 'none'

    case 'Rogue':
      // Arcane Trickster subclass grants third-caster progression
      if (sub.includes('arcane trickster')) return 'third'
      return 'none'

    case 'Warlock':
      return 'warlock'

    // Barbarian, Monk, and any unrecognised class contribute nothing
    default:
      return 'none'
  }
}

/**
 * Computes multiclass spell slots per D&D 5e PHB rules.
 *
 * Combined caster level:
 *   full  → add full class level
 *   half  → add floor(level / 2)  (contributes 0 if level < 2)
 *   third → add floor(level / 3)  (contributes 0 if level < 3)
 *   warlock / none → excluded from combined total
 *
 * Warlock pact magic is tracked separately and never merged into combinedSlots.
 *
 * Returns:
 *   combinedSlots  — 9-element array [1st … 9th] for combined caster levels
 *   warlockSlots   — { slots, slotLevel } from pact magic, or null if no warlock levels
 */
export function computeMulticlassSpellSlots(classes: CharacterClassEntry[]): {
  combinedSlots: number[]
  warlockSlots: { slots: number; slotLevel: number } | null
} {
  let combinedCasterLevel = 0
  let warlockSlots: { slots: number; slotLevel: number } | null = null

  for (const entry of classes) {
    const { class_name, level, subclass } = entry
    if (level < 1) continue

    const casterType = getMulticlassCasterType(class_name, subclass)

    switch (casterType) {
      case 'full':
        combinedCasterLevel += level
        break

      case 'half':
        // Half casters only contribute once they reach level 2
        combinedCasterLevel += Math.floor(level / 2)
        break

      case 'third':
        // Third casters only contribute once they reach level 3
        combinedCasterLevel += Math.floor(level / 3)
        break

      case 'warlock': {
        // Pact magic is tracked separately; highest warlock level wins if somehow
        // there are duplicate entries, though that should never occur normally.
        const clampedLevel = Math.min(Math.max(level, 1), 20)
        const [slots, slotLevel] = WARLOCK_PACT_MAGIC[clampedLevel - 1]
        if (
          warlockSlots === null ||
          slotLevel > warlockSlots.slotLevel ||
          (slotLevel === warlockSlots.slotLevel && slots > warlockSlots.slots)
        ) {
          warlockSlots = { slots, slotLevel }
        }
        break
      }

      case 'none':
      default:
        break
    }
  }

  // Clamp combined caster level to valid table range [1, 20]
  const combinedSlots =
    combinedCasterLevel < 1
      ? [0, 0, 0, 0, 0, 0, 0, 0, 0]
      : FULL_CASTER_SLOTS[Math.min(combinedCasterLevel, 20) - 1]

  return { combinedSlots, warlockSlots }
}
