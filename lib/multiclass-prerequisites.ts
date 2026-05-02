export type StatKey = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'

export interface Prerequisite {
  stat: StatKey
  minimum: number
}

// Prerequisites to ENTER a class via multiclassing
export const MULTICLASS_PREREQS: Record<string, Prerequisite[]> = {
  Artificer: [{ stat: 'INT', minimum: 13 }],
  Barbarian: [{ stat: 'STR', minimum: 13 }],
  Bard:      [{ stat: 'CHA', minimum: 13 }],
  Cleric:    [{ stat: 'WIS', minimum: 13 }],
  Druid:     [{ stat: 'WIS', minimum: 13 }],
  Fighter:   [{ stat: 'STR', minimum: 13 }], // or DEX 13 (see MULTICLASS_PREREQS_ALT)
  Monk:      [{ stat: 'DEX', minimum: 13 }, { stat: 'WIS', minimum: 13 }],
  Paladin:   [{ stat: 'STR', minimum: 13 }, { stat: 'CHA', minimum: 13 }],
  Ranger:    [{ stat: 'DEX', minimum: 13 }, { stat: 'WIS', minimum: 13 }],
  Rogue:     [{ stat: 'DEX', minimum: 13 }],
  Sorcerer:  [{ stat: 'CHA', minimum: 13 }],
  Warlock:   [{ stat: 'CHA', minimum: 13 }],
  Wizard:    [{ stat: 'INT', minimum: 13 }],
}

// Fighter can also use DEX 13 as alternative prerequisite
export const MULTICLASS_PREREQS_ALT: Partial<Record<string, Prerequisite[]>> = {
  Fighter: [{ stat: 'DEX', minimum: 13 }],
}

export interface PrereqCheck {
  met: boolean
  requirements: Array<{ stat: StatKey; minimum: number; actual: number; met: boolean }>
  altRequirements?: Array<{ stat: StatKey; minimum: number; actual: number; met: boolean }>
}

function buildRequirementDetail(
  prereqs: Prerequisite[],
  statScores: Record<StatKey, number>
): Array<{ stat: StatKey; minimum: number; actual: number; met: boolean }> {
  return prereqs.map(({ stat, minimum }) => ({
    stat,
    minimum,
    actual: statScores[stat] ?? 0,
    met: (statScores[stat] ?? 0) >= minimum,
  }))
}

/**
 * Returns true if the character meets ALL prerequisites for the given class,
 * or meets the ALT prerequisites (e.g. Fighter's DEX 13 alternative).
 */
export function meetsPrerequisites(
  className: string,
  statScores: Record<StatKey, number>
): boolean {
  const prereqs = MULTICLASS_PREREQS[className]
  if (!prereqs) return true // No prerequisites defined — assume met

  const primaryMet = prereqs.every(({ stat, minimum }) => (statScores[stat] ?? 0) >= minimum)
  if (primaryMet) return true

  const altPrereqs = MULTICLASS_PREREQS_ALT[className]
  if (altPrereqs) {
    return altPrereqs.every(({ stat, minimum }) => (statScores[stat] ?? 0) >= minimum)
  }

  return false
}

/**
 * Returns a detailed breakdown of each stat requirement and whether it is met,
 * including alternative requirements where applicable (e.g. Fighter).
 */
export function checkPrerequisites(
  className: string,
  statScores: Record<StatKey, number>
): PrereqCheck {
  const prereqs = MULTICLASS_PREREQS[className]
  if (!prereqs) {
    return { met: true, requirements: [] }
  }

  const requirements = buildRequirementDetail(prereqs, statScores)
  const primaryMet = requirements.every((r) => r.met)

  const altPrereqs = MULTICLASS_PREREQS_ALT[className]
  if (!altPrereqs) {
    return { met: primaryMet, requirements }
  }

  const altRequirements = buildRequirementDetail(altPrereqs, statScores)
  const altMet = altRequirements.every((r) => r.met)

  return {
    met: primaryMet || altMet,
    requirements,
    altRequirements,
  }
}
