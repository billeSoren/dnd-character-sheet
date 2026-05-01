import { DndClass, DEFAULT_SOURCE } from '@/lib/dnd-api'
import { CharacterFormData } from './types'
import SelectionList, { SelectionItem } from './SelectionList'
import StepLoadingSkeleton from './StepLoadingSkeleton'

const CLASS_ICONS: Record<string, string> = {
  Artificer: '⚙️', Barbarian: '🪓', Bard: '🎵', 'Blood Hunter': '🩸',
  Cleric: '⚕️', Druid: '🌿', Fighter: '🛡️', Monk: '👊',
  Paladin: '⚜️', Ranger: '🏹', Rogue: '🗡️', Sorcerer: '✨',
  Warlock: '👁️', Wizard: '🪄',
}

const CLASS_DESCRIPTIONS: Record<string, string> = {
  Artificer: 'An inventor who channels magic through tools and ingenious contraptions.',
  'Blood Hunter': 'A monster hunter who sacrifices their own vitality to fuel deadly powers.',
  Barbarian: 'A fierce warrior who channels primal rage in battle — nearly unstoppable, but raw and instinct-driven.',
  Bard: 'A magical performer whose music and stories inspire allies, confuse enemies, and open every door.',
  Cleric: "A divine servant who wields their god's power to heal, protect, and destroy.",
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
  classes: DndClass[]
  loading?: boolean
}

export default function StepClass({ data, onChange, classes, loading }: Props) {
  if (loading) {
    return (
      <StepLoadingSkeleton
        title="Choose a Class"
        description="Your class determines your hit die, abilities, and playstyle."
      />
    )
  }

  const items: SelectionItem[] = classes.map((cls) => ({
    name: cls.name,
    source: cls.source || DEFAULT_SOURCE,
    icon: CLASS_ICONS[cls.name],
    shortDesc: CLASS_DESCRIPTIONS[cls.name] ?? cls.description?.slice(0, 120) ?? '',
    details: [
      { label: 'Hit Die', value: `d${cls.hit_die}` },
      { label: 'Saving Throws', value: (cls.saving_throws ?? []).join(', ') || '—' },
      {
        label: 'Skill Choices',
        value: (cls.num_skill_choices ?? 0) > 0
          ? `${cls.num_skill_choices} of ${(cls.skill_choices ?? []).length}`
          : '—',
      },
      {
        label: 'Subclasses',
        value: (cls.subclasses ?? []).length > 0
          ? cls.subclasses.slice(0, 3).join(', ') + (cls.subclasses.length > 3 ? '…' : '')
          : '—',
      },
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
        onSelect={(name) => {
          const cls = classes.find((c) => c.name === name)
          onChange({ className: name, classId: cls?.id ?? null, selectedSkills: [] })
        }}
        placeholder="Search classes…"
      />
    </div>
  )
}
