'use client'

export default function CharacterPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-dnd-bg flex items-center justify-center p-8">
      <div className="max-w-xl w-full border border-red-500/40 bg-red-500/10 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-red-400">Character sheet error</h2>

        <div className="font-mono text-xs text-red-300 bg-red-950/40 rounded p-3 break-all whitespace-pre-wrap">
          {error.message || 'Unknown error'}
        </div>

        {error.digest && (
          <p className="text-xs text-dnd-muted">Digest: {error.digest}</p>
        )}

        {error.stack && (
          <details className="text-xs text-dnd-muted">
            <summary className="cursor-pointer hover:text-dnd-text">Stack trace</summary>
            <pre className="mt-2 whitespace-pre-wrap break-all text-[10px] opacity-70">
              {error.stack}
            </pre>
          </details>
        )}

        <button
          onClick={reset}
          className="px-4 py-2 bg-dnd-accent text-white text-sm font-semibold rounded-lg hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
