import { races } from '@/lib/dnd-data'
import { CharacterFormData } from './types'
import SelectionList, { SelectionItem } from './SelectionList'

const RACE_ICONS: Record<string, string> = {
  Dwarf: '⛏️', Elf: '🌙', Halfling: '🍀', Human: '👤',
  Dragonborn: '🐉', Gnome: '🔬', 'Half-Elf': '🌅', 'Half-Orc': '🪨', Tiefling: '🔥',
}

const RACE_DESCRIPTIONS: Record<string, string> = {
  Dwarf: 'Hardy and enduring dwarves are expert craftspeople and fierce warriors from mountain strongholds.',
  Elf: 'Graceful and long-lived elves are natural spellcasters with keen senses and endless curiosity.',
  Halfling: 'Small and nimble halflings are remarkably lucky, courageous, and skilled at avoiding danger.',
  Human: 'Ambitious and adaptable humans are the most widespread race, with talent for everything.',
  Dragonborn: 'Proud and honourable warriors bearing the traits and powers of dragonkind.',
  Gnome: 'Enthusiastic and inventive gnomes are natural tinkerers with a love of magic and puzzles.',
  'Half-Elf': 'Combines the best of both worlds — charismatic and versatile adventurers.',
  'Half-Orc': 'Strong and fearless half-orcs have an unstoppable drive and the ferocity of orcs.',
  Tiefling: 'Marked by infernal heritage — resilient survivors with innate magical gifts.',
}

interface Props {
  data: CharacterFormData
  onChange: (data: Partial<CharacterFormData>) => void
}

export default function StepSpecies({ data, onChange }: Props) {
  const items: SelectionItem[] = races.map((r) => ({
    name: r.name,
    source: "Player's Handbook",
    icon: RACE_ICONS[r.name],
    shortDesc: RACE_DESCRIPTIONS[r.name] ?? '',
    details: [
      { label: 'Size', value: r.size },
      { label: 'Speed', value: `${r.speed} ft` },
      ...(r.abilityBonuses.length > 0
        ? [{ label: 'Ability Bonuses', value: r.abilityBonuses.map((b) => `${b.ability} +${b.bonus}`).join(', ') }]
        : []),
      ...(r.traits.length > 0
        ? [{ label: 'Traits', value: r.traits.slice(0, 4).join(', ') + (r.traits.length > 4 ? '…' : '') }]
        : []),
    ],
  }))

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-dnd-text mb-1">Choose a Species</h2>
        <p className="text-dnd-muted text-sm">Your species grants your character unique ability bonuses and racial traits.</p>
      </div>
      <SelectionList
        items={items}
        selected={data.race}
        onSelect={(name) => onChange({ race: name })}
        placeholder="Search species…"
      />
    </div>
  )
}
