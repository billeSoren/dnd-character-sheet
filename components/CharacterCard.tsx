import { Character } from '@/types/dnd'
import Link from 'next/link'

interface CharacterCardProps {
  character: Character
}

const classColors: Record<string, string> = {
  Barbar: 'text-red-400',
  Barde: 'text-purple-400',
  Kleriker: 'text-yellow-300',
  Druide: 'text-green-400',
  Kriger: 'text-orange-400',
  Munk: 'text-cyan-400',
  Paladin: 'text-amber-300',
  Ranger: 'text-lime-400',
  Skurk: 'text-slate-400',
  Troldmand: 'text-pink-400',
  Heks: 'text-violet-400',
  Vismand: 'text-blue-400',
}

export default function CharacterCard({ character }: CharacterCardProps) {
  const colorClass = classColors[character.class] ?? 'text-amber-400'

  return (
    <Link href={`/characters/${character.id}`}>
      <div className="group relative border border-amber-900/40 bg-stone-900/60 hover:bg-stone-800/80 rounded-lg p-5 transition-all hover:border-amber-600/60 hover:shadow-lg hover:shadow-amber-900/20 cursor-pointer">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-700/40 to-transparent" />
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
              {character.name}
            </h3>
            <p className="text-stone-400 text-sm mt-0.5">
              {character.race} · <span className={colorClass}>{character.class}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-amber-700/50 bg-amber-900/30 text-amber-300 font-bold text-sm">
              {character.level}
            </span>
            <p className="text-stone-500 text-xs mt-1">niveau</p>
          </div>
        </div>
        <p className="text-stone-500 text-xs mt-3 border-t border-stone-800 pt-3">
          {character.background}
        </p>
      </div>
    </Link>
  )
}
