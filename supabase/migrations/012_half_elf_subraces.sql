-- Add Half-Elf subraces from SCAG (Sword Coast Adventurer's Guide) and ERLW (Eberron)
-- All share the base Half-Elf traits (Darkvision, Fey Ancestry, Skill Versatility, Languages)
-- plus the subrace-specific bonus listed below.
--
-- KØR IKKE — run manually in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rhwgnomfkchgzpmqiubb/sql/new
--
-- Each INSERT is guarded with WHERE NOT EXISTS so the migration is idempotent.

-- ── SCAG subraces ─────────────────────────────────────────────────────────────

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'High Half-Elf', 'SCAG', 'Medium', 30,
  '{"CHA":2,"INT":1}'::jsonb,
  ARRAY[
    'Darkvision 60ft',
    'Fey Ancestry: advantage vs charm, cannot be magically put to sleep',
    'Skill Versatility: proficiency in two skills of your choice',
    'Cantrip: know one wizard cantrip of your choice'
  ]::text[],
  ARRAY['Common', 'Elvish', 'One of your choice']::text[],
  'A half-elf descended from high elf lineage, gifted with natural arcane aptitude and an extra cantrip from the wizard spell list.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'High Half-Elf' AND source = 'SCAG');

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Wood Half-Elf', 'SCAG', 'Medium', 35,
  '{"CHA":2,"WIS":1}'::jsonb,
  ARRAY[
    'Darkvision 60ft',
    'Fey Ancestry: advantage vs charm, cannot be magically put to sleep',
    'Skill Versatility: proficiency in two skills of your choice',
    'Fleet of Foot: base walking speed is 35 ft',
    'Mask of the Wild: can hide when lightly obscured by natural phenomena'
  ]::text[],
  ARRAY['Common', 'Elvish']::text[],
  'A half-elf descended from wood elf lineage, swift and attuned to the natural world, able to vanish into forest and weather.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Wood Half-Elf' AND source = 'SCAG');

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Drow Half-Elf', 'SCAG', 'Medium', 30,
  '{"CHA":2,"DEX":1}'::jsonb,
  ARRAY[
    'Darkvision 60ft',
    'Fey Ancestry: advantage vs charm, cannot be magically put to sleep',
    'Skill Versatility: proficiency in two skills of your choice',
    'Drow Magic: Dancing Lights cantrip; Faerie Fire at 3rd level; Darkness at 5th level (CHA spellcasting)'
  ]::text[],
  ARRAY['Common', 'Elvish', 'Undercommon']::text[],
  'A half-elf descended from drow lineage, bearing innate dark elf magic and the shadow of the Underdark in their blood.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Drow Half-Elf' AND source = 'SCAG');

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Aquatic Half-Elf', 'SCAG', 'Medium', 30,
  '{"CHA":2,"STR":1}'::jsonb,
  ARRAY[
    'Darkvision 60ft',
    'Fey Ancestry: advantage vs charm, cannot be magically put to sleep',
    'Skill Versatility: proficiency in two skills of your choice',
    'Swim Speed 30ft',
    'Amphibious: can breathe air and water'
  ]::text[],
  ARRAY['Common', 'Elvish', 'Aquan']::text[],
  'A half-elf descended from sea elf lineage, equally at home beneath the waves as on land, gifted with amphibious traits.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Aquatic Half-Elf' AND source = 'SCAG');

-- ── ERLW (Eberron) subraces ───────────────────────────────────────────────────

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Mark of Detection Half-Elf', 'ERLW', 'Medium', 30,
  '{"CHA":2,"WIS":1}'::jsonb,
  ARRAY[
    'Darkvision 60ft',
    'Fey Ancestry: advantage vs charm, cannot be magically put to sleep',
    'Skill Versatility: proficiency in two skills of your choice',
    'Deductive Intuition: add 1d4 to Insight and Investigation checks',
    'Spells of the Mark: access to detection-themed spell list (Detect Magic, Detect Poison, See Invisibility, etc.)',
    'Magical Detection: cast Detect Magic and Detect Poison and Disease without expending a spell slot (WIS spellcasting)'
  ]::text[],
  ARRAY['Common', 'Elvish']::text[],
  'A half-elf bearing the Mark of Detection, with supernatural insight into lies, hidden truths, and invisible threats.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Mark of Detection Half-Elf' AND source = 'ERLW');

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Mark of Storm Half-Elf', 'ERLW', 'Medium', 30,
  '{"CHA":2,"DEX":1}'::jsonb,
  ARRAY[
    'Darkvision 60ft',
    'Fey Ancestry: advantage vs charm, cannot be magically put to sleep',
    'Skill Versatility: proficiency in two skills of your choice',
    'Windwright''s Intuition: add 1d4 to Acrobatics and vehicle (air and water) checks',
    'Storm''s Boon: resistance to lightning damage',
    'Spells of the Mark: access to storm-themed spell list (Fog Cloud, Gust of Wind, Sleet Storm, etc.)'
  ]::text[],
  ARRAY['Common', 'Elvish']::text[],
  'A half-elf bearing the Mark of Storm, with an innate affinity for wind, weather, and the lightning-touched skies of Khorvaire.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Mark of Storm Half-Elf' AND source = 'ERLW');

-- ── Verify ────────────────────────────────────────────────────────────────────

SELECT name, source, speed, ability_bonuses
FROM races
WHERE name LIKE '%Half-Elf%'
ORDER BY name;
