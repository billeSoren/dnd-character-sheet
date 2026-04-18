/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { data } = require('dnd5-srd') as { data: Record<string, any[]> }

export interface DnDClass {
  name: string
  hitDie: number
  proficiencies: string[]
  skillChoices: { choose: number; from: string[] }
  subclasses: string[]
  savingThrows: string[]
}

export interface DnDRace {
  name: string
  speed: number
  size: string
  abilityBonuses: { ability: string; bonus: number }[]
  traits: string[]
}

export interface DnDSpell {
  name: string
  level: number
  school: string
  castingTime: string
  range: string
  components: string[]
  duration: string
  description: string
}

export interface DnDBackground {
  name: string
  skillProficiencies: string[]
  feature: string
}

export interface DnDSkill {
  name: string
  ability: string
}

export const classes: DnDClass[] = data.classes.map((c: any) => ({
  name: c.name,
  hitDie: c.hit_die,
  proficiencies: (c.proficiencies as any[]).map((p: any) => p.name),
  skillChoices: c.proficiency_choices?.[0]
    ? {
        choose: c.proficiency_choices[0].choose,
        from: (c.proficiency_choices[0].from as any[])
          .filter((p: any) => (p.name as string).startsWith('Skill:'))
          .map((p: any) => (p.name as string).replace('Skill: ', '')),
      }
    : { choose: 0, from: [] },
  subclasses: (c.subclasses as any[]).map((s: any) => s.name),
  savingThrows: (c.saving_throws as any[]).map((s: any) => s.name),
}))

export const races: DnDRace[] = data.races.map((r: any) => ({
  name: r.name,
  speed: r.speed,
  size: r.size,
  abilityBonuses: (r.ability_bonuses as any[]).map((b: any) => ({
    ability: b.name,
    bonus: b.bonus,
  })),
  traits: (r.traits as any[]).map((t: any) => t.name),
}))

export const spells: DnDSpell[] = data.spells.map((s: any) => ({
  name: s.name,
  level: s.level,
  school: s.school?.name ?? '',
  castingTime: s.casting_time,
  range: s.range,
  components: s.components ?? [],
  duration: s.duration,
  description: ((s.desc ?? []) as string[]).join(' '),
}))

export const backgrounds: DnDBackground[] = [
  { name: 'Acolyte',      skillProficiencies: ['Insight', 'Religion'],            feature: 'Shelter of the Faithful' },
  { name: 'Charlatan',    skillProficiencies: ['Deception', 'Sleight of Hand'],   feature: 'False Identity' },
  { name: 'Criminal',     skillProficiencies: ['Deception', 'Stealth'],           feature: 'Criminal Contact' },
  { name: 'Entertainer',  skillProficiencies: ['Acrobatics', 'Performance'],      feature: 'By Popular Demand' },
  { name: 'Folk Hero',    skillProficiencies: ['Animal Handling', 'Survival'],    feature: 'Rustic Hospitality' },
  { name: 'Guild Artisan',skillProficiencies: ['Insight', 'Persuasion'],          feature: 'Guild Membership' },
  { name: 'Hermit',       skillProficiencies: ['Medicine', 'Religion'],           feature: 'Discovery' },
  { name: 'Noble',        skillProficiencies: ['History', 'Persuasion'],          feature: 'Position of Privilege' },
  { name: 'Outlander',    skillProficiencies: ['Athletics', 'Survival'],          feature: 'Wanderer' },
  { name: 'Sage',         skillProficiencies: ['Arcana', 'History'],              feature: 'Researcher' },
  { name: 'Sailor',       skillProficiencies: ['Athletics', 'Perception'],        feature: "Ship's Passage" },
  { name: 'Soldier',      skillProficiencies: ['Athletics', 'Intimidation'],      feature: 'Military Rank' },
  { name: 'Urchin',       skillProficiencies: ['Sleight of Hand', 'Stealth'],     feature: 'City Secrets' },
]

export const skills: DnDSkill[] = data.skills.map((s: any) => ({
  name: s.name,
  ability: s.ability_score?.name ?? '',
}))
