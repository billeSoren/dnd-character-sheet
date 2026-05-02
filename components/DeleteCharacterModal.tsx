'use client'

interface Props {
  name: string
  loading: boolean
  onCancel: () => void
  onConfirm: () => void
}

export default function DeleteCharacterModal({ name, loading, onCancel, onConfirm }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/80" onClick={onCancel} />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-sm bg-dnd-card border border-dnd-border rounded-xl shadow-2xl p-6 pointer-events-auto">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>

          <h2 className="text-lg font-bold text-dnd-text text-center mb-2">Delete Character?</h2>
          <p className="text-dnd-muted text-sm text-center mb-6 leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="text-dnd-text font-semibold">{name}</span>?{' '}
            This cannot be undone.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-dnd-border rounded-lg text-dnd-muted hover:text-dnd-text hover:border-dnd-accent/40 transition-colors text-sm font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {loading ? 'Deleting…' : 'Delete Forever'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
