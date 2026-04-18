import { classes, races, backgrounds } from '@/lib/dnd-data'
import {
  CharacterFormData,
  STAT_KEYS,
  STAT_LABELS,
  StatKey,
  modifier,
  modStr,
  calculateMaxHP,
} from './types'

interface Props {
  data: CharacterFormData
  onSave: () => void
  saving: boolean
  error: string
}

export default function Step5Summary({ data, onSave, saving, error }: Props) {
  const selectedClass = classes.find((c) => c.name === data.className)
  const selectedRace = races.find((r) => r.name === data.race)
  const selectedBg = backgrounds.find((b) => b.name === data.background)

  const racialBonus = (stat: StatKey) =>
    selectedRace?.abilityBonuses.find((b) => b.ability === stat)?.bonus ?? 0

  const totalStat = (stat: StatKey) => data.baseStats[stat] + racialBonus(stat)
  const hitDie = selectedClass?.hitDie ?? 8
  const conMod = modifier(totalStat('CON'))
  const maxHP = calculateMaxHP(hitDie, conMod, data.level)
  const allSkills = [...(selectedBg?.skillProficiencies ?? []), ...data.selectedSkills]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-200 mb-1">Opsummering</h2>
        <p className="text-stone-500 text-sm">Gennemgå din karakter inden du gemmer</p>
      </div>

      {/* Identity */}
      <div className="border border-amber-900/30 bg-stone-900/40 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-amber-900/20 border-b border-amber-900/20">
          <h3 className="text-sm font-semibold text-amber-400/80 uppercase tracking-wider">Identitet</h3>
        </div>
        <div className="grid grid-cols-2 divide-x divide-stone-800 text-sm">
          <div className="px-4 py-3 space-y-2">
            <div>
              <span className="text-stone-500 block text-xs">Navn</span>
              <span className="text-amber-100 font-semibold">{data.name}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-xs">Race</span>
              <span className="text-stone-200">{data.race}</span>
            </div>
          </div>
          <div className="px-4 py-3 space-y-2">
            <div>
              <span className="text-stone-500 block text-xs">Klasse</span>
              <span className="text-stone-200">{data.className} (d{hitDie})</span>
            </div>
            <div>
              <span className="text-stone-500 block text-xs">Baggrund · Niveau</span>
              <span className="text-stone-200">{data.background} · {data.level}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="border border-stone-800 bg-stone-900/40 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-stone-900/60 border-b border-stone-800">
          <h3 className="text-sm font-semibold text-amber-400/80 uppercase tracking-wider">Evnescores</h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-stone-800">
          {STAT_KEYS.map((stat) => {
            const total = totalStat(stat)
            const mod = modifier(total)
            return (
              <div key={stat} className="py-3 px-2 text-center">
                <div className="text-xs text-amber-400/60">{stat}</div>
                <div className="text-xl font-bold text-amber-100 mt-1">{total}</div>
                <div className={`text-xs font-medium ${mod > 0 ? 'text-green-400' : mod < 0 ? 'text-red-400' : 'text-stone-500'}`}>
                  {modStr(total)}
                </div>
                <div className="text-xs text-stone-600 mt-0.5 hidden sm:block">{STAT_LABELS[stat]}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* HP + Skills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-stone-800 bg-stone-900/40 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider mb-3">Hit Points</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-amber-200">{maxHP}</span>
            <span className="text-stone-500 text-sm">max HP</span>
          </div>
          <p className="text-stone-600 text-xs mt-1">d{hitDie} + CON {modStr(conMod)} × niveau {data.level}</p>
        </div>

        <div className="border border-stone-800 bg-stone-900/40 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider mb-3">Færdigheder ({allSkills.length})</h3>
          <div className="flex flex-wrap gap-1.5">
            {allSkills.map((s) => (
              <span key={s} className="text-xs text-stone-300 bg-stone-800 px-2 py-0.5 rounded">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-900/20 border border-red-900/40 rounded px-3 py-2">
          {error}
        </p>
      )}

      <button
        onClick={onSave}
        disabled={saving}
        className="w-full py-3 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-stone-100 font-bold rounded transition-colors shadow-lg shadow-amber-900/30 text-lg"
      >
        {saving ? 'Gemmer karakter…' : '⚔️ Opret karakter'}
      </button>
    </div>
  )
}
