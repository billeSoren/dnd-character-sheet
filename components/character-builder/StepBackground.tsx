import { DndBackground, DEFAULT_SOURCE } from '@/lib/dnd-api'
import { CharacterFormData } from './types'
import SelectionList, { SelectionItem } from './SelectionList'
import StepLoadingSkeleton from './StepLoadingSkeleton'

const BG_ICONS: Record<string, string> = {
  Acolyte: '🕊️', Charlatan: '🃏', Criminal: '🔪', Entertainer: '🎭',
  'Folk Hero': '🌾', 'Guild Artisan': '⚒️', Hermit: '📿', Noble: '👑',
  Outlander: '🗺️', Sage: '📚', Sailor: '⚓', Soldier: '🎖️', Urchin: '🐀',
}

const BG_DESCRIPTIONS: Record<string, string> = {
  Acolyte: 'You spent your formative years in service of a temple, learning sacred rites and doctrine.',
  Charlatan: 'You have always had a talent for convincing people you are someone you are not.',
  Criminal: 'You lived on the wrong side of the law, developing skills in stealth and deception.',
  Entertainer: 'You thrived in front of an audience, learning to perform and read a crowd.',
  'Folk Hero': "From humble origins, fate called you to become the people's champion.",
  'Guild Artisan': 'You are a skilled craftsperson and guild member with trade contacts and expertise.',
  Hermit: 'You lived in isolation for years, seeking secrets and developing inner strength.',
  Noble: 'You understand wealth, power, and privilege — and the responsibility they carry.',
  Outlander: 'You grew up in the wilderness, learning to survive far from civilisation.',
  Sage: 'You spent years studying ancient tomes, developing vast knowledge of the world.',
  Sailor: 'You have sailed the seas and know the ropes — literally and figuratively.',
  Soldier: 'You fought in wars and learned discipline, tactics, and the harsh reality of battle.',
  Urchin: 'You grew up on the streets, developing cunning and survival instincts.',
}

interface Props {
  data: CharacterFormData
  onChange: (data: Partial<CharacterFormData>) => void
  backgrounds: DndBackground[]
  loading?: boolean
}

export default function StepBackground({ data, onChange, backgrounds, loading }: Props) {
  if (loading) {
    return (
      <StepLoadingSkeleton
        title="Choose a Background"
        description="Your background tells the story of your character before the adventures began."
      />
    )
  }

  const items: SelectionItem[] = backgrounds.map((bg) => ({
    name: bg.name,
    source: bg.source || DEFAULT_SOURCE,
    icon: BG_ICONS[bg.name],
    shortDesc: BG_DESCRIPTIONS[bg.name] ?? bg.description?.slice(0, 120) ?? '',
    details: [
      { label: 'Skills', value: (bg.skill_proficiencies ?? []).join(', ') || '—' },
      { label: 'Feature', value: bg.feature_name || '—' },
      ...(bg.tool_proficiencies?.length
        ? [{ label: 'Tools', value: bg.tool_proficiencies.join(', ') }]
        : []),
    ],
  }))

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-dnd-text mb-1">Choose a Background</h2>
        <p className="text-dnd-muted text-sm">Your background tells the story of your character before the adventures began.</p>
      </div>
      <SelectionList
        items={items}
        selected={data.background}
        onSelect={(name) => {
          const bg = backgrounds.find((b) => b.name === name)
          onChange({ background: name, backgroundId: bg?.id ?? null })
        }}
        placeholder="Search backgrounds…"
      />
    </div>
  )
}
