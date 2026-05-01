import { classes, races, backgrounds } from '@/lib/dnd-data'
import { CharacterFormData } from './types'

interface Props {
  data: CharacterFormData
  onChange: (data: Partial<CharacterFormData>) => void
}

export default function Step1BasicInfo({ data, onChange }: Props) {
  const selectedRace = races.find((r) => r.name === data.race)
  const selectedClass = classes.find((c) => c.name === data.className)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-200 mb-1">Grundlæggende oplysninger</h2>
        <p className="text-stone-500 text-sm">Fortæl os om din karakter</p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm text-amber-300/80 mb-1.5" htmlFor="char-name">
          Navn
        </label>
        <input
          id="char-name"
          type="text"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Hvad hedder din karakter?"
          className="w-full px-4 py-2.5 bg-stone-800/80 border border-stone-700 focus:border-amber-600 rounded text-stone-100 placeholder-stone-600 outline-none transition-colors"
        />
      </div>

      {/* Race */}
      <div>
        <label className="block text-sm text-amber-300/80 mb-1.5" htmlFor="char-race">
          Race
        </label>
        <select
          id="char-race"
          value={data.race}
          onChange={(e) => onChange({ race: e.target.value })}
          className="w-full px-4 py-2.5 bg-stone-800/80 border border-stone-700 focus:border-amber-600 rounded text-stone-100 outline-none transition-colors"
        >
          <option value="">Vælg race…</option>
          {races.map((r) => (
            <option key={r.name} value={r.name}>{r.name}</option>
          ))}
        </select>
        {selectedRace && (
          <div className="mt-2 p-3 bg-stone-900/50 border border-stone-800 rounded text-sm space-y-1">
            <p className="text-stone-400">
              <span className="text-amber-400/70">Hastighed:</span> {selectedRace.speed} ft ·{' '}
              <span className="text-amber-400/70">Størrelse:</span> {selectedRace.size}
            </p>
            {selectedRace.abilityBonuses.length > 0 && (
              <p className="text-stone-400">
                <span className="text-amber-400/70">Evne bonuser:</span>{' '}
                {selectedRace.abilityBonuses.map((b) => `${b.ability} +${b.bonus}`).join(', ')}
              </p>
            )}
            {selectedRace.traits.length > 0 && (
              <p className="text-stone-400">
                <span className="text-amber-400/70">Træk:</span> {selectedRace.traits.join(', ')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Class */}
      <div>
        <label className="block text-sm text-amber-300/80 mb-1.5" htmlFor="char-class">
          Klasse
        </label>
        <select
          id="char-class"
          value={data.className}
          onChange={(e) => onChange({ className: e.target.value, selectedSkills: [] })}
          className="w-full px-4 py-2.5 bg-stone-800/80 border border-stone-700 focus:border-amber-600 rounded text-stone-100 outline-none transition-colors"
        >
          <option value="">Vælg klasse…</option>
          {classes.map((c) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
        {selectedClass && (
          <div className="mt-2 p-3 bg-stone-900/50 border border-stone-800 rounded text-sm space-y-1">
            <p className="text-stone-400">
              <span className="text-amber-400/70">Hit Die:</span> d{selectedClass.hitDie}
            </p>

          </div>
        )}
      </div>

      {/* Background */}
      <div>
        <label className="block text-sm text-amber-300/80 mb-1.5" htmlFor="char-bg">
          Baggrund
        </label>
        <select
          id="char-bg"
          value={data.background}
          onChange={(e) => onChange({ background: e.target.value })}
          className="w-full px-4 py-2.5 bg-stone-800/80 border border-stone-700 focus:border-amber-600 rounded text-stone-100 outline-none transition-colors"
        >
          <option value="">Vælg baggrund…</option>
          {backgrounds.map((b) => (
            <option key={b.name} value={b.name}>{b.name}</option>
          ))}
        </select>
        {data.background && (() => {
          const bg = backgrounds.find((b) => b.name === data.background)!
          return (
            <div className="mt-2 p-3 bg-stone-900/50 border border-stone-800 rounded text-sm space-y-1">
              <p className="text-stone-400">
                <span className="text-amber-400/70">Færdigheder:</span> {bg.skillProficiencies.join(', ')}
              </p>
              <p className="text-stone-400">
                <span className="text-amber-400/70">Feature:</span> {bg.feature}
              </p>
            </div>
          )
        })()}
      </div>

      {/* Level */}
      <div>
        <label className="block text-sm text-amber-300/80 mb-1.5" htmlFor="char-level">
          Niveau <span className="text-stone-600">(1–20)</span>
        </label>
        <input
          id="char-level"
          type="number"
          min={1}
          max={20}
          value={data.level}
          onChange={(e) => onChange({ level: Math.min(20, Math.max(1, Number(e.target.value))) })}
          className="w-32 px-4 py-2.5 bg-stone-800/80 border border-stone-700 focus:border-amber-600 rounded text-stone-100 outline-none transition-colors"
        />
      </div>
    </div>
  )
}
