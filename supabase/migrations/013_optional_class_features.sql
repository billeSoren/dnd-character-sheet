-- Optional Class Features from Tasha's Cauldron of Everything (TCE)
-- These are features a player can adopt in place of (or in addition to) standard class features.
--
-- KØR IKKE — run manually in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rhwgnomfkchgzpmqiubb/sql/new

-- ── Reference table ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.optional_class_features (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  class_name  text NOT NULL,
  level       integer NOT NULL,
  name        text NOT NULL,
  description text NOT NULL,
  replaces    text,          -- name of the standard feature this replaces (nullable = additive)
  source      text NOT NULL DEFAULT 'TCE',
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS optional_class_features_class_level_idx
  ON public.optional_class_features (class_name, level);

ALTER TABLE public.optional_class_features ENABLE ROW LEVEL SECURITY;

-- Everyone can read; only service role can write (migrations only)
DROP POLICY IF EXISTS "public_read" ON public.optional_class_features;
CREATE POLICY "public_read" ON public.optional_class_features
  FOR SELECT USING (true);

-- ── Seed data: 28 TCE optional features ──────────────────────────────────────

INSERT INTO public.optional_class_features
  (class_name, level, name, description, replaces, source)
VALUES

-- ── Artificer ─────────────────────────────────────────────────────────────────
('Artificer', 3,
  'The Right Tool for the Job',
  'In 1 hour, which can be during a short or long rest, you can magically produce your choice of thieves'' tools or artisan''s tools in your hands. This creation requires no components, and the tools vanish when you use this feature again.',
  NULL, 'TCE'),

-- ── Barbarian ─────────────────────────────────────────────────────────────────
('Barbarian', 3,
  'Primal Knowledge',
  'When you reach 3rd level and again at 10th level, you gain proficiency in one skill of your choice from the list of skills available to barbarians at 1st level: Animal Handling, Athletics, Intimidation, Nature, Perception, or Survival.',
  NULL, 'TCE'),

('Barbarian', 7,
  'Instinctive Pounce',
  'As part of the bonus action you take to enter your rage, you can move up to half your speed.',
  NULL, 'TCE'),

-- ── Bard ──────────────────────────────────────────────────────────────────────
('Bard', 2,
  'Magical Inspiration',
  'A creature that has a Bardic Inspiration die from you and casts a spell that restores hit points or deals damage can roll that die and add the number rolled to the healing or damage. The Bardic Inspiration die is then lost.',
  NULL, 'TCE'),

('Bard', 10,
  'Additional Magical Secrets',
  'You learn two spells of your choice from any class. A spell you choose must be of a level you can cast, as shown on the Bard table, or a cantrip. The chosen spells count as bard spells for you but don''t count against the number of bard spells you know.',
  'Song of Rest', 'TCE'),

-- ── Cleric ────────────────────────────────────────────────────────────────────
('Cleric', 2,
  'Harness Divine Power',
  'You can expend a use of your Channel Divinity to fuel your spells. As a bonus action, you touch your holy symbol, utter a prayer, and regain one expended spell slot of a level that is no higher than half your proficiency bonus (rounded up). You can use this feature a number of times equal to your proficiency bonus, and you regain all expended uses when you finish a long rest.',
  NULL, 'TCE'),

('Cleric', 4,
  'Cantrip Versatility',
  'Whenever you reach a level in this class that grants the Ability Score Improvement feature, you can replace one cantrip you learned from this class''s Spellcasting feature with another cantrip from the cleric spell list.',
  NULL, 'TCE'),

-- ── Druid ─────────────────────────────────────────────────────────────────────
('Druid', 2,
  'Wild Companion',
  'You can expend a use of your Wild Shape feature to cast the find familiar spell, without material components. When you cast the spell this way, the familiar is a fey instead of a beast, and the familiar vanishes after a number of hours equal to half your druid level.',
  NULL, 'TCE'),

('Druid', 4,
  'Cantrip Versatility',
  'Whenever you reach a level in this class that grants the Ability Score Improvement feature, you can replace one cantrip you learned from this class''s Spellcasting feature with another cantrip from the druid spell list.',
  NULL, 'TCE'),

-- ── Fighter ───────────────────────────────────────────────────────────────────
('Fighter', 3,
  'Maneuver Options',
  'If you know any Battle Master maneuvers, you gain access to additional options: Ambush, Bait and Switch, Brace, Commanding Presence, Grappling Strike, Quick Toss, and Tactical Assessment.',
  NULL, 'TCE'),

('Fighter', 4,
  'Martial Versatility',
  'Whenever you reach a level in this class that grants the Ability Score Improvement feature, you can replace a fighting style you know with another fighting style available to fighters. This replacement represents a shift in focus in your martial practice.',
  NULL, 'TCE'),

-- ── Monk ──────────────────────────────────────────────────────────────────────
('Monk', 2,
  'Ki-Fueled Attack',
  'If you spend 1 ki point or more as part of your action on your turn, you can make one attack with an unarmed strike or a monk weapon as a bonus action before the end of the turn.',
  NULL, 'TCE'),

('Monk', 4,
  'Quickened Healing',
  'As an action, you can spend 2 ki points and roll a Martial Arts die. You regain a number of hit points equal to the number rolled plus your proficiency bonus.',
  NULL, 'TCE'),

('Monk', 5,
  'Focused Aim',
  'When you miss with an attack roll, you can spend 1 to 3 ki points to increase your attack roll by 2 for each of these ki points you spend, potentially turning the miss into a hit.',
  NULL, 'TCE'),

-- ── Paladin ───────────────────────────────────────────────────────────────────
('Paladin', 3,
  'Harness Divine Power',
  'You can expend a use of your Channel Divinity to fuel your spells. As a bonus action, you touch your holy symbol, utter a prayer, and regain one expended spell slot of a level that is no higher than half your proficiency bonus (rounded up). You can use this feature once per long rest.',
  NULL, 'TCE'),

('Paladin', 4,
  'Martial Versatility',
  'Whenever you reach a level in this class that grants the Ability Score Improvement feature, you can replace a fighting style you know with another fighting style available to paladins.',
  NULL, 'TCE'),

-- ── Ranger ────────────────────────────────────────────────────────────────────
('Ranger', 1,
  'Deft Explorer',
  'You are an unsurpassed explorer and survivor. Choose one of the following benefits: Canny (expertise in one skill, extra language), Roving (+5 speed when not wearing heavy armor, climbing and swimming speed), or Tireless (temp HP equal to 1d8 + WIS modifier as action, reduce exhaustion by one level per short rest).',
  'Natural Explorer', 'TCE'),

('Ranger', 1,
  'Favored Foe',
  'When you hit a creature with an attack roll, you can call on your mystical bond with nature to mark the target as your favored enemy for 1 minute or until you lose concentration. The first time each turn that you hit the favored enemy, it takes an extra 1d4 damage of a type appropriate to your environment. You can use this feature a number of times equal to your proficiency bonus.',
  'Favored Enemy', 'TCE'),

('Ranger', 2,
  'Spellcasting Focus',
  'You can use a druidic focus as a spellcasting focus for your ranger spells. A druidic focus might be a sprig of mistletoe or holly, a wand or rod made of yew or another special wood, a staff drawn whole from a living tree, or an object incorporating feathers, fur, bones, and teeth from sacred animals.',
  NULL, 'TCE'),

('Ranger', 3,
  'Primal Awareness',
  'You can focus your awareness through the interconnections of nature: you expend one ranger spell slot to cast commune with nature (which isn''t a ranger spell but counts as one for you). When you do so, you don''t need material components. You can also cast the following spells once per long rest without expending a spell slot: speak with animals (3rd), beast sense (5th), speak with plants (9th), locate creature (13th), commune with nature (17th).',
  'Primeval Awareness', 'TCE'),

('Ranger', 4,
  'Martial Versatility',
  'Whenever you reach a level in this class that grants the Ability Score Improvement feature, you can replace a fighting style you know with another fighting style available to rangers.',
  NULL, 'TCE'),

-- ── Rogue ─────────────────────────────────────────────────────────────────────
('Rogue', 3,
  'Steady Aim',
  'As a bonus action, you give yourself advantage on your next attack roll on the current turn. You can use this bonus action only if you haven''t moved during this turn, and after you use the bonus action, your speed is 0 until the end of the current turn.',
  NULL, 'TCE'),

-- ── Sorcerer ──────────────────────────────────────────────────────────────────
('Sorcerer', 4,
  'Sorcerous Versatility',
  'Whenever you reach a level in this class that grants the Ability Score Improvement feature, you can do one of the following, representing a change in focus as you hone your arcane craft: replace one of the metamagic options you chose with a different metamagic option, or replace one cantrip you know with a different sorcerer cantrip.',
  NULL, 'TCE'),

('Sorcerer', 5,
  'Magical Guidance',
  'You can tap into your inner wellspring of magic to try to conjure success from failure. When you make an ability check that fails, you can spend 1 sorcery point to reroll the d20, and you must use the new roll, potentially turning a failure into a success.',
  NULL, 'TCE'),

-- ── Warlock ───────────────────────────────────────────────────────────────────
('Warlock', 4,
  'Eldritch Versatility',
  'Whenever you reach a level in this class that grants the Ability Score Improvement feature, you can do one of the following, representing a bargain made with your patron: replace one cantrip you know from this class''s Spellcasting feature with another warlock cantrip, or replace your pact boon with another one.',
  NULL, 'TCE'),

-- ── Wizard ────────────────────────────────────────────────────────────────────
('Wizard', 3,
  'Cantrip Formulas',
  'You have scribed a set of arcane formulas in your spellbook that you can use to formulate a cantrip in your mind. Whenever you finish a long rest and consult those formulas in your spellbook, you can replace one wizard cantrip you know with another wizard cantrip from the Player''s Handbook.',
  NULL, 'TCE')

ON CONFLICT DO NOTHING;

-- ── Verify ────────────────────────────────────────────────────────────────────

SELECT class_name, level, name, replaces, source
FROM public.optional_class_features
ORDER BY class_name, level, name;
