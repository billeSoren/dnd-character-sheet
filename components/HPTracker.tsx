'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

interface HPTrackerProps {
  characterId: string
  maxHp: number
  initialCurrentHp: number
  initialTempHp: number
}

export default function HPTracker({ characterId, maxHp, initialCurrentHp, initialTempHp }: HPTrackerProps) {
  const supabase = createClient()
  const [currentHp, setCurrentHp] = useState(initialCurrentHp)
  const [tempHp, setTempHp] = useState(initialTempHp)
  const [saving, setSaving] = useState(false)
  const [editingTemp, setEditingTemp] = useState(false)
  const [tempInput, setTempInput] = useState(String(initialTempHp))

  const clamp = (val: number) => Math.min(maxHp, Math.max(0, val))

  const persist = async (newCurrent: number, newTemp: number) => {
    setSaving(true)
    await supabase
      .from('character_hp')
      .update({ current_hp: newCurrent, temp_hp: newTemp })
      .eq('character_id', characterId)
    setSaving(false)
  }

  const adjust = async (delta: number) => {
    const next = clamp(currentHp + delta)
    setCurrentHp(next)
    await persist(next, tempHp)
  }

  const commitTemp = async () => {
    const val = Math.max(0, parseInt(tempInput, 10) || 0)
    setTempHp(val)
    setEditingTemp(false)
    await persist(currentHp, val)
  }

  const pct = Math.max(0, (currentHp / maxHp) * 100)
  const hpColor =
    pct > 60 ? 'bg-green-600' :
    pct > 30 ? 'bg-amber-500' :
    'bg-red-600'

  const isDead = currentHp === 0

  return (
    <div className="border border-stone-800 bg-stone-900/50 rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider">Hit Points</h3>
        {saving && <span className="text-xs text-stone-600 animate-pulse">gemmer…</span>}
      </div>

      {/* HP fraction */}
      <div className="text-center">
        <div className="flex items-end justify-center gap-1">
          <span className={`text-5xl font-bold leading-none ${isDead ? 'text-red-500' : 'text-amber-100'}`}>
            {currentHp}
          </span>
          <span className="text-stone-500 text-xl mb-1">/ {maxHp}</span>
        </div>
        {isDead && <p className="text-red-500 text-xs mt-1 font-medium">Bevidstløs</p>}
      </div>

      {/* HP bar */}
      <div className="h-2.5 bg-stone-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${hpColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* +/- buttons */}
      <div className="grid grid-cols-5 gap-1.5">
        {[-10, -5, -1, +5, +10].map((delta) => (
          <button
            key={delta}
            onClick={() => adjust(delta)}
            disabled={saving || (delta < 0 && currentHp === 0) || (delta > 0 && currentHp === maxHp)}
            className={`py-2 rounded text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              delta < 0
                ? 'bg-red-900/50 hover:bg-red-900/70 border border-red-900/50 text-red-300'
                : 'bg-green-900/40 hover:bg-green-900/60 border border-green-900/40 text-green-300'
            }`}
          >
            {delta > 0 ? `+${delta}` : delta}
          </button>
        ))}
      </div>

      {/* Custom delta */}
      <div className="flex gap-1.5">
        <HPCustomButton label="Skade" negative onCommit={(v) => adjust(-v)} disabled={saving} />
        <HPCustomButton label="Healing" negative={false} onCommit={(v) => adjust(v)} disabled={saving} />
      </div>

      {/* Temp HP */}
      <div className="border-t border-stone-800 pt-3 flex items-center justify-between">
        <span className="text-sm text-stone-500">Midlertidige HP</span>
        {editingTemp ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              value={tempInput}
              onChange={(e) => setTempInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && commitTemp()}
              autoFocus
              className="w-16 px-2 py-1 bg-stone-800 border border-amber-600 rounded text-stone-100 text-sm text-center outline-none"
            />
            <button onClick={commitTemp} className="px-2 py-1 bg-amber-700 hover:bg-amber-600 text-stone-100 rounded text-sm">✓</button>
          </div>
        ) : (
          <button
            onClick={() => { setTempInput(String(tempHp)); setEditingTemp(true) }}
            className="text-amber-300 font-bold text-sm hover:text-amber-200 transition-colors"
          >
            {tempHp > 0 ? `+${tempHp}` : '—'} <span className="text-stone-600 font-normal text-xs">klik for at redigere</span>
          </button>
        )}
      </div>
    </div>
  )
}

function HPCustomButton({
  label, negative, onCommit, disabled,
}: {
  label: string
  negative: boolean
  onCommit: (v: number) => void
  disabled: boolean
}) {
  const [val, setVal] = useState('')

  const commit = () => {
    const n = parseInt(val, 10)
    if (!isNaN(n) && n > 0) { onCommit(n); setVal('') }
  }

  return (
    <div className="flex-1 flex gap-1">
      <input
        type="number"
        min={1}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        placeholder="0"
        className={`w-0 flex-1 px-2 py-1.5 bg-stone-800 border rounded text-stone-100 text-sm text-center outline-none transition-colors ${
          negative ? 'border-red-900/50 focus:border-red-600' : 'border-green-900/40 focus:border-green-600'
        }`}
      />
      <button
        onClick={commit}
        disabled={disabled || !val || parseInt(val) <= 0}
        className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors disabled:opacity-30 ${
          negative
            ? 'bg-red-900/50 hover:bg-red-900/70 border border-red-900/50 text-red-300'
            : 'bg-green-900/40 hover:bg-green-900/60 border border-green-900/40 text-green-300'
        }`}
      >
        {label}
      </button>
    </div>
  )
}
