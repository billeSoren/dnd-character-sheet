// D&D 5e Class Progression Data
// Complete level 1-20 features for all 13 classes

export interface ClassFeature {
  name: string
  description: string
}

export interface LevelData {
  level: number
  features: ClassFeature[]
  isASI: boolean
  isSubclassLevel: boolean
  spellSlots?: number[]
}

export type ClassName =
  | 'Artificer'
  | 'Barbarian'
  | 'Bard'
  | 'Cleric'
  | 'Druid'
  | 'Fighter'
  | 'Monk'
  | 'Paladin'
  | 'Ranger'
  | 'Rogue'
  | 'Sorcerer'
  | 'Warlock'
  | 'Wizard'

export const HIT_DICE: Record<ClassName, number> = {
  Barbarian: 12,
  Fighter: 10,
  Paladin: 10,
  Ranger: 10,
  Artificer: 8,
  Bard: 8,
  Cleric: 8,
  Druid: 8,
  Monk: 8,
  Rogue: 8,
  Warlock: 8,
  Sorcerer: 6,
  Wizard: 6,
}

export const SUBCLASS_LEVEL: Record<ClassName, number> = {
  Cleric: 1,
  Sorcerer: 1,
  Warlock: 1,
  Wizard: 2,
  Artificer: 3,
  Bard: 3,
  Druid: 3,
  Fighter: 3,
  Monk: 3,
  Paladin: 3,
  Ranger: 3,
  Rogue: 3,
  Barbarian: 3,
}

export const EXTRA_ASI_LEVELS: Partial<Record<ClassName, number[]>> = {
  Fighter: [6, 14],
  Rogue: [10],
}

export const BASE_ASI_LEVELS = [4, 8, 12, 16, 19]

export function getASILevels(className: ClassName): number[] {
  return [...BASE_ASI_LEVELS, ...(EXTRA_ASI_LEVELS[className] ?? [])].sort((a, b) => a - b)
}

export function getProficiencyBonus(totalLevel: number): number {
  return Math.floor((totalLevel - 1) / 4) + 2
}

export const FULL_CASTER_SLOTS: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
]

export const WARLOCK_PACT: { slots: number; slotLevel: number }[] = [
  { slots: 1, slotLevel: 1 },
  { slots: 2, slotLevel: 1 },
  { slots: 2, slotLevel: 2 },
  { slots: 2, slotLevel: 2 },
  { slots: 2, slotLevel: 3 },
  { slots: 2, slotLevel: 3 },
  { slots: 2, slotLevel: 4 },
  { slots: 2, slotLevel: 4 },
  { slots: 2, slotLevel: 5 },
  { slots: 2, slotLevel: 5 },
  { slots: 3, slotLevel: 5 },
  { slots: 3, slotLevel: 5 },
  { slots: 3, slotLevel: 5 },
  { slots: 3, slotLevel: 5 },
  { slots: 3, slotLevel: 5 },
  { slots: 3, slotLevel: 5 },
  { slots: 4, slotLevel: 5 },
  { slots: 4, slotLevel: 5 },
  { slots: 4, slotLevel: 5 },
  { slots: 4, slotLevel: 5 },
]

export function getSpellSlots(className: ClassName, classLevel: number): number[] {
  const L = Math.max(0, Math.min(19, classLevel - 1))
  const fullCasters = ['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Wizard']
  const halfCasters = ['Paladin', 'Ranger']

  if (fullCasters.includes(className)) return [...FULL_CASTER_SLOTS[L]]
  if (className === 'Warlock') {
    const w = WARLOCK_PACT[L]
    const row = Array(9).fill(0)
    row[w.slotLevel - 1] = w.slots
    return row
  }
  if (halfCasters.includes(className)) {
    const eff = Math.max(0, Math.floor(classLevel / 2) - 1)
    return classLevel < 2 ? Array(9).fill(0) : [...FULL_CASTER_SLOTS[Math.min(eff, 19)]]
  }
  if (className === 'Artificer') {
    const eff = Math.max(0, Math.floor((classLevel + 1) / 3) - 1)
    return classLevel < 2 ? Array(9).fill(0) : [...FULL_CASTER_SLOTS[Math.min(eff, 19)]]
  }
  return Array(9).fill(0)
}

// ---------------------------------------------------------------------------
// CLASS FEATURES
// ---------------------------------------------------------------------------

