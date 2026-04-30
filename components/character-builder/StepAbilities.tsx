'use client'

import { races } from '@/lib/dnd-data'
import {
  CharacterFormData, StatKey, STAT_KEYS, STAT_LABELS,
  AbilityMethod, STANDARD_ARRAY, PB_COST, PB_BUDGET,
  modifier, modStr, rollStat, totalPBSpent,
} from './types'

interface Props {
  data: CharacterFormData
  onChange: (data: Partial<CharacterFormData>) => void
}

const METHOD_LABELS: Record<AbilityMethod, string> = {
  standard: 'Standard Array',
  pointbuy: 'Point Buy',
  manual: 'Manual / Roll',
}

export default function StepAbilities({ data, onChange }: Props) {
  const selectedRace = races.find((r) => r.name === data.race)

  const racialBonus = (stat: StatKey): number =>
    selectedRace?.abilityBonuses.find((b) => b.ability === stat)?.bonus ?? 0

  const totalScore = (stat: StatKey) => data.baseStats[stat] + racialBonus(stat)

  const switchMethod = (method: AbilityMethod) => {
    if (method === 'standard') {
      onChange({
        abilityMethod: method,
        baseStats: { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 },
        standardArrayAssignments: { STR: null, DEX: null, CON: null, INT: null, WIS: null, CHA: null },
      })
    } else if (method === 'pointbuy') {
      onChange({ abilityMethod: method, baseStats: { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 } })
    } else {
      onChange({ abilityMethod: method })
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-dnd-text mb-1">Ability Scores</h2>
        <p className="text-dnd-muted text-sm">Assign your base ability scores.</p>
      </div>

      {/* Method tabs */}
      <div className="flex rounded-lg border border-dnd-border overflow-hidden mb-6">
        {(['standard', 'pointbuy', 'manual'] as AbilityMethod[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMethod(m)}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              data.abilityMethod === m
                ? 'bg-dnd-accent text-white'
                : 'bg-dnd-subtle text-dnd-muted hover:text-dnd-text'
            }`}
          >
            {METHOD_LABELS[m]}
          </button>
        ))}
      </div>

      {data.abilityMethod === 'standard' && (
        <StandardArrayMethod data={data} onChange={onChange} racialBonus={racialBonus} totalScore={totalScore} />
      )}
      {data.abilityMethod === 'pointbuy' && (
        <PointBuyMethod data={data} onChange={onChange} racialBonus={racialBonus} totalScore={totalScore} />
      )}
      {data.abilityMethod === 'manual' && (
        <ManualMethod data={data} onChange={onChange} racialBonus={racialBonus} totalScore={totalScore} />
      )}
    </div>
  )
}

// ── Standard Array ────────────────────────────────────────────────────────────

function StandardArrayMethod({ data, onChange, racialBonus, totalScore }: {
  data: CharacterFormData
  onChange: (d: Partial<CharacterFormData>) => void
  racialBonus: (s: StatKey) => number
  totalScore: (s: StatKey) => number
}) {
  const assignments = data.standardArrayAssignments
  const usedValues = new Set(Object.values(assignments).filter((v) => v !== null) as number[])
  const allAssigned = STAT_KEYS.every((k) => assignments[k] !== null)

  const assign = (stat: StatKey, value: number | null) => {
    const newAssignments = { ...assignments, [stat]: value }
    const newBase = { ...data.baseStats, [stat]: value ?? 8 }
    onChange({ standardArrayAssignments: newAssignments, baseStats: newBase })
  }

  return (
    <div>
      {/* Pool */}
      <div className="mb-5 p-4 bg-dnd-subtle border border-dnd-border rounded-lg">
        <p className="text-xs text-dnd-muted mb-2 font-semibold uppercase tracking-wider">Available Values</p>
        <div className="flex gap-2 flex-wrap">
          {STANDARD_ARRAY.map((val) => (
            <span
              key={val}
              className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold border transition-all ${
                usedValues.has(val)
                  ? 'border-dnd-border text-dnd-muted line-through opacity-40'
                  : 'border-dnd-accent text-dnd-accent bg-dnd-accent/10'
              }`}
            >
              {val}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {STAT_KEYS.map((stat) => {
          const assigned = assignments[stat]
          const total = totalScore(stat)
          const mod = modifier(total)
          const bonus = racialBonus(stat)
          const availableOptions = STANDARD_ARRAY.filter(
            (v) => !usedValues.has(v) || v === assigned
          )

          return (
            <div key={stat} className="flex items-center gap-4 p-3 bg-dnd-subtle border border-dnd-border rounded-lg">
              <div className="w-28 flex-shrink-0">
                <p className="font-bold text-sm text-dnd-text uppercase">{stat}</p>
                <p className="text-xs text-dnd-muted">{STAT_LABELS[stat]}</p>
              </div>

              <select
                value={assigned ?? ''}
                onChange={(e) => assign(stat, e.target.value ? Number(e.target.value) : null)}
                className="flex-1 px-3 py-2 bg-dnd-card border border-dnd-border rounded text-dnd-text text-sm outline-none focus:border-dnd-accent"
              >
                <option value="">— choose —</option>
                {availableOptions.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>

              <div className="text-right flex-shrink-0">
                <span className="text-lg font-bold text-dnd-text">{assigned ?? 8}</span>
                {bonus !== 0 && (
                  <span className="text-xs text-dnd-accent ml-1">+{bonus}</span>
                )}
                <span className="text-dnd-muted mx-1 text-sm">=</span>
                <span className="font-bold text-dnd-text">{total}</span>
                <span className={`ml-2 text-sm font-bold ${mod > 0 ? 'text-green-500' : mod < 0 ? 'text-red-400' : 'text-dnd-muted'}`}>
                  ({modStr(total)})
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {!allAssigned && (
        <p className="text-xs text-dnd-muted mt-3">
          Assign all 6 values to continue.
        </p>
      )}
    </div>
  )
}

// ── Point Buy ─────────────────────────────────────────────────────────────────

function PointBuyMethod({ data, onChange, racialBonus, totalScore }: {
  data: CharacterFormData
  onChange: (d: Partial<CharacterFormData>) => void
  racialBonus: (s: StatKey) => number
  totalScore: (s: StatKey) => number
}) {
  const spent = totalPBSpent(data.baseStats)
  const remaining = PB_BUDGET - spent

  const adjust = (stat: StatKey, delta: number) => {
    const current = data.baseStats[stat]
    const next = current + delta
    if (next < 8 || next > 15) return
    const newSpent = spent - (PB_COST[current] ?? 0) + (PB_COST[next] ?? 0)
    if (newSpent > PB_BUDGET) return
    onChange({ baseStats: { ...data.baseStats, [stat]: next } })
  }

  return (
    <div>
      {/* Budget bar */}
      <div className="mb-5 p-4 bg-dnd-subtle border border-dnd-border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-dnd-muted font-semibold uppercase tracking-wider">Point Budget</p>
          <span className={`text-lg font-bold ${remaining < 5 ? 'text-orange-400' : 'text-dnd-accent'}`}>
            {remaining} <span className="text-dnd-muted text-sm font-normal">/ {PB_BUDGET}</span>
          </span>
        </div>
        <div className="h-2 bg-dnd-border rounded-full overflow-hidden">
          <div
            className="h-full bg-dnd-accent rounded-full transition-all"
            style={{ width: `${(spent / PB_BUDGET) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {STAT_KEYS.map((stat) => {
          const base = data.baseStats[stat]
          const bonus = racialBonus(stat)
          const total = totalScore(stat)
          const mod = modifier(total)
          const cost = PB_COST[base] ?? 0
          const canIncrease = base < 15 && spent + (PB_COST[base + 1] ?? 99) - cost <= PB_BUDGET
          const canDecrease = base > 8

          return (
            <div key={stat} className="flex items-center gap-3 p-3 bg-dnd-subtle border border-dnd-border rounded-lg">
              <div className="w-28 flex-shrink-0">
                <p className="font-bold text-sm text-dnd-text uppercase">{stat}</p>
                <p className="text-xs text-dnd-muted">{STAT_LABELS[stat]}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjust(stat, -1)}
                  disabled={!canDecrease}
                  className="w-7 h-7 rounded border border-dnd-border bg-dnd-card text-dnd-text hover:border-red-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-sm"
                >
                  −
                </button>
                <span className="w-6 text-center font-bold text-dnd-text text-lg">{base}</span>
                <button
                  onClick={() => adjust(stat, +1)}
                  disabled={!canIncrease}
                  className="w-7 h-7 rounded border border-dnd-border bg-dnd-card text-dnd-text hover:border-green-500 hover:text-green-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-sm"
                >
                  +
                </button>
              </div>

              <span className="text-xs text-dnd-muted flex-shrink-0">costs {cost}pt</span>

              <div className="ml-auto text-right flex-shrink-0">
                {bonus !== 0 && <span className="text-xs text-dnd-accent mr-1">+{bonus}</span>}
                <span className="font-bold text-dnd-text">{total}</span>
                <span className={`ml-2 text-sm font-bold ${mod > 0 ? 'text-green-500' : mod < 0 ? 'text-red-400' : 'text-dnd-muted'}`}>
                  ({modStr(total)})
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 text-xs text-dnd-muted">
        <span className="font-semibold">Cost table:</span> 8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9
      </div>
    </div>
  )
}

// ── Manual / Roll ─────────────────────────────────────────────────────────────

function ManualMethod({ data, onChange, racialBonus, totalScore }: {
  data: CharacterFormData
  onChange: (d: Partial<CharacterFormData>) => void
  racialBonus: (s: StatKey) => number
  totalScore: (s: StatKey) => number
}) {
  const rollOne = (stat: StatKey) => {
    onChange({ baseStats: { ...data.baseStats, [stat]: rollStat() } })
  }
  const rollAll = () => {
    const newStats = Object.fromEntries(STAT_KEYS.map((k) => [k, rollStat()])) as Record<StatKey, number>
    onChange({ baseStats: newStats })
  }
  const setManual = (stat: StatKey, val: string) => {
    const n = parseInt(val, 10)
    if (!isNaN(n) && n >= 1 && n <= 30) onChange({ baseStats: { ...data.baseStats, [stat]: n } })
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={rollAll}
          className="flex items-center gap-2 px-4 py-2 bg-dnd-accent/20 hover:bg-dnd-accent/30 border border-dnd-accent/40 text-dnd-accent rounded-lg text-sm font-semibold transition-colors"
        >
          🎲 Roll all (4d6 drop lowest)
        </button>
      </div>

      <div className="space-y-2">
        {STAT_KEYS.map((stat) => {
          const base = data.baseStats[stat]
          const bonus = racialBonus(stat)
          const total = totalScore(stat)
          const mod = modifier(total)

          return (
            <div key={stat} className="flex items-center gap-3 p-3 bg-dnd-subtle border border-dnd-border rounded-lg">
              <div className="w-28 flex-shrink-0">
                <p className="font-bold text-sm text-dnd-text uppercase">{stat}</p>
                <p className="text-xs text-dnd-muted">{STAT_LABELS[stat]}</p>
              </div>

              <div className="flex items-center gap-1 flex-1">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={base}
                  onChange={(e) => setManual(stat, e.target.value)}
                  className="w-16 px-2 py-1.5 bg-dnd-card border border-dnd-border focus:border-dnd-accent rounded text-dnd-text text-center text-sm outline-none"
                />
                <button
                  onClick={() => rollOne(stat)}
                  title="Roll 4d6 drop lowest"
                  className="px-2.5 py-1.5 bg-dnd-accent/20 hover:bg-dnd-accent/30 border border-dnd-accent/40 text-dnd-accent rounded text-sm transition-colors"
                >
                  🎲
                </button>
              </div>

              <div className="ml-auto text-right flex-shrink-0">
                {bonus !== 0 && <span className="text-xs text-dnd-accent mr-1">+{bonus}</span>}
                <span className="font-bold text-dnd-text">{total}</span>
                <span className={`ml-2 text-sm font-bold ${mod > 0 ? 'text-green-500' : mod < 0 ? 'text-red-400' : 'text-dnd-muted'}`}>
                  ({modStr(total)})
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
