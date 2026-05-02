export interface MagicItem {
  id: string
  name: string
  type: string | null
  rarity: string | null
  requires_attunement: boolean | null
  description: string | null
  source: string | null
}

export interface CharacterItem {
  id: string
  character_id: string
  item_id: string
  equipped: boolean
  attuned: boolean
  added_at: string
}

export interface CharacterItemWithItem extends CharacterItem {
  magic_items: MagicItem
}

// ── Rarity helpers ─────────────────────────────────────────────────────────────

export function rarityColor(rarity: string | null): string {
  switch (rarity?.toLowerCase()) {
    case 'common':    return 'text-gray-400'
    case 'uncommon':  return 'text-green-400'
    case 'rare':      return 'text-blue-400'
    case 'very rare': return 'text-purple-400'
    case 'legendary': return 'text-orange-400'
    case 'artifact':  return 'text-yellow-400'
    default:          return 'text-dnd-muted'
  }
}

export function rarityBorder(rarity: string | null): string {
  switch (rarity?.toLowerCase()) {
    case 'uncommon':  return 'border-green-500/30'
    case 'rare':      return 'border-blue-500/30'
    case 'very rare': return 'border-purple-500/40'
    case 'legendary': return 'border-orange-500/50'
    case 'artifact':  return 'border-yellow-500/50'
    default:          return 'border-dnd-border'
  }
}

// ── Weapon helpers ─────────────────────────────────────────────────────────────

/** Parse +1 / +2 / +3 magic bonus from item name */
export function magicBonus(name: string): number {
  const m = name.match(/\+(\d)/)
  return m ? parseInt(m[1], 10) : 0
}

// Ordered so longer names (greatsword) are tested before shorter (sword)
const WEAPON_TABLE: [string, string, string][] = [
  ['greatsword',   '2d6',  'slashing'],
  ['greataxe',     '1d12', 'slashing'],
  ['maul',         '2d6',  'bludgeoning'],
  ['glaive',       '1d10', 'slashing'],
  ['halberd',      '1d10', 'slashing'],
  ['pike',         '1d10', 'piercing'],
  ['lance',        '1d12', 'piercing'],
  ['longsword',    '1d8',  'slashing'],
  ['battleaxe',    '1d8',  'slashing'],
  ['warhammer',    '1d8',  'bludgeoning'],
  ['rapier',       '1d8',  'piercing'],
  ['flail',        '1d8',  'bludgeoning'],
  ['morningstar',  '1d8',  'piercing'],
  ['war pick',     '1d8',  'piercing'],
  ['shortsword',   '1d6',  'piercing'],
  ['scimitar',     '1d6',  'slashing'],
  ['handaxe',      '1d6',  'slashing'],
  ['mace',         '1d6',  'bludgeoning'],
  ['quarterstaff', '1d6',  'bludgeoning'],
  ['spear',        '1d6',  'piercing'],
  ['trident',      '1d6',  'piercing'],
  ['javelin',      '1d6',  'piercing'],
  ['sword',        '1d8',  'slashing'],   // generic fallback
  ['axe',          '1d8',  'slashing'],
  ['dagger',       '1d4',  'piercing'],
  ['whip',         '1d4',  'slashing'],
  ['dart',         '1d4',  'piercing'],
  ['sling',        '1d4',  'bludgeoning'],
  ['longbow',      '1d8',  'piercing'],
  ['shortbow',     '1d6',  'piercing'],
  ['crossbow',     '1d8',  'piercing'],
  ['bow',          '1d6',  'piercing'],
  ['club',         '1d4',  'bludgeoning'],
]

const FINESSE_KEYWORDS = ['dagger', 'rapier', 'shortsword', 'scimitar', 'whip']

export function weaponDamage(name: string): { die: string; type: string } | null {
  const lower = name.toLowerCase()
  for (const [key, die, type] of WEAPON_TABLE) {
    if (lower.includes(key)) return { die, type }
  }
  return null
}

export function isFinesseWeapon(name: string): boolean {
  const lower = name.toLowerCase()
  return FINESSE_KEYWORDS.some((k) => lower.includes(k))
}

export function isWeaponType(type: string | null): boolean {
  return !!type?.toLowerCase().includes('weapon')
}
