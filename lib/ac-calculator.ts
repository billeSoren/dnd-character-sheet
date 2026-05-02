export type ArmorCategory = 'none' | 'light' | 'medium' | 'heavy' | 'natural' | 'mage_armor'

export interface ActiveEffect {
  id: string
  effect_name: string
  effect_type: string   // 'ac_bonus' | 'ac_override' | 'ac_set_minimum' | 'natural_armor'
  value: number
  source: string | null
  source_name: string | null
}

export interface EquippedItem {
  name: string
  type: string | null
  equipped: boolean
}

export interface ACInput {
  statScores: Record<'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA', number>
  equippedItems: EquippedItem[]
  activeEffects: ActiveEffect[]
  race: string
  className: string
  subclass?: string | null
  level: number
  characterClasses?: Array<{ class_name: string; level: number; subclass?: string | null }>
}

export interface ACResult {
  total: number
  breakdown: string[]
  armorCategory: ArmorCategory
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mod(score: number): number {
  return Math.floor((score - 10) / 2)
}

interface ArmorEntry {
  pattern: RegExp
  base: number
  category: 'light' | 'medium' | 'heavy'
}

// Sorted so more-specific patterns are checked before generic ones (e.g.
// "half plate" before "plate", "chain mail" before "chain shirt").
const ARMOR_TABLE: ArmorEntry[] = [
  { pattern: /half\s*plate/i,       base: 15, category: 'medium' },
  { pattern: /ring\s*mail/i,        base: 14, category: 'heavy'  },
  { pattern: /chain\s*mail/i,       base: 16, category: 'heavy'  },
  { pattern: /chain\s*shirt/i,      base: 13, category: 'medium' },
  { pattern: /scale/i,              base: 14, category: 'medium' },
  { pattern: /studded\s*leather/i,  base: 12, category: 'light'  },
  { pattern: /splint/i,             base: 17, category: 'heavy'  },
  { pattern: /breastplate/i,        base: 14, category: 'medium' },
  { pattern: /hide/i,               base: 12, category: 'medium' },
  // "leather" must come after "studded leather"
  { pattern: /\bleather\b/i,        base: 11, category: 'light'  },
  { pattern: /padded/i,             base: 11, category: 'light'  },
  // "plate" must come after "half plate"
  { pattern: /\bplate\b/i,          base: 18, category: 'heavy'  },
]

function matchArmor(name: string): ArmorEntry | null {
  for (const entry of ARMOR_TABLE) {
    if (entry.pattern.test(name)) return entry
  }
  return null
}

function parseMagicBonus(name: string): number {
  const m = name.match(/\+(\d)/)
  return m ? parseInt(m[1], 10) : 0
}

function isShield(item: EquippedItem): boolean {
  const nameHasShield = /shield/i.test(item.name)
  const typeHasShield = item.type ? /shield/i.test(item.type) : false
  const typeIsRing    = item.type ? /ring/i.test(item.type)   : false
  return (nameHasShield || typeHasShield) && !typeIsRing
}

function isArmorItem(item: EquippedItem): boolean {
  const typeIsArmor = item.type ? /armo(?:r|ur)/i.test(item.type) : false
  const nameMatch   = matchArmor(item.name) !== null
  return typeIsArmor || nameMatch
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function calculateAC(input: ACInput): ACResult {
  const {
    statScores,
    equippedItems = [],
    activeEffects = [],
    race = '',
    className = '',
    subclass,
    level,
    characterClasses = [],
  } = input

  const DEX = mod(statScores.DEX ?? 10)
  const CON = mod(statScores.CON ?? 10)
  const INT = mod(statScores.INT ?? 10)
  const WIS = mod(statScores.WIS ?? 10)

  const breakdown: string[] = []
  let total = 10
  let armorCategory: ArmorCategory = 'none'

  // -------------------------------------------------------------------------
  // Step 1 — Natural armor (race)
  // -------------------------------------------------------------------------
  const raceLower = race.toLowerCase()
  let naturalArmorApplied = false

  if (raceLower.includes('tortle')) {
    total = 17
    armorCategory = 'natural'
    breakdown.push('Natural armor (Tortle shell): 17')
    naturalArmorApplied = true
  } else if (raceLower.includes('lizardfolk')) {
    total = 13 + DEX
    armorCategory = 'natural'
    breakdown.push(`Natural armor (Lizardfolk): 13 + ${DEX} DEX = ${total}`)
    naturalArmorApplied = true
  } else if (raceLower.includes('loxodon')) {
    total = 12 + CON
    armorCategory = 'natural'
    breakdown.push(`Natural armor (Loxodon): 12 + ${CON} CON = ${total}`)
    naturalArmorApplied = true
  }

  if (!naturalArmorApplied) {
    // -----------------------------------------------------------------------
    // Step 2 — Find equipped armor
    // -----------------------------------------------------------------------
    const equippedArmor = equippedItems.find(
      (item) => item.equipped && isArmorItem(item) && !isShield(item)
    ) ?? null

    // -----------------------------------------------------------------------
    // Step 3 — Calculate base AC from armor (or unarmored / mage armor)
    // -----------------------------------------------------------------------
    if (equippedArmor) {
      const armorEntry = matchArmor(equippedArmor.name)
      const magicBonus = parseMagicBonus(equippedArmor.name)
      const tableBase  = armorEntry?.base ?? 10
      const cat        = armorEntry?.category ?? 'light'
      armorCategory    = cat

      // Medium Armor Master raises medium-armor DEX cap from 2 → 3
      const mediumDexCap = activeEffects.some(
        (e) => (e.source_name ?? '').toLowerCase().includes('medium armor master')
      ) ? 3 : 2

      let dexContrib = 0
      let dexLabel   = ''
      if (cat === 'light') {
        dexContrib = DEX
        dexLabel   = `${DEX >= 0 ? '+' : ''}${DEX} DEX (light armor)`
      } else if (cat === 'medium') {
        dexContrib = Math.min(DEX, mediumDexCap)
        dexLabel   = `${dexContrib >= 0 ? '+' : ''}${dexContrib} DEX (medium armor, cap ${mediumDexCap})`
      } else {
        dexLabel   = '+0 DEX (heavy armor)'
      }

      const baseWithMagic = tableBase + magicBonus
      total = baseWithMagic + dexContrib

      const magicStr = magicBonus > 0 ? ` +${magicBonus} magic` : ''
      breakdown.push(`Base: ${baseWithMagic} (${equippedArmor.name}${magicStr})`)
      if (dexContrib !== 0 || cat === 'heavy') {
        breakdown.push(dexLabel)
      }
    } else {
      // No armor — check Mage Armor, then unarmored defense
      const mageArmorEffect = activeEffects.find(
        (e) => (e.source_name ?? '') === 'Mage Armor'
      )

      if (mageArmorEffect) {
        total = 13 + DEX
        armorCategory = 'mage_armor'
        breakdown.push(`Mage Armor: 13 + ${DEX} DEX = ${total}`)
      } else {
        // Unarmored defense — check in priority order
        const hasBladesong = activeEffects.some(
          (e) => (e.source_name ?? '').toLowerCase().includes('bladesong')
        )

        const allClasses = [
          { class_name: className, subclass: subclass ?? null },
          ...characterClasses.map((c) => ({
            class_name: c.class_name,
            subclass: c.subclass ?? null,
          })),
        ]

        const isBarbarian = allClasses.some(
          (c) => c.class_name === 'Barbarian'
        )
        const isMonk = allClasses.some(
          (c) => c.class_name === 'Monk'
        )
        const hasDraconicSubclass = allClasses.some(
          (c) => (c.subclass ?? '').toLowerCase().includes('draconic')
        )

        armorCategory = 'none'

        if (hasBladesong) {
          total = 10 + DEX + INT
          breakdown.push(
            `Unarmored (Bladesong): 10 + ${DEX} DEX + ${INT} INT = ${total}`
          )
        } else if (isBarbarian) {
          total = 10 + DEX + CON
          breakdown.push(
            `Unarmored (Barbarian): 10 + ${DEX} DEX + ${CON} CON = ${total}`
          )
        } else if (isMonk) {
          total = 10 + DEX + WIS
          breakdown.push(
            `Unarmored (Monk): 10 + ${DEX} DEX + ${WIS} WIS = ${total}`
          )
        } else if (hasDraconicSubclass) {
          total = 13 + DEX
          breakdown.push(
            `Unarmored (Draconic Resilience): 13 + ${DEX} DEX = ${total}`
          )
        } else {
          total = 10 + DEX
          breakdown.push(`Unarmored: 10 + ${DEX} DEX = ${total}`)
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // Step 5 — Shield
  // -------------------------------------------------------------------------
  const shieldItem = equippedItems.find((item) => item.equipped && isShield(item))
  if (shieldItem) {
    total += 2
    breakdown.push('+2 Shield')
  }

  // -------------------------------------------------------------------------
  // Step 6 — Active effect bonuses & minimums (collect minimums for step 8)
  // -------------------------------------------------------------------------
  const minimumEffects: ActiveEffect[] = []

  for (const effect of activeEffects) {
    if (effect.effect_type === 'ac_bonus') {
      total += effect.value
      breakdown.push(`+${effect.value} ${effect.effect_name}`)
    } else if (effect.effect_type === 'ac_set_minimum') {
      minimumEffects.push(effect)
    }
  }

  // -------------------------------------------------------------------------
  // Step 7 — Subclass / level bonuses (Forge Cleric)
  // -------------------------------------------------------------------------
  const allClassesForForge = [
    { class_name: className, subclass: subclass ?? null, level },
    ...characterClasses.map((c) => ({
      class_name: c.class_name,
      subclass: c.subclass ?? null,
      level: c.level,
    })),
  ]

  const isForgeCleric = allClassesForForge.some(
    (c) =>
      c.class_name === 'Cleric' &&
      (c.subclass ?? '').toLowerCase().includes('forge') &&
      c.level >= 6
  )

  if (isForgeCleric && armorCategory === 'heavy') {
    total += 1
    breakdown.push('+1 Soul of the Forge (Forge Cleric)')
  }

  // -------------------------------------------------------------------------
  // Step 8 — Apply minimums
  // -------------------------------------------------------------------------
  for (const effect of minimumEffects) {
    if (total < effect.value) {
      total = effect.value
      breakdown.push(`Set minimum ${effect.value} (${effect.effect_name})`)
    }
  }

  // -------------------------------------------------------------------------
  // Step 9 — Final total line
  // -------------------------------------------------------------------------
  breakdown.push(`= ${total} AC`)

  return { total, breakdown, armorCategory }
}
