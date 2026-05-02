import { DndClass, DndBackground, DndRace } from '@/lib/dnd-api'
import {
  CharacterFormData, STAT_KEYS, STAT_LABELS, StatKey,
  modifier, modStr, calculateMaxHP,
} from './types'

interface Props {
  data: CharacterFormData
  onChange: (d: Partial<CharacterFormData>) => void
  onSave: () => void
  saving: boolean
  error: string
  selectedClass: DndClass | null
  selectedBg: DndBackground | null
  selectedRace: DndRace | null
}

export default function StepFinish({
  data, onChange, onSave, saving, error,
  selectedClass, selectedBg, selectedRace,
}: Props) {
  const racialBonus = (stat: StatKey): number =>
    selectedRace?.ability_bonuses?.[stat] ?? 0

  const totalStat = (stat: StatKey) => data.baseStats[stat] + racialBonus(stat)

  const hitDie = selectedClass?.hit_die ?? 8
  const conMod = modifier(totalStat('CON'))
  const maxHP = calculateMaxHP(hitDie, conMod, data.level)

  const bgSkills = selectedBg?.skill_proficiencies ?? []

  // Derive class skill choices from DB columns (skill_choices = list of options,
  // num_skill_choices = how many to pick)
  const classSkillPool = selectedClass?.skill_choices ?? []
  const classSkillCount = selectedClass?.num_skill_choices ?? 0
  const availableClassSkills = classSkillPool.filter((s) => !bgSkills.includes(s))
  const remaining = classSkillCount - data.selectedSkills.length

  const toggleSkill = (skill: string) => {
    const already = data.selectedSkills.includes(skill)
    if (already) {
      onChange({ selectedSkills: data.selectedSkills.filter((s) => s !== skill) })
    } else if (data.selectedSkills.length < classSkillCount) {
      onChange({ selectedSkills: [...data.selectedSkills, skill] })
    }
  }

  const allSkills = [...bgSkills, ...data.selectedSkills]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-dnd-text mb-1">Finish Character</h2>
        <p className="text-dnd-muted text-sm">Name your character and choose your remaining skills.</p>
      </div>

      {/* Name + Level */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-dnd-muted mb-1.5 uppercase tracking-wider">Name</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Character name…"
            className="w-full px-4 py-2.5 bg-dnd-subtle border border-dnd-border focus:border-dnd-accent rounded-lg text-dnd-text placeholder:text-dnd-muted outline-none transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-dnd-muted mb-1.5 uppercase tracking-wider">Level <span className="normal-case font-normal">(1–20)</span></label>
          <input
            type="number"
            min={1}
            max={20}
            value={data.level}
            onChange={(e) => onChange({ level: Math.min(20, Math.max(1, Number(e.target.value))) })}
            className="w-full px-4 py-2.5 bg-dnd-subtle border border-dnd-border focus:border-dnd-accent rounded-lg text-dnd-text outline-none transition-colors text-sm"
          />
        </div>
      </div>

      {/* Skill choices */}
      {availableClassSkills.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-dnd-muted uppercase tracking-wider">
              Class Skills ({data.className})
            </label>
            <span className={`text-sm font-semibold ${remaining > 0 ? 'text-dnd-accent' : 'text-green-500'}`}>
              {remaining > 0 ? `Choose ${remaining} more` : '✓ Selected'}
            </span>
          </div>
          {bgSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs text-dnd-muted mr-1 self-center">From background:</span>
              {bgSkills.map((s) => (
                <span key={s} className="text-xs px-2.5 py-1 bg-dnd-accent/20 border border-dnd-accent/40 text-dnd-accent rounded font-medium">
                  ✓ {s}
                </span>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableClassSkills.map((skill) => {
              const selected = data.selectedSkills.includes(skill)
              const disabled = !selected && remaining === 0
              return (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  disabled={disabled}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium text-left transition-all ${
                    selected
                      ? 'bg-dnd-accent/20 border-dnd-accent/60 text-dnd-accent'
                      : disabled
                      ? 'bg-dnd-subtle border-dnd-border text-dnd-muted cursor-not-allowed opacity-50'
                      : 'bg-dnd-subtle border-dnd-border text-dnd-text hover:border-dnd-accent/50'
                  }`}
                >
                  {selected ? '✓ ' : '○ '}{skill}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="border border-dnd-border rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 bg-dnd-subtle border-b border-dnd-border">
          <p className="text-xs font-bold text-dnd-muted uppercase tracking-wider">Summary</p>
        </div>

        {/* Identity row */}
        <div className="px-4 py-3 border-b border-dnd-border flex flex-wrap gap-4 text-sm">
          <span><span className="text-dnd-muted">Class:</span> <strong className="text-dnd-text">{data.className || '—'}</strong></span>
          <span><span className="text-dnd-muted">Background:</span> <strong className="text-dnd-text">{data.background || '—'}</strong></span>
          <span><span className="text-dnd-muted">Race:</span> <strong className="text-dnd-text">{data.race || '—'}</strong></span>
          <span><span className="text-dnd-muted">HP:</span> <strong className="text-dnd-accent text-base">{maxHP}</strong></span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-6 divide-x divide-dnd-border">
          {STAT_KEYS.map((stat) => {
            const total = totalStat(stat)
            const mod = modifier(total)
            return (
              <div key={stat} className="py-3 text-center">
                <p className="text-xs text-dnd-muted mb-1">{stat}</p>
                <p className="text-lg font-bold text-dnd-text">{total}</p>
                <p className={`text-xs font-semibold ${mod > 0 ? 'text-green-500' : mod < 0 ? 'text-red-400' : 'text-dnd-muted'}`}>
                  {modStr(total)}
                </p>
                <p className="text-xs text-dnd-muted hidden sm:block mt-0.5">{STAT_LABELS[stat].slice(0, 4)}</p>
              </div>
            )
          })}
        </div>

        {/* Skills */}
        {allSkills.length > 0 && (
          <div className="px-4 py-3 border-t border-dnd-border">
            <p className="text-xs text-dnd-muted mb-2">Skill Proficiencies</p>
            <div className="flex flex-wrap gap-1.5">
              {allSkills.map((s) => (
                <span key={s} className="text-xs bg-dnd-subtle border border-dnd-border text-dnd-text px-2 py-0.5 rounded">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-900/20 border border-red-900/30 rounded px-3 py-2">{error}</p>
      )}

      <button
        onClick={onSave}
        disabled={saving || !data.name.trim()}
        className="w-full py-3.5 bg-dnd-accent hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-opacity text-base tracking-wide"
      >
        {saving ? 'Creating character…' : '⚔️  Create Character'}
      </button>
    </div>
  )
}
