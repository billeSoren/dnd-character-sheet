-- Seed PHB (2014) subclasses that are missing from the subclasses table.
-- PHB24 counterparts already exist; these rows ensure 5e characters (no PHB24
-- in allowedSources) see the correct 2014 subclass list.
--
-- KØR IKKE — run manually in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rhwgnomfkchgzpmqiubb/sql/new
--
-- Each INSERT is guarded with WHERE NOT EXISTS so the migration is idempotent.

-- ── Barbarian ─────────────────────────────────────────────────────────────────

INSERT INTO public.subclasses (id, name, class, source, description)
SELECT gen_random_uuid(), 'Path of the Berserker', 'Barbarian', 'PHB',
  'A primal path of unbridled rage. At 3rd level you gain Frenzy — while raging you can go into a frenzy, making a single melee weapon attack as a bonus action on each of your turns. When the rage ends you suffer one level of exhaustion.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.subclasses WHERE name = 'Path of the Berserker' AND source = 'PHB'
);

INSERT INTO public.subclasses (id, name, class, source, description)
SELECT gen_random_uuid(), 'Path of the Totem Warrior', 'Barbarian', 'PHB',
  'A spiritual path connecting your rage to a totem animal spirit — Bear (resistance to all damage except psychic while raging), Eagle (enemies have disadvantage on opportunity attacks), or Wolf (allies have advantage on melee attacks against prone creatures). Spirit Seeker and Totem Spirit at 3rd level.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.subclasses WHERE name = 'Path of the Totem Warrior' AND source = 'PHB'
);

-- ── Bard ──────────────────────────────────────────────────────────────────────

INSERT INTO public.subclasses (id, name, class, source, description)
SELECT gen_random_uuid(), 'College of Lore', 'Bard', 'PHB',
  'Bards of the College of Lore know something about most things, collecting bits of knowledge from sources as diverse as scholarly tomes and peasant tales. At 3rd level: Bonus Proficiencies (three skills of your choice) and Cutting Words (use your reaction and a Bardic Inspiration die to subtract from a creature''s attack roll, ability check, or damage roll).'
WHERE NOT EXISTS (
  SELECT 1 FROM public.subclasses WHERE name = 'College of Lore' AND source = 'PHB'
);

-- ── Cleric ────────────────────────────────────────────────────────────────────

INSERT INTO public.subclasses (id, name, class, source, description)
SELECT gen_random_uuid(), 'Light Domain', 'Cleric', 'PHB',
  'Clerics who follow the Light Domain wield divine fire and radiance, illuminating the darkness and purging evil. Bonus cantrip: Light. Domain spells include faerie fire, flaming sphere, daylight, and flame strike. Warding Flare at 1st level lets you impose disadvantage on attacks against you by interposing divine light.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.subclasses WHERE name = 'Light Domain' AND source = 'PHB'
);

INSERT INTO public.subclasses (id, name, class, source, description)
SELECT gen_random_uuid(), 'Nature Domain', 'Cleric', 'PHB',
  'Clerics of the Nature Domain serve deities of agriculture, sea, sky, and the hunt, wielding plant and animal magic. Bonus proficiency in heavy armor and one druid cantrip at 1st level. Acolyte of Nature lets you learn a druid cantrip plus proficiency in Animal Handling, Nature, or Survival. Domain spells include animal friendship, speak with animals, barkskin, and plant growth.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.subclasses WHERE name = 'Nature Domain' AND source = 'PHB'
);

INSERT INTO public.subclasses (id, name, class, source, description)
SELECT gen_random_uuid(), 'Tempest Domain', 'Cleric', 'PHB',
  'Clerics of the Tempest Domain wield storms and the fury of the sea. Bonus proficiencies: martial weapons and heavy armor. Wrath of the Storm (1st level): when a creature within 5 ft that you can see hits you, you can use your reaction to cause it to make a Dexterity saving throw, taking 2d8 lightning or thunder damage on a failed save. Domain spells include thunderwave, shatter, call lightning, and storm of vengeance.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.subclasses WHERE name = 'Tempest Domain' AND source = 'PHB'
);

-- ── Druid ─────────────────────────────────────────────────────────────────────

INSERT INTO public.subclasses (id, name, class, source, description)
SELECT gen_random_uuid(), 'Circle of the Moon', 'Druid', 'PHB',
  'Druids of the Circle of the Moon are fierce guardians of the wilds whose wild shape is far more powerful than other druids. At 2nd level: Combat Wild Shape (use Wild Shape as a bonus action and spend spell slots to regain HP while in beast form) and Circle Forms (can transform into beasts with a CR up to 1 at 2nd level, increasing as you gain levels).'
WHERE NOT EXISTS (
  SELECT 1 FROM public.subclasses WHERE name = 'Circle of the Moon' AND source = 'PHB'
);

-- ── Fighter ───────────────────────────────────────────────────────────────────

INSERT INTO public.subclasses (id, name, class, source, description)
SELECT gen_random_uuid(), 'Battle Master', 'Fighter', 'PHB',
  'Fighters of the Battle Master archetype employ superior fighting techniques built from a study of maneuvers. At 3rd level: Combat Superiority (4 superiority dice, 3 maneuvers chosen from the full list), Student of War (proficiency with one type of artisan tools), and Know Your Enemy (study a creature for 1 minute to learn key combat statistics).'
WHERE NOT EXISTS (
  SELECT 1 FROM public.subclasses WHERE name = 'Battle Master' AND source = 'PHB'
);

-- ── Paladin ───────────────────────────────────────────────────────────────────

