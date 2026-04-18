import { createServerSupabaseClient } from '@/lib/supabase-server'
import AuthButton from '@/components/AuthButton'
import CharacterCard from '@/components/CharacterCard'
import Link from 'next/link'
import { Character } from '@/types/dnd'

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let characters: Character[] = []
  if (user) {
    const { data } = await supabase
      .from('characters')
      .select('*')
      .order('created_at', { ascending: false })
    characters = data ?? []
  }

  return (
    <div className="min-h-screen bg-stone-950 parchment-bg">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-stone-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚔️</span>
            <h1 className="text-xl font-bold text-amber-300 tracking-wide">
              D&D Karakterark
            </h1>
          </div>
          <AuthButton user={user} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {!user ? (
          /* Landing — ikke logget ind */
          <div className="text-center py-20">
            <div className="inline-block mb-6 p-4 rounded-full bg-amber-900/20 border border-amber-800/30">
              <span className="text-6xl">🐉</span>
            </div>
            <h2 className="text-4xl font-bold text-amber-200 mb-4">
              Skriv din legende
            </h2>
            <p className="text-stone-400 text-lg max-w-md mx-auto mb-8 leading-relaxed">
              Opret og administrer dine D&D 5e karakterer. Hold styr på stats, HP og baggrund ét sted.
            </p>
            <div className="flex flex-col items-center gap-3">
              <p className="text-stone-500 text-sm">Log ind for at komme i gang</p>
              <AuthButton user={null} />
            </div>

            {/* Dekorative eksempelkort */}
            <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-40 pointer-events-none select-none">
              {[
                { name: 'Thorin Stonehelm', race: 'Dværg', cls: 'Kriger', level: 8 },
                { name: 'Lyra Moonwhisper', race: 'Alv', cls: 'Vismand', level: 6 },
                { name: 'Grok the Mighty', race: 'Halvork', cls: 'Barbar', level: 10 },
              ].map((c) => (
                <div key={c.name} className="border border-amber-900/40 bg-stone-900/60 rounded-lg p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-amber-100">{c.name}</h3>
                      <p className="text-stone-400 text-sm mt-0.5">{c.race} · <span className="text-amber-400">{c.cls}</span></p>
                    </div>
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-amber-700/50 bg-amber-900/30 text-amber-300 font-bold text-sm">
                      {c.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Dashboard — logget ind */
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-amber-200">Dine karakterer</h2>
                <p className="text-stone-500 text-sm mt-1">
                  {characters.length === 0
                    ? 'Ingen karakterer endnu'
                    : `${characters.length} karakter${characters.length !== 1 ? 'er' : ''}`}
                </p>
              </div>
              <Link
                href="/characters/new"
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-600 text-stone-100 font-semibold rounded transition-colors shadow-lg shadow-amber-900/30"
              >
                <span className="text-lg leading-none">+</span>
                Opret ny karakter
              </Link>
            </div>

            {characters.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-amber-900/30 rounded-lg">
                <span className="text-5xl block mb-4">📜</span>
                <p className="text-stone-400 text-lg mb-2">Ingen karakterer endnu</p>
                <p className="text-stone-600 text-sm mb-6">Opret din første karakter for at begynde eventyret</p>
                <Link
                  href="/characters/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-600 text-stone-100 font-semibold rounded transition-colors"
                >
                  <span className="text-lg leading-none">+</span>
                  Opret ny karakter
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters.map((character) => (
                  <CharacterCard key={character.id} character={character} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-amber-900/20 mt-20 py-6 text-center text-stone-600 text-sm">
        D&D Karakterark · Bygget med Next.js & Supabase
      </footer>
    </div>
  )
}
