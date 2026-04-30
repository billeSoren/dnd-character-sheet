import { createServerSupabaseClient } from '@/lib/supabase-server'
import AuthButton from '@/components/AuthButton'
import CharacterCard from '@/components/CharacterCard'
import ThemeToggle from '@/components/ThemeToggle'
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
    <div className="min-h-screen bg-dnd-bg">
      {/* Header */}
      <header className="border-b border-dnd-border bg-dnd-bg/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚔️</span>
            <h1 className="text-xl font-bold text-dnd-accent tracking-wide">
              D&D Character Sheet
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <AuthButton user={user} />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {!user ? (
          /* Landing — not logged in */
          <div className="text-center py-20">
            <div className="inline-block mb-6 p-4 rounded-full bg-dnd-accent/20 border border-dnd-accent/30">
              <span className="text-6xl">🐉</span>
            </div>
            <h2 className="text-4xl font-bold text-dnd-text mb-4">
              Write Your Legend
            </h2>
            <p className="text-dnd-muted text-lg max-w-md mx-auto mb-8 leading-relaxed">
              Create and manage your D&D 5e characters. Track stats, HP, and background all in one place.
            </p>
            <div className="flex flex-col items-center gap-3">
              <p className="text-dnd-muted text-sm">Log in to get started</p>
              <AuthButton user={null} />
            </div>

            {/* Decorative example cards */}
            <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-40 pointer-events-none select-none">
              {[
                { name: 'Thorin Stonehelm', race: 'Dwarf', cls: 'Fighter', level: 8 },
                { name: 'Lyra Moonwhisper', race: 'Elf', cls: 'Wizard', level: 6 },
                { name: 'Grok the Mighty', race: 'Half-Orc', cls: 'Barbarian', level: 10 },
              ].map((c) => (
                <div key={c.name} className="border border-dnd-border bg-dnd-subtle rounded-lg p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-dnd-text">{c.name}</h3>
                      <p className="text-dnd-muted text-sm mt-0.5">{c.race} · <span className="text-dnd-accent">{c.cls}</span></p>
                    </div>
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-dnd-border bg-dnd-accent/20 text-dnd-accent font-bold text-sm">
                      {c.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Dashboard — logged in */
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-dnd-text">Your Characters</h2>
                <p className="text-dnd-muted text-sm mt-1">
                  {characters.length === 0
                    ? 'No characters yet'
                    : `${characters.length} character${characters.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <Link
                href="/characters/new"
                className="flex items-center gap-2 px-5 py-2.5 bg-dnd-accent hover:opacity-90 text-white font-semibold rounded-lg transition-opacity shadow-lg"
              >
                <span className="text-lg leading-none">+</span>
                Create New Character
              </Link>
            </div>

            {characters.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-dnd-border rounded-lg">
                <span className="text-5xl block mb-4">📜</span>
                <p className="text-dnd-muted text-lg mb-2">No characters yet</p>
                <p className="text-dnd-muted text-sm mb-6 opacity-60">Create your first character to begin the adventure</p>
                <Link
                  href="/characters/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-dnd-accent hover:opacity-90 text-white font-semibold rounded-lg transition-opacity"
                >
                  <span className="text-lg leading-none">+</span>
                  Create New Character
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

      <footer className="border-t border-dnd-border mt-20 py-6 text-center text-dnd-muted text-sm opacity-60">
        D&D Character Sheet · Built with Next.js & Supabase
      </footer>
    </div>
  )
}
