import { backgrounds } from '@/lib/dnd-data'
import { CharacterFormData } from './types'
import SelectionList, { SelectionItem } from './SelectionList'

const BG_ICONS: Record<string, string> = {
  Acolyte: '🕊️', Charlatan: '🃏', Criminal: '🔪', Entertainer: '🎭',
  'Folk Hero': '🌾', 'Guild Artisan': '⚒️', Hermit: '📿', Noble: '👑',
  Outlander: '🗺️', Sage: '📚', Sailor: '⚓', Soldier: '🎖️', Urchin: '🐀',
}

const BG_DESCRIPTIONS: Record<string, string> = {
  Acolyte: 'Du brugte dine formative år i tjeneste for et tempel og lærte hellige ritualer og lære.',
  Charlatan: 'Du har altid haft en talent for at overbevise folk om, at du er en du ikke er.',
  Criminal: 'Du levede på den forkerte side af loven og udviklede dygtigheder i snigende og bedrag.',
  Entertainer: 'Du trivedes foran et publikum og lærte at optræde og aflæse en menneskemasse.',
  'Folk Hero': 'Fra ydmyge kår kaldte skæbnen dig til at blive befolkningens forsvarer.',
  'Guild Artisan': 'Du er en dygtig håndværker og gildeglem med handelskontakter og ekspertise.',
  Hermit: 'Du levede i isolation i årevis og søgte hemmeligheder og udviklede indre styrke.',
  Noble: 'Du forstår rigdom, magt og privilegier — og det ansvar de bærer.',
  Outlander: 'Du voksede op i vildmarken og lærte at overleve langt fra civilisationen.',
  Sage: 'Du tilbragte år med at studere gamle tomer og udviklede enorm viden om verden.',
  Sailor: 'Du har sejlet havene og kender rebene — bogstaveligt og billedligt.',
  Soldier: 'Du kæmpede i krige og lærte disciplin, taktik og krigens hårde virkelighed.',
  Urchin: 'Du voksede op på gaderne og udviklede snuhed og overlevelsesinstitikter.',
}

interface Props {
  data: CharacterFormData
  onChange: (data: Partial<CharacterFormData>) => void
}

export default function StepBackground({ data, onChange }: Props) {
  const items: SelectionItem[] = backgrounds.map((bg) => ({
    name: bg.name,
    source: "Player's Handbook",
    icon: BG_ICONS[bg.name],
    shortDesc: BG_DESCRIPTIONS[bg.name] ?? '',
    details: [
      { label: 'Færdigheder', value: bg.skillProficiencies.join(', ') },
      { label: 'Feature', value: bg.feature },
    ],
  }))

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-dnd-text mb-1">Vælg baggrund</h2>
        <p className="text-dnd-muted text-sm">Din baggrund fortæller din karakters historie inden eventyrene begyndte.</p>
      </div>
      <SelectionList
        items={items}
        selected={data.background}
        onSelect={(name) => onChange({ background: name })}
        placeholder="Søg baggrunde…"
      />
    </div>
  )
}
