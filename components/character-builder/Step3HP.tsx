import { classes, races } from '@/lib/dnd-data'
import { CharacterFormData, STAT_KEYS, STAT_LABELS, StatKey, modifier, modStr, calculateMaxHP } from './types'

interface Props {
  data: CharacterFormData
}

export default function Step3HP({ data }: Props) {
  const selectedClass = classes.find((c) => c.name === data.className)
  const selectedRace = races.find((r) => r.name === data.race)

  const racialBonus = (stat: StatKey) =>
    selectedRace?.abilityBonuses.find((b) => b.ability === stat)?.bonus ?? 0

  const totalCON = data.baseStats.CON + racialBonus('CON')
  const conMod = modifier(totalCON)
  const hitDie = selectedClass?.hitDie ?? 8
  const maxHP = calculateMaxHP(hitDie, conMod, data.level)

  const avgPerLevel = Math.floor(hitDie / 2) + 1

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-200 mb-1">Hit Points</h2>
        <p className="text-stone-500 text-sm">Beregnet ud fra klasse og udholdenhed</p>
      </div>

      {/* HP result */}
      <div className="flex flex-col items-center py-8 border border-amber-900/30 bg-stone-900/40 rounded-lg">
        <span className="text-stone-500 text-sm mb-2">Maksimale Hit Points</span>
        <span className="text-7xl font-bold text-amber-200">{maxHP}</span>
        <span className="text-stone-500 text-sm mt-2">Current HP = {maxHP}</span>
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-amber-400/70 uppercase tracking-wider">Udregning</h3>

        <div className="border border-stone-800 bg-stone-900/40 rounded-lg divide-y divide-stone-800 text-sm">
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-stone-400">Klasse Hit Die</span>
            <span className="text-amber-200 font-medium">d{hitDie} ({data.className || '—'})</span>
          </div>
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-stone-400">Niveau 1 HP</span>
            <span className="text-amber-200 font-medium">
              {hitDie} (max) {conMod >= 0 ? '+' : ''}{conMod} CON = {hitDie + conMod}
            </span>
          </div>
          {data.level > 1 && (
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-stone-400">Niveau 2–{data.level} (gennemsnit)</span>
              <span className="text-amber-200 font-medium">
                {data.level - 1} × {Math.max(1, avgPerLevel + conMod)} = {(data.level - 1) * Math.max(1, avgPerLevel + conMod)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center px-4 py-3 bg-amber-900/10">
            <span className="text-amber-300 font-semibold">Total</span>
            <span className="text-amber-200 font-bold text-lg">{maxHP}</span>
          </div>
        </div>
      </div>

      {/* Stats overview */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-amber-400/70 uppercase tracking-wider">Evnescores (med racielle bonuser)</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {STAT_KEYS.map((stat) => {
            const bonus = racialBonus(stat)
            const total = data.baseStats[stat] + bonus
            const mod = modifier(total)
            return (
              <div key={stat} className="border border-stone-800 bg-stone-900/40 rounded p-2 text-center">
                <div className="text-xs text-amber-400/60 mb-1">{stat}</div>
                <div className="text-lg font-bold text-amber-100">{total}</div>
                <div className={`text-xs font-medium ${mod > 0 ? 'text-green-400' : mod < 0 ? 'text-red-400' : 'text-stone-500'}`}>
                  {modStr(total)}
                </div>
                <div className="text-xs text-stone-600 mt-0.5">{STAT_LABELS[stat]}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