export const CLASS_FEATURES: Record<ClassName, Record<number, ClassFeature[]>> = {

  // =========================================================================
  Artificer: {
    1: [
      {
        name: 'Magical Tinkering',
        description:
          'You learn to invest a spark of magic in mundane objects. You can touch a Tiny nonmagical object as an action and give it a minor magical property from a list of options.',
      },
      {
        name: 'Spellcasting',
        description:
          'You have studied the workings of magic and can cast artificer spells using Intelligence as your spellcasting ability. You use artisan\'s tools as your spellcasting focus.',
      },
    ],
    2: [
      {
        name: 'Infuse Item',
        description:
          'You gain the ability to imbue mundane items with certain magical infusions. You learn 4 infusions and can have a limited number of infused items active at once.',
      },
    ],
    3: [
      {
        name: 'Artificer Specialist',
        description:
          'You choose the type of specialist you are: Alchemist, Armorer, Artillerist, or Battle Smith. Your choice grants you features at 3rd, 5th, 9th, and 15th levels.',
      },
      {
        name: 'The Right Tool for the Job',
        description:
          'You learn to produce exactly the tool you need. With thieves\' tools or artisan\'s tools in hand, you can magically create one set of artisan\'s tools in an unoccupied space within 5 feet of you during a short or long rest.',
      },
    ],
    4: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    5: [
      {
        name: 'Arcane Jolt',
        description:
          'Your magic-empowered attacks deal an extra 2d6 force damage or restore 2d6 hit points to a creature, usable a number of times equal to your Intelligence modifier per long rest.',
      },
    ],
    6: [
      {
        name: 'Tool Expertise',
        description:
          'Your proficiency bonus is now doubled for any ability check that uses your proficiency with a tool.',
      },
      {
        name: 'Subclass Feature',
        description:
          'You gain a feature from your Artificer Specialist subclass.',
      },
    ],
    7: [
      {
        name: 'Flash of Genius',
        description:
          'You gain the ability to come up with solutions under pressure. When you or another creature you can see within 30 feet makes an ability check or saving throw, you can use your reaction to add your Intelligence modifier to the roll.',
      },
    ],
    8: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    9: [
      {
        name: 'Subclass Feature',
        description:
          'You gain a feature from your Artificer Specialist subclass.',
      },
    ],
    10: [
      {
        name: 'Magic Item Adept',
        description:
          'You achieve a profound understanding of how to use and make magic items. You can attune to up to 4 magic items at once, and crafting a common or uncommon magic item takes you a quarter of the normal time and half the normal gold.',
      },
    ],
    11: [
      {
        name: 'Spell-Storing Item',
        description:
          'You can now store a spell in an object. Whenever you finish a long rest, you can touch one simple or martial weapon or one item that you can use as a spellcasting focus, and store a spell of 1st or 2nd level in it.',
      },
    ],
    12: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    13: [],
    14: [
      {
        name: 'Magic Item Savant',
        description:
          'Your skill with magic items deepens. You can attune to up to 5 magic items at once, and you ignore all class, race, spell, and level requirements on attuning to or using a magic item.',
      },
      {
        name: 'Subclass Feature',
        description:
          'You gain a feature from your Artificer Specialist subclass.',
      },
    ],
    15: [
      {
        name: 'Soul of Artifice',
        description:
          'You have developed a mystical connection to your magic items. You gain a +1 bonus to all saving throws per magic item you are currently attuned to. Additionally, if you are reduced to 0 hit points, you can use your reaction to end one of your artificer infusions, causing you to drop to 1 hit point instead.',
      },
    ],
    16: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    17: [],
    18: [
      {
        name: 'Magic Item Master',
        description:
          'You can now attune to up to 6 magic items at once.',
      },
    ],
    19: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    20: [
      {
        name: 'Soul of Artifice (Improved)',
        description:
          'At 20th level, your understanding of magic items is unmatched. You can attune to up to 6 magic items, and the saving throw bonus from Soul of Artifice reaches its maximum potential.',
      },
    ],
  },

  // =========================================================================
  Barbarian: {
    1: [
      {
        name: 'Rage',
        description:
          'In battle you fight with primal ferocity. On your turn you can enter a rage as a bonus action, gaining advantage on Strength checks and saving throws, bonus damage on melee attacks, and resistance to bludgeoning, piercing, and slashing damage.',
      },
      {
        name: 'Unarmored Defense',
        description:
          'While you are not wearing any armor, your Armor Class equals 10 + your Dexterity modifier + your Constitution modifier. You can use a shield and still gain this benefit.',
      },
    ],
    2: [
      {
        name: 'Reckless Attack',
        description:
          'You can throw aside all concern for defense to attack with fierce desperation. When you make your first attack on your turn, you can decide to attack recklessly, giving you advantage on attacks using Strength but attack rolls against you also have advantage until your next turn.',
      },
      {
        name: 'Danger Sense',
        description:
          'You gain an uncanny sense of when things nearby aren\'t as they should be, giving you advantage on Dexterity saving throws against effects you can see, such as traps and spells. You must not be blinded, deafened, or incapacitated.',
      },
    ],
    3: [
      {
        name: 'Primal Path',
        description:
          'You choose a path that shapes the nature of your rage. Your choice grants you features at 3rd, 6th, 10th, and 14th levels.',
      },
      {
        name: 'Primal Knowledge',
        description:
          'You gain proficiency in one skill from the barbarian\'s skill list of your choice.',
      },
    ],
    4: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    5: [
      {
        name: 'Extra Attack',
        description:
          'You can attack twice, instead of once, whenever you take the Attack action on your turn.',
      },
      {
        name: 'Fast Movement',
        description:
          'Your speed increases by 10 feet while you aren\'t wearing heavy armor.',
      },
    ],
    6: [
      {
        name: 'Path Feature',
        description:
          'You gain a feature granted by your Primal Path.',
      },
    ],
    7: [
      {
        name: 'Feral Instinct',
        description:
          'Your instincts are so honed that you have advantage on initiative rolls. Additionally, if you are surprised at the beginning of combat and aren\'t incapacitated, you can act normally on your first turn by entering your rage.',
      },
      {
        name: 'Instinctive Pounce',
        description:
          'As part of the bonus action you take to enter your rage, you can move up to half your speed.',
      },
    ],
    8: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    9: [
      {
        name: 'Brutal Strike',
        description:
          'If you use Reckless Attack, you can forgo one of the advantage attack rolls to deal an additional 1d10 damage of the weapon\'s type on a hit.',
      },
    ],
    10: [
      {
        name: 'Path Feature',
        description:
          'You gain a feature granted by your Primal Path.',
      },
    ],
    11: [
      {
        name: 'Relentless Rage',
        description:
          'Your rage can keep you fighting despite grievous wounds. If you drop to 0 hit points while you\'re raging and don\'t die outright, you can make a DC 10 Constitution saving throw to drop to 1 hit point instead. The DC increases by 5 each time you use this feature until you finish a short or long rest.',
      },
    ],
    12: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    13: [
      {
        name: 'Brutal Strike (Improved)',
        description:
          'Your Brutal Strike gains additional options: you can forgo advantage to impose the Hamstring Blow (reduce speed by 15 ft.) or Staggering Blow (disadvantage on the next attack roll before your next turn) effect in addition to the bonus damage.',
      },
    ],
    14: [
      {
        name: 'Path Feature',
        description:
          'You gain a feature granted by your Primal Path.',
      },
    ],
    15: [
      {
        name: 'Persistent Rage',
        description:
          'Your rage is so fierce that it ends early only if you fall unconscious or if you choose to end it.',
      },
    ],
    16: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    17: [
      {
        name: 'Brutal Strike (Improved)',
        description:
          'When you use Brutal Strike, you can now apply two of its effects at once, and the bonus damage increases to 2d10.',
      },
    ],
    18: [
      {
        name: 'Indomitable Might',
        description:
          'If your total for a Strength check is less than your Strength score, you can use that score in place of the total.',
      },
    ],
    19: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    20: [
      {
        name: 'Primal Champion',
        description:
          'You embody the power of the wilds. Your Strength and Constitution scores each increase by 4, and your maximums for those scores each become 24.',
      },
    ],
  },

  // =========================================================================
  Bard: {
    1: [
      {
        name: 'Bardic Inspiration',
        description:
          'You can inspire others through stirring words or music. As a bonus action, you grant a creature within 60 feet a Bardic Inspiration die (d6) it can add to one ability check, attack roll, or saving throw within 10 minutes.',
      },
      {
        name: 'Spellcasting',
        description:
          'You have learned to untangle and reshape the fabric of reality in harmony with your wishes and music. You use Charisma as your spellcasting ability.',
      },
    ],
    2: [
      {
        name: 'Jack of All Trades',
        description:
          'You can add half your proficiency bonus, rounded down, to any ability check that doesn\'t already include your proficiency bonus.',
      },
      {
        name: 'Song of Rest',
        description:
          'You can use soothing music or oration to help revitalize your wounded allies during a short rest. Creatures that spend Hit Dice during the rest regain an extra 1d6 hit points.',
      },
    ],
    3: [
      {
        name: 'Bard College',
        description:
          'You delve into the advanced techniques of a bard college of your choice, such as the College of Lore or College of Valor. Your choice grants you features at 3rd, 6th, and 14th levels.',
      },
      {
        name: 'Expertise',
        description:
          'Choose two of your skill proficiencies. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.',
      },
    ],
    4: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    5: [
      {
        name: 'Bardic Inspiration (d8)',
        description:
          'Your Bardic Inspiration die changes from a d6 to a d8.',
      },
      {
        name: 'Font of Inspiration',
        description:
          'You regain all your expended uses of Bardic Inspiration when you finish a short or long rest.',
      },
    ],
    6: [
      {
        name: 'Countercharm',
        description:
          'You gain the ability to use musical notes or words of power to disrupt mind-influencing effects. As an action, you can start a performance that grants all friendly creatures within 30 feet advantage on saving throws against being frightened or charmed.',
      },
      {
        name: 'College Feature',
        description:
          'You gain a feature from your Bard College.',
      },
    ],
    7: [],
    8: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    9: [
      {
        name: 'Song of Rest (d8)',
        description:
          'The extra hit points gained from your Song of Rest increase to 1d8.',
      },
    ],
    10: [
      {
        name: 'Bardic Inspiration (d10)',
        description:
          'Your Bardic Inspiration die changes from a d8 to a d10.',
      },
      {
        name: 'Expertise',
        description:
          'Choose two more of your skill proficiencies. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.',
      },
      {
        name: 'Magical Secrets',
        description:
          'You have plundered magical knowledge from a wide spectrum of disciplines. Choose two spells from any classes. The spells count as bard spells for you.',
      },
    ],
    11: [],
    12: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    13: [
      {
        name: 'Song of Rest (d10)',
        description:
          'The extra hit points gained from your Song of Rest increase to 1d10.',
      },
    ],
    14: [
      {
        name: 'Magical Secrets',
        description:
          'You learn two additional spells from any class. The spells count as bard spells for you.',
      },
      {
        name: 'College Feature',
        description:
          'You gain a feature from your Bard College.',
      },
    ],
    15: [
      {
        name: 'Bardic Inspiration (d12)',
        description:
          'Your Bardic Inspiration die changes from a d10 to a d12.',
      },
    ],
    16: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    17: [
      {
        name: 'Song of Rest (d12)',
        description:
          'The extra hit points gained from your Song of Rest increase to 1d12.',
      },
    ],
    18: [
      {
        name: 'Magical Secrets',
        description:
          'You learn two additional spells from any class. The spells count as bard spells for you.',
      },
    ],
    19: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    20: [
      {
        name: 'Superior Inspiration',
        description:
          'When you roll initiative and have no uses of Bardic Inspiration left, you regain one use.',
      },
    ],
  },

  // =========================================================================
  Cleric: {
    1: [
      {
        name: 'Divine Domain',
        description:
          'You choose a domain shaped by your deity, such as Life, War, or Knowledge. Your choice grants you domain spells and other features at 1st, 2nd, 6th, 8th, and 17th levels.',
      },
      {
        name: 'Spellcasting',
        description:
          'As a conduit for divine power, you can cast cleric spells. Wisdom is your spellcasting ability, and you use a holy symbol as your spellcasting focus.',
      },
    ],
    2: [
      {
        name: 'Channel Divinity (1/rest)',
        description:
          'You gain the ability to channel divine energy directly from your deity. You have one use per short or long rest. Turn Undead: each undead that can see or hear you must make a Wisdom saving throw or be turned for 1 minute.',
      },
      {
        name: 'Divine Domain Feature',
        description:
          'You gain a Channel Divinity option and other feature from your Divine Domain.',
      },
    ],
    3: [],
    4: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    5: [
      {
        name: 'Destroy Undead (CR 1/2)',
        description:
          'When an undead fails its saving throw against your Turn Undead feature, the creature is instantly destroyed if its challenge rating is at or below 1/2.',
      },
    ],
    6: [
      {
        name: 'Channel Divinity (2/rest)',
        description:
          'You can now use Channel Divinity twice between rests.',
      },
      {
        name: 'Divine Domain Feature',
        description:
          'You gain an additional feature from your Divine Domain.',
      },
    ],
    7: [],
    8: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
      {
        name: 'Destroy Undead (CR 1)',
        description:
          'Your Destroy Undead feature now destroys undead of CR 1 or lower.',
      },
      {
        name: 'Divine Domain Feature',
        description:
          'You gain a Potent Spellcasting or Divine Strike feature from your Divine Domain.',
      },
    ],
    9: [],
    10: [
      {
        name: 'Divine Intervention',
        description:
          'You can call on your deity to intervene on your behalf. You describe the assistance you seek and roll percentile dice; if you roll equal to or lower than your cleric level, your deity intervenes. The DM chooses the nature of the intervention.',
      },
    ],
    11: [
      {
        name: 'Destroy Undead (CR 2)',
        description:
          'Your Destroy Undead feature now destroys undead of CR 2 or lower.',
      },
    ],
    12: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    13: [],
    14: [
      {
        name: 'Destroy Undead (CR 3)',
        description:
          'Your Destroy Undead feature now destroys undead of CR 3 or lower.',
      },
    ],
    15: [],
    16: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    17: [
      {
        name: 'Destroy Undead (CR 4)',
        description:
          'Your Destroy Undead feature now destroys undead of CR 4 or lower.',
      },
      {
        name: 'Divine Domain Feature',
        description:
          'You gain a powerful capstone feature from your Divine Domain.',
      },
    ],
    18: [
      {
        name: 'Channel Divinity (3/rest)',
        description:
          'You can now use Channel Divinity three times between rests.',
      },
    ],
    19: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    20: [
      {
        name: 'Divine Intervention (Improved)',
        description:
          'Your call for divine intervention succeeds automatically — no roll required.',
      },
    ],
  },

  // =========================================================================
  Druid: {
    1: [
      {
        name: 'Druidic',
        description:
          'You know Druidic, the secret language of druids. You can speak the language and use it to leave hidden messages. Others spot the message with a DC 15 Perception check but can\'t decipher it without magic.',
      },
      {
        name: 'Spellcasting',
        description:
          'Drawing on the divine essence of nature itself, you can cast druid spells. Wisdom is your spellcasting ability, and you can use a druidic focus as your spellcasting focus.',
      },
    ],
    2: [
      {
        name: 'Wild Shape',
        description:
          'You can use your action to magically assume the shape of a beast you have seen before. You can use this feature twice per short or long rest, transforming into beasts up to CR 1/4 (no flying or swimming speed).',
      },
      {
        name: 'Druid Circle',
        description:
          'You choose to identify with a circle of druids, such as the Circle of the Land or Circle of the Moon. Your choice grants you features at 2nd, 6th, 10th, and 14th levels.',
      },
    ],
    3: [],
    4: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
      {
        name: 'Wild Shape Improvement',
        description:
          'You can now transform into beasts up to CR 1/2, and beasts that have a swimming speed become available to you.',
      },
    ],
    5: [],
    6: [
      {
        name: 'Circle Feature',
        description:
          'You gain a feature from your Druid Circle.',
      },
    ],
    7: [],
    8: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
      {
        name: 'Wild Shape Improvement',
        description:
          'You can now transform into beasts up to CR 1 and gain access to beasts with a flying speed.',
      },
    ],
    9: [],
    10: [
      {
        name: 'Circle Feature',
        description:
          'You gain a feature from your Druid Circle.',
      },
    ],
    11: [],
    12: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    13: [],
    14: [
      {
        name: 'Circle Feature',
        description:
          'You gain a feature from your Druid Circle.',
      },
    ],
    15: [],
    16: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    17: [],
    18: [
      {
        name: 'Beast Spells',
        description:
          'You can cast many of your druid spells in any shape you assume using Wild Shape. You can perform the somatic and verbal components of a druid spell while in a beast shape, but you aren\'t able to provide material components.',
      },
      {
        name: 'Timeless Body',
        description:
          'The primal magic that you wield causes you to age more slowly. For every 10 years that pass, your body ages only 1 year.',
      },
    ],
    19: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    20: [
      {
        name: 'Archdruid',
        description:
          'You can use your Wild Shape an unlimited number of times. Additionally, you can ignore the verbal and somatic components of your druid spells, as well as any material components that lack a cost and aren\'t consumed.',
      },
    ],
  },

  // =========================================================================
  Fighter: {
    1: [
      {
        name: 'Fighting Style',
        description:
          'You adopt a particular style of fighting as your specialty. Choose a Fighting Style option such as Archery, Defense, Dueling, Great Weapon Fighting, Protection, or Two-Weapon Fighting.',
      },
      {
        name: 'Second Wind',
        description:
          'You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn you can use a bonus action to regain hit points equal to 1d10 + your fighter level. Once used, you must finish a short or long rest to use it again.',
      },
    ],
    2: [
      {
        name: 'Action Surge (×1)',
        description:
          'You can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action. Once used, you must finish a short or long rest before using it again.',
      },
    ],
    3: [
      {
        name: 'Martial Archetype',
        description:
          'You choose an archetype that you strive to emulate in your combat styles and techniques, such as Champion, Battle Master, or Eldritch Knight. Your choice grants you features at 3rd, 7th, 10th, 15th, and 18th levels.',
      },
    ],
    4: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    5: [
      {
        name: 'Extra Attack',
        description:
          'You can attack twice, instead of once, whenever you take the Attack action on your turn.',
      },
    ],
    6: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    7: [
      {
        name: 'Archetype Feature',
        description:
          'You gain a feature from your Martial Archetype.',
      },
    ],
    8: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    9: [
      {
        name: 'Indomitable (×1)',
        description:
          'You can reroll a saving throw that you fail. If you do so, you must use the new roll. You can use this feature once per long rest.',
      },
    ],
    10: [
      {
        name: 'Archetype Feature',
        description:
          'You gain a feature from your Martial Archetype.',
      },
    ],
    11: [
      {
        name: 'Extra Attack (×2)',
        description:
          'You can attack three times whenever you take the Attack action on your turn.',
      },
    ],
    12: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    13: [
      {
        name: 'Indomitable (×2)',
        description:
          'You can now use Indomitable twice between long rests.',
      },
    ],
    14: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    15: [
      {
        name: 'Archetype Feature',
        description:
          'You gain a feature from your Martial Archetype.',
      },
    ],
    16: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    17: [
      {
        name: 'Action Surge (×2)',
        description:
          'You can use Action Surge twice before needing a rest, but never more than once on the same turn.',
      },
      {
        name: 'Indomitable (×3)',
        description:
          'You can now use Indomitable three times between long rests.',
      },
    ],
    18: [
      {
        name: 'Archetype Feature',
        description:
          'You gain a feature from your Martial Archetype.',
      },
    ],
    19: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    20: [
      {
        name: 'Extra Attack (×3)',
        description:
          'You can attack four times whenever you take the Attack action on your turn.',
      },
    ],
  },

  // =========================================================================
  Monk: {
    1: [
      {
        name: 'Unarmored Defense',
        description:
          'While you are wearing no armor and not wielding a shield, your AC equals 10 + your Dexterity modifier + your Wisdom modifier.',
      },
      {
        name: 'Martial Arts',
        description:
          'Your practice of martial arts gives you mastery of combat styles that use unarmed strikes and monk weapons. You can use Dexterity instead of Strength, your unarmed strikes deal a Martial Arts die of damage, and you can make one unarmed strike as a bonus action.',
      },
    ],
    2: [
      {
        name: 'Ki',
        description:
          'Your training allows you to harness the mystic energy of ki. You have ki points equal to your monk level and regain all spent ki on a short or long rest. You can spend them on Flurry of Blows, Patient Defense, and Step of the Wind.',
      },
      {
        name: 'Unarmored Movement',
        description:
          'Your speed increases by 10 feet while you are not wearing armor or wielding a shield. This increases as you level up.',
      },
    ],
    3: [
      {
        name: 'Monastic Tradition',
        description:
          'You commit yourself to a monastic tradition, such as the Way of the Open Hand, Way of Shadow, or Way of the Four Elements. Your tradition grants you features at 3rd, 6th, 11th, and 17th levels.',
      },
      {
        name: 'Deflect Missiles',
        description:
          'You can use your reaction to deflect or catch the missile when you are hit by a ranged weapon attack. The damage is reduced by 1d10 + Dexterity + monk level. If reduced to 0, you can catch it and spend 1 ki to make a ranged attack with it.',
      },
    ],
    4: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
      {
        name: 'Slow Fall',
        description:
          'You can use your reaction when you fall to reduce any falling damage you take by an amount equal to five times your monk level.',
      },
    ],
    5: [
      {
        name: 'Extra Attack',
        description:
          'You can attack twice, instead of once, whenever you take the Attack action on your turn.',
      },
      {
        name: 'Stunning Strike',
        description:
          'You can interfere with the flow of ki in an opponent\'s body. When you hit another creature with a melee weapon attack, you can spend 1 ki point to attempt a stunning strike. The target must make a Constitution saving throw or be stunned until the end of your next turn.',
      },
    ],
    6: [
      {
        name: 'Ki-Empowered Strikes',
        description:
          'Your unarmed strikes count as magical for the purpose of overcoming resistance and immunity to nonmagical attacks and damage.',
      },
      {
        name: 'Tradition Feature',
        description:
          'You gain a feature from your Monastic Tradition.',
      },
    ],
    7: [
      {
        name: 'Evasion',
        description:
          'Your instinctive agility lets you dodge out of the way of certain area effects, such as a blue dragon\'s lightning breath or a fireball spell. When subjected to an effect that allows a Dexterity save for half damage, you take no damage on a success and half on a failure.',
      },
      {
        name: 'Stillness of Mind',
        description:
          'You can use your action to end one effect on yourself that is causing you to be charmed or frightened.',
      },
    ],
    8: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    9: [
      {
        name: 'Unarmored Movement Improvement',
        description:
          'You gain the ability to move along vertical surfaces and across liquids on your turn without falling during the move.',
      },
    ],
    10: [
      {
        name: 'Purity of Body',
        description:
          'Your mastery of the ki flowing through you makes you immune to disease and poison.',
      },
    ],
    11: [
      {
        name: 'Tradition Feature',
        description:
          'You gain a feature from your Monastic Tradition.',
      },
    ],
    12: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    13: [
      {
        name: 'Tongue of the Sun and Moon',
        description:
          'You learn to touch the ki of other minds so that you understand all spoken languages, and all creatures that can understand a language can understand what you say.',
      },
    ],
    14: [
      {
        name: 'Diamond Soul',
        description:
          'Your mastery of ki grants you proficiency in all saving throws. Additionally, whenever you make a saving throw and fail, you can spend 1 ki point to reroll it and take the second result.',
      },
    ],
    15: [
      {
        name: 'Timeless Body',
        description:
          'Your ki sustains you so that you suffer none of the frailty of old age, and you can\'t be aged magically. You also no longer need food or water.',
      },
    ],
    16: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    17: [
      {
        name: 'Tradition Feature',
        description:
          'You gain a feature from your Monastic Tradition.',
      },
    ],
    18: [
      {
        name: 'Empty Body',
        description:
          'You can use your action to spend 4 ki points to become invisible for 1 minute. During that time, you also have resistance to all damage but force damage. Additionally, you can spend 8 ki points to cast the astral projection spell without material components.',
      },
    ],
    19: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    20: [
      {
        name: 'Perfect Self',
        description:
          'When you roll for initiative and have no ki points remaining, you regain 4 ki points.',
      },
    ],
  },

  // =========================================================================
  Paladin: {
    1: [
      {
        name: 'Divine Sense',
        description:
          'The presence of strong evil registers on your senses like a noxious odor. As an action, you can detect the location of any celestial, fiend, or undead within 60 feet that is not behind total cover. You can use this feature a number of times equal to 1 + your Charisma modifier per long rest.',
      },
      {
        name: 'Lay on Hands',
        description:
          'Your blessed touch can heal wounds. You have a pool of healing power that replenishes on a long rest, equal to your paladin level × 5. As an action you can touch a creature and restore any number of hit points from this pool.',
      },
    ],
    2: [
      {
        name: 'Fighting Style',
        description:
          'You adopt a particular style of fighting as your specialty. Options include Defense, Dueling, Great Weapon Fighting, and Protection.',
      },
      {
        name: 'Spellcasting',
        description:
          'You have learned to draw on divine magic through meditation and prayer to cast paladin spells. Charisma is your spellcasting ability.',
      },
      {
        name: 'Divine Smite',
        description:
          'When you hit a creature with a melee weapon attack, you can expend one paladin spell slot to deal radiant damage to the target, in addition to the weapon\'s damage (2d8 per slot level, +1d8 vs. undead/fiends, max 5d8).',
      },
    ],
    3: [
      {
        name: 'Divine Health',
        description:
          'The divine magic flowing through you makes you immune to disease.',
      },
      {
        name: 'Sacred Oath',
        description:
          'You swear the oath that binds you as a paladin forever, such as Devotion, the Ancients, or Vengeance. Your oath grants you features at 3rd, 7th, 15th, and 20th levels, as well as Oath Spells and a Channel Divinity option.',
      },
    ],
    4: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    5: [
      {
        name: 'Extra Attack',
        description:
          'You can attack twice, instead of once, whenever you take the Attack action on your turn.',
      },
    ],
    6: [
      {
        name: 'Aura of Protection',
        description:
          'Whenever you or a friendly creature within 10 feet of you must make a saving throw, the creature gains a bonus to the saving throw equal to your Charisma modifier (minimum +1). You must be conscious to grant this bonus.',
      },
    ],
    7: [
      {
        name: 'Sacred Oath Feature',
        description:
          'You gain a feature from your Sacred Oath.',
      },
    ],
    8: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    9: [],
    10: [
      {
        name: 'Aura of Courage',
        description:
          'You and friendly creatures within 10 feet of you can\'t be frightened while you are conscious.',
      },
    ],
    11: [
      {
        name: 'Improved Divine Smite',
        description:
          'You are so suffused with righteous might that all your melee weapon strikes carry divine power with them. Whenever you hit a creature with a melee weapon, the creature takes an extra 1d8 radiant damage.',
      },
    ],
    12: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    13: [],
    14: [
      {
        name: 'Cleansing Touch',
        description:
          'You can use your action to end one spell on yourself or on one willing creature that you touch. You can use this feature a number of times equal to your Charisma modifier (minimum once) per long rest.',
      },
    ],
    15: [
      {
        name: 'Sacred Oath Feature',
        description:
          'You gain a feature from your Sacred Oath.',
      },
    ],
    16: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    17: [],
    18: [
      {
        name: 'Aura Improvements',
        description:
          'The range of your Aura of Protection and Aura of Courage increases to 30 feet.',
      },
    ],
    19: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    20: [
      {
        name: 'Sacred Oath Capstone',
        description:
          'You gain the 20th-level capstone feature of your Sacred Oath, such as Holy Nimbus (Devotion) or Elder Champion (Ancients), granting powerful divine abilities.',
      },
    ],
  },

  // =========================================================================
  Ranger: {
    1: [
      {
        name: 'Favored Enemy',
        description:
          'You have significant experience studying, tracking, hunting, and even talking to a certain type of enemy. Choose a type of favored enemy. You have advantage on Survival checks to track them and on Intelligence checks to recall information about them.',
      },
      {
        name: 'Natural Explorer',
        description:
          'You are particularly familiar with one type of natural environment. Choose a favored terrain type. When you make an Intelligence or Wisdom check related to it, you double your proficiency bonus, and you gain additional exploration benefits.',
      },
    ],
    2: [
      {
        name: 'Fighting Style',
        description:
          'You adopt a particular style of fighting as your specialty. Options include Archery, Defense, Dueling, and Two-Weapon Fighting.',
      },
      {
        name: 'Spellcasting',
        description:
          'You have learned to use the magical essence of nature to cast spells. Wisdom is your spellcasting ability.',
      },
    ],
    3: [
      {
        name: 'Ranger Archetype',
        description:
          'You choose an archetype that you strive to emulate: Beast Master, Hunter, or others. Your choice grants you features at 3rd, 7th, 11th, and 15th levels.',
      },
      {
        name: 'Primeval Awareness',
        description:
          'You can use your action and expend one ranger spell slot to focus your awareness on the region around you. For 1 minute per spell slot level, you can sense whether certain types of creatures are within 1 mile of you (6 miles in favored terrain).',
      },
    ],
    4: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    5: [
      {
        name: 'Extra Attack',
        description:
          'You can attack twice, instead of once, whenever you take the Attack action on your turn.',
      },
    ],
    6: [
      {
        name: 'Favored Enemy Improvement',
        description:
          'You choose one additional favored enemy, and you gain a language associated with your choice.',
      },
      {
        name: 'Natural Explorer Improvement',
        description:
          'You choose one additional favored terrain type.',
      },
    ],
    7: [
      {
        name: 'Archetype Feature',
        description:
          'You gain a feature from your Ranger Archetype.',
      },
    ],
    8: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
      {
        name: "Land's Stride",
        description:
          'Moving through nonmagical difficult terrain costs you no extra movement. You can also pass through nonmagical plants without being slowed by them and without taking damage from them if they have thorns, spines, or a similar hazard.',
      },
    ],
    9: [],
    10: [
      {
        name: 'Natural Explorer Improvement',
        description:
          'You choose one additional favored terrain type.',
      },
      {
        name: 'Hide in Plain Sight',
        description:
          'You can spend 1 minute creating camouflage. Once camouflaged against a surface, you can try to hide by pressing up against it, gaining a +10 bonus to Dexterity (Stealth) checks as long as you remain still.',
      },
    ],
    11: [
      {
        name: 'Archetype Feature',
        description:
          'You gain a feature from your Ranger Archetype.',
      },
    ],
    12: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    13: [],
    14: [
      {
        name: 'Favored Enemy Improvement',
        description:
          'You choose one additional favored enemy, and you gain a language associated with your choice.',
      },
      {
        name: 'Vanish',
        description:
          'You can use the Hide action as a bonus action on your turn. Also, you can\'t be tracked by nonmagical means, unless you choose to leave a trail.',
      },
    ],
    15: [
      {
        name: 'Archetype Feature',
        description:
          'You gain a feature from your Ranger Archetype.',
      },
    ],
    16: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    17: [],
    18: [
      {
        name: 'Feral Senses',
        description:
          'You gain preternatural senses that help you fight creatures you can\'t see. When you attack a creature you can\'t see, you don\'t have disadvantage on the attack roll. You are also aware of the location of any invisible creature within 30 feet.',
      },
    ],
    19: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    20: [
      {
        name: 'Foe Slayer',
        description:
          'You become an unparalleled hunter. Once on each of your turns, you can add your Wisdom modifier to the attack roll or damage roll of an attack you make against one of your favored enemies.',
      },
    ],
  },

  // =========================================================================
  Rogue: {
    1: [
      {
        name: 'Expertise',
        description:
          'Choose two of your skill proficiencies, or one skill proficiency and your proficiency with thieves\' tools. Your proficiency bonus is doubled for any ability check using the chosen proficiencies.',
      },
      {
        name: 'Sneak Attack (1d6)',
        description:
          'Once per turn, you can deal extra damage to one creature you hit with an attack if you have advantage on the attack roll or if an ally is within 5 feet of the target. The extra damage is 1d6.',
      },
      {
        name: "Thieves' Cant",
        description:
          'You have learned thieves\' cant, a secret mix of dialect, jargon, and code that allows you to hide messages in seemingly normal conversation. It takes four times longer to convey such a message.',
      },
    ],
    2: [
      {
        name: 'Cunning Action',
        description:
          'Your quick thinking and agility allow you to move and act quickly. You can take a bonus action on each of your turns to take the Dash, Disengage, or Hide action.',
      },
    ],
    3: [
      {
        name: 'Roguish Archetype',
        description:
          'You choose an archetype to emulate in the exercise of your roguish abilities, such as Thief, Assassin, or Arcane Trickster. Your choice grants features at 3rd, 9th, 13th, and 17th levels.',
      },
      {
        name: 'Sneak Attack (2d6)',
        description:
          'Your Sneak Attack damage increases to 2d6.',
      },
    ],
    4: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    5: [
      {
        name: 'Uncanny Dodge',
        description:
          'When an attacker that you can see hits you with an attack, you can use your reaction to halve the attack\'s damage against you.',
      },
      {
        name: 'Sneak Attack (3d6)',
        description:
          'Your Sneak Attack damage increases to 3d6.',
      },
    ],
    6: [
      {
        name: 'Expertise',
        description:
          'Choose two more of your skill proficiencies. Your proficiency bonus is doubled for ability checks using those proficiencies.',
      },
      {
        name: 'Sneak Attack (4d6)',
        description:
          'Your Sneak Attack damage increases to 4d6.',
      },
    ],
    7: [
      {
        name: 'Evasion',
        description:
          'When you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw, and only half damage if you fail.',
      },
      {
        name: 'Sneak Attack (4d6)',
        description:
          'Your Sneak Attack damage remains at 4d6.',
      },
    ],
    8: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    9: [
      {
        name: 'Archetype Feature',
        description:
          'You gain a feature from your Roguish Archetype.',
      },
      {
        name: 'Sneak Attack (5d6)',
        description:
          'Your Sneak Attack damage increases to 5d6.',
      },
    ],
    10: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    11: [
      {
        name: 'Reliable Talent',
        description:
          'You have refined your chosen skills until they approach perfection. Whenever you make an ability check that lets you add your proficiency bonus, you can treat a d20 roll of 9 or lower as a 10.',
      },
      {
        name: 'Sneak Attack (6d6)',
        description:
          'Your Sneak Attack damage increases to 6d6.',
      },
    ],
    12: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    13: [
      {
        name: 'Archetype Feature',
        description:
          'You gain a feature from your Roguish Archetype.',
      },
      {
        name: 'Sneak Attack (7d6)',
        description:
          'Your Sneak Attack damage increases to 7d6.',
      },
    ],
    14: [
      {
        name: 'Blindsense',
        description:
          'If you are able to hear, you are aware of the location of any hidden or invisible creature within 10 feet of you.',
      },
      {
        name: 'Sneak Attack (7d6)',
        description:
          'Your Sneak Attack damage remains at 7d6.',
      },
    ],
    15: [
      {
        name: 'Slippery Mind',
        description:
          'You have acquired greater mental strength. You gain proficiency in Wisdom saving throws.',
      },
      {
        name: 'Sneak Attack (8d6)',
        description:
          'Your Sneak Attack damage increases to 8d6.',
      },
    ],
    16: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    17: [
      {
        name: 'Archetype Feature',
        description:
          'You gain a feature from your Roguish Archetype.',
      },
      {
        name: 'Sneak Attack (9d6)',
        description:
          'Your Sneak Attack damage increases to 9d6.',
      },
    ],
    18: [
      {
        name: 'Elusive',
        description:
          'You are so evasive that attackers rarely gain the upper hand against you. No attack roll has advantage against you while you aren\'t incapacitated.',
      },
      {
        name: 'Sneak Attack (10d6)',
        description:
          'Your Sneak Attack damage increases to 10d6.',
      },
    ],
    19: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    20: [
      {
        name: 'Stroke of Luck',
        description:
          'You have an uncanny knack for succeeding when you need to. If your attack misses a target within range, you can turn the miss into a hit. Alternatively, if you fail an ability check, you can treat the d20 roll as a 20. Once used, you must finish a short or long rest before using this feature again.',
      },
      {
        name: 'Sneak Attack (10d6)',
        description:
          'Your Sneak Attack damage remains at 10d6.',
      },
    ],
  },

  // =========================================================================
  Sorcerer: {
    1: [
      {
        name: 'Sorcerous Origin',
        description:
          'Choose a sorcerous origin, which describes the source of your innate magical power, such as Draconic Bloodline or Wild Magic. Your choice grants you features at 1st, 6th, 14th, and 18th levels.',
      },
      {
        name: 'Spellcasting',
        description:
          'An event in your past, or in the life of a parent or ancestor, left an indelible mark on you, infusing you with arcane magic. You use Charisma as your spellcasting ability.',
      },
    ],
    2: [
      {
        name: 'Font of Magic',
        description:
          'You tap into a deep wellspring of magic within yourself. You have sorcery points equal to your sorcerer level. You can spend them to create spell slots or fuel special Metamagic effects. You regain all spent sorcery points on a long rest.',
      },
    ],
    3: [
      {
        name: 'Metamagic (2 options)',
        description:
          'You gain the ability to twist your spells to suit your needs. You gain 2 Metamagic options such as Careful Spell, Distant Spell, Empowered Spell, Extended Spell, Heightened Spell, Quickened Spell, Subtle Spell, or Twinned Spell.',
      },
    ],
    4: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    5: [],
    6: [
      {
        name: 'Origin Feature',
        description:
          'You gain a feature from your Sorcerous Origin.',
      },
    ],
    7: [],
    8: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    9: [],
    10: [
      {
        name: 'Metamagic (3 options)',
        description:
          'You learn one additional Metamagic option, bringing your total to 3.',
      },
    ],
    11: [],
    12: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    13: [],
    14: [
      {
        name: 'Origin Feature',
        description:
          'You gain a feature from your Sorcerous Origin.',
      },
    ],
    15: [],
    16: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    17: [
      {
        name: 'Metamagic (4 options)',
        description:
          'You learn one additional Metamagic option, bringing your total to 4.',
      },
    ],
    18: [
      {
        name: 'Origin Feature',
        description:
          'You gain a feature from your Sorcerous Origin.',
      },
    ],
    19: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    20: [
      {
        name: 'Sorcerous Restoration',
        description:
          'You regain 4 expended sorcery points whenever you finish a short rest.',
      },
    ],
  },

  // =========================================================================
  Warlock: {
    1: [
      {
        name: 'Otherworldly Patron',
        description:
          'You have struck a bargain with an otherworldly being of your choice, such as the Archfey, the Fiend, or the Great Old One. Your choice grants you features at 1st, 6th, 10th, and 14th levels.',
      },
      {
        name: 'Pact Magic',
        description:
          'Your arcane research and the magic bestowed on you by your patron have given you facility with spells. You use Charisma as your spellcasting ability. Your spell slots are regained on a short or long rest and scale up in level as you progress.',
      },
    ],
    2: [
      {
        name: 'Eldritch Invocations (2)',
        description:
          'In your study of occult lore, you have unearthed eldritch invocations, fragments of forbidden knowledge that imbue you with an abiding magical ability. You gain 2 invocations and learn more as you level.',
      },
    ],
    3: [
      {
        name: 'Pact Boon',
        description:
          'Your otherworldly patron bestows a gift upon you for your loyal service. Choose one of: Pact of the Chain (familiar), Pact of the Blade (conjure a weapon), or Pact of the Tome (Book of Shadows with additional cantrips).',
      },
    ],
    4: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    5: [],
    6: [
      {
        name: 'Patron Feature',
        description:
          'You gain a feature from your Otherworldly Patron.',
      },
    ],
    7: [],
    8: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    9: [],
    10: [
      {
        name: 'Patron Feature',
        description:
          'You gain a feature from your Otherworldly Patron.',
      },
    ],
    11: [
      {
        name: 'Mystic Arcanum (6th)',
        description:
          'Your patron bestows upon you a magical secret called an arcanum. Choose one 6th-level spell from the warlock spell list as this arcanum. You can cast it once per long rest without expending a spell slot.',
      },
    ],
    12: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    13: [
      {
        name: 'Mystic Arcanum (7th)',
        description:
          'You gain a 7th-level spell as a mystic arcanum, castable once per long rest without a spell slot.',
      },
    ],
    14: [
      {
        name: 'Patron Feature',
        description:
          'You gain a feature from your Otherworldly Patron.',
      },
    ],
    15: [
      {
        name: 'Mystic Arcanum (8th)',
        description:
          'You gain an 8th-level spell as a mystic arcanum, castable once per long rest without a spell slot.',
      },
    ],
    16: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    17: [
      {
        name: 'Mystic Arcanum (9th)',
        description:
          'You gain a 9th-level spell as a mystic arcanum, castable once per long rest without a spell slot.',
      },
    ],
    18: [],
    19: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    20: [
      {
        name: 'Eldritch Master',
        description:
          'You can entreat your patron to regain expended spell slots. Spending 1 minute in earnest prayer or meditation, you regain all your expended Pact Magic spell slots. Once used, you must finish a long rest before using this feature again.',
      },
    ],
  },

  // =========================================================================
  Wizard: {
    1: [
      {
        name: 'Spellcasting',
        description:
          'As a student of arcane magic, you have a spellbook containing the spells you know. Intelligence is your spellcasting ability, and you can use an arcane focus as your spellcasting focus.',
      },
      {
        name: 'Arcane Recovery',
        description:
          'You have learned to regain some of your magical energy by studying your spellbook. Once per day when you finish a short rest, you can recover expended spell slots up to a combined level equal to half your wizard level (rounded up), and none of the slots can be 6th level or higher.',
      },
    ],
    2: [
      {
        name: 'Arcane Tradition',
        description:
          'You choose an arcane tradition, shaping your practice of magic through one of eight schools. Your choice grants you features at 2nd, 6th, 10th, and 14th levels.',
      },
    ],
    3: [],
    4: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    5: [],
    6: [
      {
        name: 'Arcane Tradition Feature',
        description:
          'You gain a feature from your Arcane Tradition.',
      },
    ],
    7: [],
    8: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    9: [],
    10: [
      {
        name: 'Arcane Tradition Feature',
        description:
          'You gain a feature from your Arcane Tradition.',
      },
    ],
    11: [],
    12: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    13: [],
    14: [
      {
        name: 'Arcane Tradition Feature',
        description:
          'You gain a feature from your Arcane Tradition.',
      },
    ],
    15: [],
    16: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    17: [],
    18: [
      {
        name: 'Spell Mastery',
        description:
          'You have achieved such mastery over certain spells that you can cast them at will. Choose a 1st-level and a 2nd-level wizard spell in your spellbook. You can cast those spells at their lowest level without expending a spell slot.',
      },
    ],
    19: [
      {
        name: 'Ability Score Improvement',
        description:
          'You can increase one ability score by 2, or two ability scores by 1 each. You can\'t exceed 20 with this feature.',
      },
    ],
    20: [
      {
        name: 'Signature Spell',
        description:
          'You gain mastery over two powerful spells and can cast them with little effort. Choose two 3rd-level wizard spells in your spellbook as your signature spells. You always have these spells prepared and can cast each once without expending a spell slot; you regain these uses on a short or long rest.',
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// HELPER FUNCTIONS
// ---------------------------------------------------------------------------

/**
 * Returns complete level data for all 20 levels of a given class.
 */
export function getLevelData(className: ClassName): LevelData[] {
  const asiLevels = getASILevels(className)
  const subclassLvl = SUBCLASS_LEVEL[className]
  const spellcasters: ClassName[] = [
    'Artificer', 'Bard', 'Cleric', 'Druid', 'Paladin',
    'Ranger', 'Sorcerer', 'Warlock', 'Wizard',
  ]
  const isSpellcaster = spellcasters.includes(className)

  const result: LevelData[] = []
  for (let level = 1; level <= 20; level++) {
    const features = CLASS_FEATURES[className][level] ?? []
    const levelData: LevelData = {
      level,
      features,
      isASI: asiLevels.includes(level),
      isSubclassLevel: level === subclassLvl,
    }
    if (isSpellcaster) {
      levelData.spellSlots = getSpellSlots(className, level)
    }
    result.push(levelData)
  }
  return result
}

/**
 * Returns the features gained at a specific level for a given class.
 */
export function getFeaturesAtLevel(className: ClassName, level: number): ClassFeature[] {
  return CLASS_FEATURES[className][level] ?? []
}
