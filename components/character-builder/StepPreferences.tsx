'use client'

import {
  CharacterFormData, Edition, AdvancementType, HitPointType,
  computeAllowedSources,
} from './types'

interface Props {
  data: CharacterFormData
  onChange: (partial: Partial<CharacterFormData>) => void
  onStart: () => void
  startError: string
}

const EDITION_CONFIG: Record<Edition, {
  label: string; tagline: string; sources: string; badge: string | null
}> = {
  '5e': {
    label: '5e Classic (2014)',
    tagline: "Original rules. Includes Xanathar's & Tasha's content.",
    sources: 'PHB · BR · XGE · TCE',
    badge: null,
  },
  '5.5e': {
    label: '5.5e Updated Rules (2024)',
    tagline: 'Revised 2024 rules with updated classes and races.',
    sources: 'PHB24 · BR',
    badge: 'NEWEST',
  },
}

function Checkbox({
  checked, disabled, onChange: onChangeProp, label, description,
}: {
  checked: boolean; disabled?: boolean
  onChange: (v: boolean) => void
  label: string; description: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChangeProp(!checked)}
      className={`w-full flex items-start gap-3 p-3.5 rounded-lg border text-left transition-colors ${
        disabled
          ? 'border-dnd-border/40 opacity-40 cursor-not-allowed'
          : checked
          ? 'border-dnd-accent/50 bg-dnd-accent/5 cursor-pointer'
          : 'border-dnd-border bg-dnd-subtle hover:border-dnd-accent/30 cursor-pointer'
      }`}
    >
      <div className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
        checked && !disabled ? 'bg-dnd-accent border-dnd-accent' : 'border-dnd-border'
      }`}>
        {checked && !disabled && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-dnd-text">{label}</p>
        <p className="text-xs text-dnd-muted mt-0.5">{description}</p>
      </div>
    </button>
  )
}

function RadioGroup<T extends string>({
  label, options, value, onChange: onChangeProp,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div>
      <p className="text-[10px] font-bold text-dnd-muted uppercase tracking-widest mb-3">{label}</p>
      <div className="flex gap-4">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChangeProp(opt.value)}
            className="flex items-center gap-2 group"
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
              value === opt.value
                ? 'border-dnd-accent'
                : 'border-dnd-border group-hover:border-dnd-accent/50'
            }`}>
              {value === opt.value && <div className="w-2 h-2 rounded-full bg-dnd-accent" />}
            </div>
            <span className="text-sm text-dnd-text">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function StepPreferences({ data, onChange, onStart, startError }: Props) {
  const setEdition = (edition: Edition) => {
    const expandedRules = edition === '5e' ? data.expandedRules : false
    onChange({
      edition,
      expandedRules,
      allowedSources: computeAllowedSources(edition, expandedRules, data.thirdParty),
    })
  }

  const setExpandedRules = (v: boolean) =>
    onChange({ expandedRules: v, allowedSources: computeAllowedSources(data.edition, v, data.thirdParty) })

  const setThirdParty = (v: boolean) =>
    onChange({ thirdParty: v, allowedSources: computeAllowedSources(data.edition, data.expandedRules, v) })

  return (
    <div className="space-y-8">

      {/* Character name */}
      <div>
        <label className="text-[10px] font-bold text-dnd-muted uppercase tracking-widest block mb-2">
          Character Name
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && onStart()}
          placeholder="Enter a name…"
          autoFocus
          className="w-full px-4 py-3 bg-dnd-subtle border border-dnd-border rounded-lg text-dnd-text text-lg font-medium placeholder:text-dnd-muted/50 outline-none focus:border-dnd-accent transition-colors"
        />
      </div>

      {/* Edition */}
      <div>
        <p className="text-[10px] font-bold text-dnd-muted uppercase tracking-widest mb-3">
          Choose Your Edition
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.keys(EDITION_CONFIG) as Edition[]).map((ed) => {
            const cfg = EDITION_CONFIG[ed]
            const selected = data.edition === ed
            return (
              <button
                key={ed}
                type="button"
                onClick={() => setEdition(ed)}
                className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                  selected
                    ? 'border-dnd-accent bg-dnd-accent/10 shadow-[0_0_20px_rgba(0,0,0,0.3)]'
                    : 'border-dnd-border bg-dnd-subtle hover:border-dnd-accent/50'
                }`}
              >
                {cfg.badge && (
                  <span className="absolute top-3 right-3 text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded bg-dnd-accent text-white">
                    {cfg.badge}
                  </span>
                )}
                {selected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-dnd-accent flex items-center justify-center"
                    style={cfg.badge ? { right: '4.5rem' } : {}}>
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <p className="font-bold text-dnd-text text-sm pr-12 leading-snug">{cfg.label}</p>
                <p className="text-xs text-dnd-muted mt-1.5 leading-snug">{cfg.tagline}</p>
                <p className="text-[10px] text-dnd-accent/70 mt-2.5 font-mono tracking-wide">{cfg.sources}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Additional content */}
      <div>
        <p className="text-[10px] font-bold text-dnd-muted uppercase tracking-widest mb-3">
          Additional Content
        </p>
        <div className="space-y-2">
          <Checkbox
            checked={data.expandedRules}
            disabled={data.edition !== '5e'}
            onChange={setExpandedRules}
            label="Expanded Rules"
            description="TCE (Tasha's), XGE (Xanathar's) — 5e only"
          />
          <Checkbox
            checked={data.thirdParty}
            onChange={setThirdParty}
            label="Third-Party & Partnered Content"
            description="FOA, BHC (Blood Hunter), D&DV and other non-WotC sources"
          />
          {/* Homebrew — coming soon */}
          <div className="flex items-start gap-3 p-3.5 rounded-lg border border-dnd-border/40 bg-dnd-subtle opacity-40 cursor-not-allowed select-none">
            <div className="mt-0.5 w-4 h-4 rounded flex-shrink-0 border-2 border-dnd-border" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-dnd-text">Homebrew</p>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-dnd-border text-dnd-muted tracking-widest">
                  COMING SOON
                </span>
              </div>
              <p className="text-xs text-dnd-muted mt-0.5">Custom content and community creations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Advancement type */}
      <RadioGroup<AdvancementType>
        label="Advancement Type"
        options={[
          { value: 'milestone', label: 'Milestone' },
          { value: 'xp',        label: 'XP' },
        ]}
        value={data.advancementType}
        onChange={(v) => onChange({ advancementType: v })}
      />

      {/* Hit point type */}
      <RadioGroup<HitPointType>
        label="Hit Point Type"
        options={[
          { value: 'fixed',  label: 'Fixed' },
          { value: 'rolled', label: 'Rolled' },
        ]}
        value={data.hitPointType}
        onChange={(v) => onChange({ hitPointType: v })}
      />

      {/* Error + CTA */}
      {startError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {startError}
        </div>
      )}

      <button
        type="button"
        onClick={onStart}
        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-dnd-accent hover:opacity-90 text-white font-bold rounded-xl text-base transition-opacity"
      >
        Start Building
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>

    </div>
  )
}
