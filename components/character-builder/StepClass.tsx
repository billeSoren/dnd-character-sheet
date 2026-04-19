import { classes } from '@/lib/dnd-data'
import { CharacterFormData } from './types'
import SelectionList, { SelectionItem } from './SelectionList'

const CLASS_ICONS: Record<string, string> = {
  Barbarian: '🪓', Bard: '🎵', Cleric: '⚕️', Druid: '🌿',
  Fighter: '🛡️', Monk: '👊', Paladin: '⚜️', Ranger: '🏹',
  Rogue: '🗡️', Sorcerer: '✨', Warlock: '👁️', Wizard: '🪄',
}

const CLASS_DESCRIPTIONS: Record<string, string> = {
  Barbarian: 'En hård kriger der kanaliserer primitiv raseri i kamp — næsten uovervindelig, men rå og instinktstyret.',
  Bard: 'En magisk kunstner hvis musik og historier inspirerer allierede, forvirrer fjender og åbner alle døre.',
  Cleric: 'En guddommelig tjener der svinger sin guds magt til at hele, beskytte og tilintetgøre.',
  Druid: 'En naturens vogter der udnytter elementære kræfter og kan transformere sig til dyr.',
  Fighter: 'En mester i kamp der udmærker sig i taktik, våben og rustning — disciplin frem for magi.',
  Monk: 'En martialkunstner der kanaliserer ki-energi til ødelæggende slag og overnaturlig mobilitet.',
  Paladin: 'En hellig kriger bundet af hellige eder — kombinerer kampkraft med guddommelig magi.',
  Ranger: 'En dygtig jæger og sporer der udmærker sig i vildmarken og mod foretrukne fjender.',
  Rogue: 'En snu trickster der angriber fra skyggerne og bygger på dygtighed og snuhed.',
  Sorcerer: 'En naturlig tryllekunstner hvis magi strømmer fra medfødt kraft og råt talent.',
  Warlock: 'En bruger af mystisk kraft tildelt af en pagt med et magtfuldt overnaturligt væsen.',
  Wizard: 'En videnskabelig magiker der mestrer arkane magi gennem studium og forberedelse.',
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
      { label: 'Færdighedsvalg', value: `${cls.skillChoices.choose} af ${cls.skillChoices.from.length}` },
      { label: 'Underklasser', value: cls.subclasses.slice(0, 3).join(', ') + (cls.subclasses.length > 3 ? '…' : '') },
    ],
  }))

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-dnd-text mb-1">Vælg klasse</h2>
        <p className="text-dnd-muted text-sm">Din klasse bestemmer dit hit die, evner og spillestil.</p>
      </div>
      <SelectionList
        items={items}
        selected={data.className}
        onSelect={(name) => onChange({ className: name, selectedSkills: [] })}
        placeholder="Søg klasser…"
      />
    </div>
  )
}
