interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  labels: string[]
}

export default function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="w-full mb-10">
      <div className="flex items-center justify-between relative">
        {/* connecting line */}
        <div className="absolute inset-x-0 top-4 h-px bg-stone-800 -z-10" />
        <div
          className="absolute top-4 h-px bg-amber-700 -z-10 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1
          const done = step < currentStep
          const active = step === currentStep
          return (
            <div key={step} className="flex flex-col items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                  done
                    ? 'bg-amber-700 border-amber-600 text-stone-100'
                    : active
                    ? 'bg-stone-900 border-amber-500 text-amber-400 shadow-lg shadow-amber-900/40'
                    : 'bg-stone-900 border-stone-700 text-stone-600'
                }`}
              >
                {done ? '✓' : step}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  active ? 'text-amber-400' : done ? 'text-amber-700' : 'text-stone-600'
                }`}
              >
                {labels[i]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
