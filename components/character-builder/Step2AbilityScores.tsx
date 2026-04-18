import { races } from '@/lib/dnd-data'
import { CharacterFormData, STAT_KEYS, STAT_LABELS, StatKey, modifier, modStr, rollStat } from './types'

interface Props {
  data: CharacterFormData
  onChange: (data: Partial<CharacterFormData>) => void
}

export default function Step2AbilityScores({ data, onChange }: Props) {
  const selectedRace = races.find((r) => r.name === data.race)

  const racialBonus = (stat: StatKey): number => {
    if (!selectedRace) return 0
    return selectedRace.abilityBonuses.find((b) => b.ability === stat)?.bonus ?? 0
  }

  const totalScore = (stat: StatKey) => data.baseStats[stat] + racialBonus(stat)

  const handleRollOne = (stat: StatKey) => {
    onChange({ baseStats: { ...data.baseStats, [stat]: rollStat() } })
  }

  const handleRollAll = () => {
    const newStats = Object.fromEntries(
      STAT_KEYS.map((k) => [k, rollStat()])
    ) as Record<StatKey, number>
    onChange({ baseStats: newStats })
  }

  const handleManualInput = (stat: StatKey, value: string) => {
    const n = parseInt(value, 10)
    if (!isNaN(n) && n >= 1 && n <= 30) {
      onChange({ baseStats: { ...data.baseStats, [stat]: n } })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-amber-200 mb-1">Evnescores</h2>
          <p className="text-stone-500 text-sm">Rul terninger eller indtast manuelt</p>
        </div>
        <button
          onClick={handleRollAll}
          className="flex items-center gap-2 px-4 py-2 bg-amber-900/40 hover:bg-amber-900/60 border border-amber-800/50 text-amber-300 rounded transition-colors text-sm font-medium"
        >
          🎲 Rul alle
        </button>
      </div>

      {data.race && selectedRace?.abilityBonuses.length ? (
        <div className="p-3 bg-stone-900/50 border border-amber-900/30 rounded text-sm text-stone-400">
          <span className="text-amber-400/70">Racielle bonuser fra {data.race}:</span>{' '}
          {selectedRace.abilityBonuses.map((b) => `${b.ability} +${b.bonus}`).join(', ')}
        </div>
      ) : null}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {STAT_KEYS.map((stat) => {
          const base = data.baseStats[stat]
          const bonus = racialBonus(stat)
          const total = totalScore(stat)
          const mod = modifier(total)

          return (
            <div
              key={stat}
              className="relative border border-stone-800 bg-stone-900/50 rounded-lg p-4 flex flex-col items-center gap-3"
            >
              <span className="text-xs font-bold text-amber-400/70 tracking-widest">{stat}</span>
              <span className="text-stone-500 text-xs">{STAT_LABELS[stat]}</span>

              {/* Score display */}
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-amber-100">{total}</span>
                <span
                  className={`text-sm font-semibold mt-0.5 ${
                    mod > 0 ? 'text-green-400' : mod < 0 ? 'text-red-400' : 'text-stone-500'
                  }`}
                >
                  {modStr(total)}
                </span>
              </div>

              {bonus !== 0 && (
                <div className="text-xs text-stone-500">
                  {base} <span className="text-amber-600">+{bonus}</span> race
                </div>
              )}

              {/* Input + roll */}
              <div className="flex items-center gap-1 w-full">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={base}
                  onChange={(e) => handleManualInput(stat, e.target.value)}
                  className="flex-1 w-0 px-2 py-1.5 bg-stone-800 border border-stone-700 focus:border-amber-600 rounded text-stone-100 text-center text-sm outline-none"
                />
                <button
                  onClick={() => handleRollOne(stat)}
                  title="Rul 4d6 drop lowest"
                  className="px-2 py-1.5 bg-amber-900/40 hover:bg-amber-900/60 border border-amber-800/40 text-amber-400 rounded transition-colors text-sm"
                >
                  🎲
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-stone-600 text-xs">
        🎲 Rul 4d6 og drop den laveste terning. Minimum score er 1, maksimum er 30.
      </p>
    </div>
  )
}
