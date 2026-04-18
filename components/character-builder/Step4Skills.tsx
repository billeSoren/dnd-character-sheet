import { classes, backgrounds } from '@/lib/dnd-data'
import { CharacterFormData } from './types'

interface Props {
  data: CharacterFormData
  onChange: (data: Partial<CharacterFormData>) => void
}

export default function Step4Skills({ data, onChange }: Props) {
  const selectedClass = classes.find((c) => c.name === data.className)
  const selectedBg = backgrounds.find((b) => b.name === data.background)

  const bgSkills = selectedBg?.skillProficiencies ?? []
  const classChoices = selectedClass?.skillChoices ?? { choose: 0, from: [] }

  // Skills available to pick from class (minus background skills)
  const availableClassSkills = classChoices.from.filter((s) => !bgSkills.includes(s))
  const chooseCount = classChoices.choose

  const toggleSkill = (skill: string) => {
    const already = data.selectedSkills.includes(skill)
    if (already) {
      onChange({ selectedSkills: data.selectedSkills.filter((s) => s !== skill) })
    } else if (data.selectedSkills.length < chooseCount) {
      onChange({ selectedSkills: [...data.selectedSkills, skill] })
    }
  }

  const remaining = chooseCount - data.selectedSkills.length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-200 mb-1">Færdighedsproficiencies</h2>
        <p className="text-stone-500 text-sm">Vælg dine klasses færdigheder</p>
      </div>

      {/* Background skills — fixed */}
      {bgSkills.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-amber-400/70 uppercase tracking-wider mb-3">
            Fra baggrund ({data.background})
          </h3>
          <div className="flex flex-wrap gap-2">
            {bgSkills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 bg-amber-900/30 border border-amber-800/50 text-amber-300 rounded text-sm font-medium"
              >
                ✓ {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Class skill choices */}
      {availableClassSkills.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-amber-400/70 uppercase tracking-wider">
              Fra klasse ({data.className})
            </h3>
            <span className={`text-sm font-medium ${remaining > 0 ? 'text-amber-400' : 'text-green-400'}`}>
              {remaining > 0 ? `Vælg ${remaining} mere` : 'Alle valgt'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableClassSkills.map((skill) => {
              const selected = data.selectedSkills.includes(skill)
              const disabled = !selected && remaining === 0
              return (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  disabled={disabled}
                  className={`px-3 py-2.5 rounded border text-sm font-medium text-left transition-all ${
                    selected
                      ? 'bg-amber-900/40 border-amber-600/60 text-amber-200'
                      : disabled
                      ? 'bg-stone-900/30 border-stone-800 text-stone-600 cursor-not-allowed'
                      : 'bg-stone-900/40 border-stone-700 text-stone-300 hover:border-amber-700/50 hover:text-amber-300'
                  }`}
                >
                  <span className="mr-1.5">{selected ? '✓' : '○'}</span>
                  {skill}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      {(bgSkills.length > 0 || data.selectedSkills.length > 0) && (
        <div className="p-4 bg-stone-900/40 border border-stone-800 rounded-lg">
          <h3 className="text-sm font-semibold text-amber-400/70 mb-2">Alle færdighedsproficiencies</h3>
          <div className="flex flex-wrap gap-2">
            {[...bgSkills, ...data.selectedSkills].map((skill) => (
              <span key={skill} className="text-sm text-stone-300 bg-stone-800 px-2 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {chooseCount === 0 && (
        <p className="text-stone-500 text-sm">
          Ingen klasse-færdighedsvalg fundet for {data.className || 'valgt klasse'}.
        </p>
      )}
    </div>
  )
}
