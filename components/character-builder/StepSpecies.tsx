import { DndRace, formatAbilityBonuses, DEFAULT_SOURCE } from '@/lib/dnd-api'
import { CharacterFormData } from './types'
import SelectionList, { SelectionItem } from './SelectionList'
import StepLoadingSkeleton from './StepLoadingSkeleton'

const RACE_ICONS: Record<string, string> = {
  Dwarf: '⛏️', Elf: '🌙', Halfling: '🍀', Human: '👤',
  Dragonborn: '🐉', Gnome: '🔬', 'Half-Elf': '🌅', 'Half-Orc': '🪨', Tiefling: '🔥',
  Aasimar: '✨', Goliath: '🏔️', Tabaxi: '🐱', Firbolg: '🌲', Kenku: '🐦',
  Lizardfolk: '🦎', Triton: '🌊', Bugbear: '👹', Goblin: '👺', Hobgoblin: '⚔️',
  Kobold: '🐍', Orc: '🪨', Yuan_ti: '🐍',
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
  races: DndRace[]
  loading?: boolean
}

export default function StepSpecies({ data, onChange, races, loading }: Props) {
  if (loading) {
    return (
      <StepLoadingSkeleton
        title="Choose a Species"
        description="Your species grants your character unique ability bonuses and racial traits."
      />
    )
  }

  const items: SelectionItem[] = races.map((r) => {
    const bonusStr = r.ability_bonuses ? formatAbilityBonuses(r.ability_bonuses) : ''
    return {
      name: r.name,
      source: r.source || DEFAULT_SOURCE,
      icon: RACE_ICONS[r.name],
      shortDesc: RACE_DESCRIPTIONS[r.name] ?? r.description?.slice(0, 120) ?? '',
      details: [
        { label: 'Size', value: r.size || '—' },
        { label: 'Speed', value: r.speed ? `${r.speed} ft` : '—' },
        ...(bonusStr ? [{ label: 'Ability Bonuses', value: bonusStr }] : []),
        ...((r.traits ?? []).length > 0
          ? [{ label: 'Traits', value: r.traits.slice(0, 4).join(', ') + (r.traits.length > 4 ? '…' : '') }]
          : []),
      ],
    }
  })

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-dnd-text mb-1">Choose a Species</h2>
        <p className="text-dnd-muted text-sm">Your species grants your character unique ability bonuses and racial traits.</p>
      </div>
      <SelectionList
        items={items}
        selected={data.race}
        onSelect={(name) => {
          const race = races.find((r) => r.name === name)
          onChange({ race: name, raceId: race?.id ?? null })
        }}
        placeholder="Search species…"
      />
    </div>
  )
}
