interface Props {
  title: string
  description: string
  rows?: number
}

/** Pulse skeleton shown while live D&D data is loading in a Step component. */
export default function StepLoadingSkeleton({ title, description, rows = 6 }: Props) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-dnd-text mb-1">{title}</h2>
        <p className="text-dnd-muted text-sm">{description}</p>
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-dnd-subtle animate-pulse" />
        ))}
      </div>
    </div>
  )
}
