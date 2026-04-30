import { Character } from '@/types/dnd'
import Link from 'next/link'

interface CharacterCardProps {
  character: Character
}

const CLASS_COLORS: Record<string, string> = {
  Barbarian: 'text-red-400',
  Bard: 'text-purple-400',
  Cleric: 'text-yellow-400',
  Druid: 'text-green-400',
  Fighter: 'text-orange-400',
  Monk: 'text-cyan-400',
  Paladin: 'text-amber-400',
  Ranger: 'text-lime-400',
  Rogue: 'text-slate-400',
  Sorcerer: 'text-pink-400',
  Warlock: 'text-violet-400',
  Wizard: 'text-blue-400',
}

export default function CharacterCard({ character }: CharacterCardProps) {
  const colorClass = CLASS_COLORS[character.class] ?? 'text-dnd-accent'

  return (
    <Link href={`/characters/${character.id}`}>
      <div className="group relative border border-dnd-border bg-dnd-subtle hover:bg-dnd-card rounded-lg p-5 transition-all hover:border-dnd-accent/50 hover:shadow-lg cursor-pointer">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-dnd-accent/40 to-transparent" />
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-dnd-text group-hover:text-dnd-accent transition-colors">
              {character.name}
            </h3>
            <p className="text-dnd-muted text-sm mt-0.5">
              {character.race} · <span className={colorClass}>{character.class}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-dnd-border bg-dnd-accent/20 text-dnd-accent font-bold text-sm">
              {character.level}
            </span>
            <p className="text-dnd-muted text-xs mt-1">level</p>
          </div>
        </div>
        <p className="text-dnd-muted text-xs mt-3 border-t border-dnd-border pt-3 opacity-70">
          {character.background}
        </p>
      </div>
    </Link>
  )
}