INSERT INTO public.subclasses (id, name, class, source, description)
SELECT gen_random_uuid(), 'Oath of Devotion', 'Paladin', 'PHB',
  'The Oath of Devotion binds a paladin to the highest ideals of justice, virtue, and order. Channel Divinity options at 3rd level: Sacred Weapon (imbue a weapon with positive energy, adding your Charisma modifier to attack rolls for 1 minute) and Turn the Unholy (undead and fiends within 30 ft must make a Wisdom saving throw or be turned).'
WHERE NOT EXISTS (
  SELECT 1 FROM public.subclasses WHERE name = 'Oath of Devotion' AND source = 'PHB'
);

-- ── Rogue ─────────────────────────────────────────────────────────────────────

INSERT INTO public.subclasses (id, name, class, source, description)
SELECT gen_random_uuid(), 'Arcane Trickster', 'Rogue', 'PHB',
  'Arcane Tricksters combine roguish skill with arcane magic, specializing in enchantment and illusion. Spellcasting at 3rd level (Intelligence-based, intelligence modifier added to spell attacks). Mage Hand Legerdemain makes your Mage Hand invisible and lets you stow/retrieve objects, pick locks, and pick pockets as part of the hand''s action.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.subclasses WHERE name = 'Arcane Trickster' AND source = 'PHB'
);

INSERT INTO public.subclasses (id, name, class, source, description)
SELECT gen_random_uuid(), 'Assassin', 'Rogue', 'PHB',
  'Rogues who hone their skills in the deadly arts of disguise, infiltration, and sudden lethal strikes. Bonus Proficiencies at 3rd level: disguise kit and poisoner''s kit. Assassinate: you have advantage on attack rolls against any creature that hasn''t taken a turn yet, and any hit against a surprised creature is a critical hit.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.subclasses WHERE name = 'Assassin' AND source = 'PHB'
);

INSERT INTO public.subclasses (id, name, class, source, description)
SELECT gen_random_uuid(), 'Thief', 'Rogue', 'PHB',
  'Rogues who follow the Thief archetype hone their skills as crafty opportunists. Fast Hands at 3rd level lets you use the bonus action from Cunning Action to make a Dexterity (Sleight of Hand) check, use a set of thieves'' tools, or take the Use an Object action. Second-Story Work gives you a climbing speed equal to your walking speed, and reduces falling distance for jump calculations.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.subclasses WHERE name = 'Thief' AND source = 'PHB'
);

-- ── Warlock ───────────────────────────────────────────────────────────────────

INSERT INTO public.subclasses (id, name, class, source, description)
SELECT gen_random_uuid(), 'The Archfey', 'Warlock', 'PHB',
  'Your patron is a lord or lady of the fey who dwells in the twilight of the Feywild — powerful fey of great beauty and terrible power. Fey Presence (1st level): force all creatures within 10 ft to succeed on a Wisdom saving throw or be charmed or frightened until the end of your next turn. Misty Escape (6th level): when you take damage, use your reaction to turn invisible and teleport up to 60 ft.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.subclasses WHERE name = 'The Archfey' AND source = 'PHB'
);

INSERT INTO public.subclasses (id, name, class, source, description)
SELECT gen_random_uuid(), 'The Fiend', 'Warlock', 'PHB',
  'Your patron is a powerful being of the Lower Planes — a demon lord, archdevil, or other entity of pure evil. Dark One''s Blessing (1st level): when you reduce a creature to 0 HP, you gain temporary HP equal to your Charisma modifier + Warlock level. Dark One''s Own Luck (6th level): add a d10 to one ability check or saving throw. Expanded spell list includes burning hands, command, blindness/deafness, and fireball.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.subclasses WHERE name = 'The Fiend' AND source = 'PHB'
);

INSERT INTO public.subclasses (id, name, class, source, description)
SELECT gen_random_uuid(), 'The Great Old One', 'Warlock', 'PHB',
  'Your patron is a mysterious entity whose nature is utterly foreign to the fabric of reality — an elder god that slumbers in the deep ocean, a Great Old One whose motives are incomprehensible. Awakened Mind (1st level): telepathically speak to any creature you can see within 30 ft in any language you know. Entropic Ward (6th level): impose disadvantage on an attack roll against you, and if it misses, gain advantage on your next attack against the attacker.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.subclasses WHERE name = 'The Great Old One' AND source = 'PHB'
);

-- ── Wizard ────────────────────────────────────────────────────────────────────

INSERT INTO public.subclasses (id, name, class, source, description)
SELECT gen_random_uuid(), 'School of Evocation', 'Wizard', 'PHB',
  'Wizards who focus on the School of Evocation learn to manipulate forces such as fire, lightning, and cold with precision — shaping spells to protect allies even within the area. Evocation Savant at 2nd level halves the cost of copying evocation spells. Sculpt Spells lets you create pockets of safety within your evocation spells, automatically succeeding on the saving throw for chosen creatures and taking no damage on a successful save.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.subclasses WHERE name = 'School of Evocation' AND source = 'PHB'
);

INSERT INTO public.subclasses (id, name, class, source, description)
SELECT gen_random_uuid(), 'School of Illusion', 'Wizard', 'PHB',
  'Wizards who follow the School of Illusion weave threads of magic that deceive the senses, bending reality to confuse even the sharpest minds. Illusion Savant at 2nd level halves the cost of copying illusion spells. Improved Minor Illusion (2nd level): when you choose this school, you learn the Minor Illusion cantrip and can create both a sound and an image with it simultaneously.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.subclasses WHERE name = 'School of Illusion' AND source = 'PHB'
);

-- ── Verify ────────────────────────────────────────────────────────────────────

SELECT class, source, COUNT(*) AS n
FROM public.subclasses
WHERE source IN ('PHB', 'PHB24')
GROUP BY class, source
ORDER BY class, source;
