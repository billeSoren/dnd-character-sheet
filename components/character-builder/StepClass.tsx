import { classes } from '@/lib/dnd-data'
import { CharacterFormData } from './types'
import SelectionList, { SelectionItem } from './SelectionList'

const CLASS_ICONS: Record<string, string> = {
  Barbarian: '🪓', Bard: '🎵', Cleric: '⚕️', Druid: '🌿',
  Fighter: '🛡️', Monk: '👊', Paladin: '⚜️', Ranger: '🏹',
  Rogue: '🗡️', Sorcerer: '✨', Warlock: '👁️', Wizard: '🪄',
}

const CLASS_DESCRIPTIONS: Record<string, string> = {
  Barbarian: 'A fierce warrior who channels primal rage in battle — nearly unstoppable, but raw and instinct-driven.',
  Bard: 'A magical performer whose music and stories inspire allies, confuse enemies, and open every door.',
  Cleric: 'A divine servant who wields their god\'s power to heal, protect, and destroy.',
  Druid: 'A guardian of nature who harnesses elemental forces and can transform into animals.',
  Fighter: 'A master of combat who excels in tactics, weapons, and armour — discipline over magic.',
  Monk: 'A martial artist who channels ki energy into devastating strikes and supernatural mobility.',
  Paladin: 'A holy warrior bound by sacred oaths — combining martial prowess with divine magic.',
  Ranger: 'A skilled hunter and tracker who excels in the wilderness and against favored enemies.',
  Rogue: 'A cunning trickster who strikes from the shadows, relying on skill and wit.',
  Sorcerer: 'A natural spellcaster whose magic flows from innate power and raw talent.',
  Warlock: 'A wielder of eldritch power granted by a pact with a mighty supernatural being.',
  Wizard: 'A scholarly mage who masters arcane magic through study and preparation.',
}

interface Props {
  data: CharacterFormData
  onChange: (data: Partial<CharacterFormData>) => void
}

export default function StepClass({ data, onChange }: Props) {
  const items: SelectionItem[] = classes.map((cls) => ({
    name: cls.name,
    source: "Player's Handbook",
    icon: CLASS_ICONS[cls.name],
    shortDesc: CLASS_DESCRIPTIONS[cls.name] ?? '',
    details: [
      { label: 'Hit Die', value: `d${cls.hitDie}` },
      { label: 'Saving Throws', value: cls.savingThrows.join(', ') },
      { label: 'Skill Choices', value: `${cls.skillChoices.choose} of ${cls.skillChoices.from.length}` },
      { label: 'Subclasses', value: cls.subclasses.slice(0, 3).join(', ') + (cls.subclasses.length > 3 ? '…' : '') },
    ],
  }))

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-dnd-text mb-1">Choose a Class</h2>
        <p className="text-dnd-muted text-sm">Your class determines your hit die, abilities, and playstyle.</p>
      </div>
      <SelectionList
        items={items}
        selected={data.className}
        onSelect={(name) => onChange({ className: name, selectedSkills: [] })}
        placeholder="Search classes…"
      />
    </div>
  )
}
