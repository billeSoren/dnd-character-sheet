import { races } from '@/lib/dnd-data'
import { CharacterFormData } from './types'
import SelectionList, { SelectionItem } from './SelectionList'

const RACE_ICONS: Record<string, string> = {
  Dwarf: '⛏️', Elf: '🌙', Halfling: '🍀', Human: '👤',
  Dragonborn: '🐉', Gnome: '🔬', 'Half-Elf': '🌅', 'Half-Orc': '🪨', Tiefling: '🔥',
}

const RACE_DESCRIPTIONS: Record<string, string> = {
  Dwarf: 'Hårdføre og udholdende dværge er ekspertshåndværkere og barske krigere fra bjergets fæstninger.',
  Elf: 'Yndefulde og langlivede alver er naturlige tryllekunstnere med skarpe sanser og uendelig nysgerrighed.',
  Halfling: 'Små og smidige halvlinge er bemærkelsesværdigt heldige, modige og dygtige til at undgå fare.',
  Human: 'Ambitiøse og tilpasningsdygtige mennesker er den mest udbredte race med talent for alt.',
  Dragonborn: 'Stolte og ærefulde krigere der bærer træk og kræfter fra drakekind.',
  Gnome: 'Entusiastiske og opfindsomme gnomd er naturlige mekanikere med kærlighed til magi og gåder.',
  'Half-Elf': 'Kombinerer det bedste fra begge verdener — karismatiske og alsidige eventyrer.',
  'Half-Orc': 'Stærke og frygtløse halvork har en ubønhørlig drive og orkenes vildhed.',
  Tiefling: 'Præget af djævlisk arv — modstandsdygtige overlevere med medfødte magiske gaver.',
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
      { label: 'Størrelse', value: r.size },
      { label: 'Hastighed', value: `${r.speed} ft` },
      ...(r.abilityBonuses.length > 0
        ? [{ label: 'Evnebonuser', value: r.abilityBonuses.map((b) => `${b.ability} +${b.bonus}`).join(', ') }]
        : []),
      ...(r.traits.length > 0
        ? [{ label: 'Træk', value: r.traits.slice(0, 4).join(', ') + (r.traits.length > 4 ? '…' : '') }]
        : []),
    ],
  }))

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-dnd-text mb-1">Vælg species</h2>
        <p className="text-dnd-muted text-sm">Din species giver din karakter unikke evnebonuser og raciale træk.</p>
      </div>
      <SelectionList
        items={items}
        selected={data.race}
        onSelect={(name) => onChange({ race: name })}
        placeholder="Søg species…"
      />
    </div>
  )
}
