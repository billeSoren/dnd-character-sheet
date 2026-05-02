-- Add missing PHB sub-races for Dwarf, Elf, Halfling, Gnome, and Dragonborn
-- (all 10 ancestry colours).
--
-- Each INSERT is guarded with WHERE NOT EXISTS so the migration is idempotent.

-- ── Dwarf ─────────────────────────────────────────────────────────────────────

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Hill Dwarf', 'PHB', 'Medium', 25,
  '{"WIS":1,"CON":2}'::jsonb,
  ARRAY['Dwarven Toughness: HP maximum increases by 1 per level']::text[],
  ARRAY['Common', 'Dwarvish']::text[],
  'The most common dwarf in the surface world, Hill Dwarves are tough and wise, known for their endurance and piety.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Hill Dwarf' AND source = 'PHB');

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Mountain Dwarf', 'PHB', 'Medium', 25,
  '{"STR":2,"CON":2}'::jsonb,
  ARRAY['Dwarven Armor Training: proficiency with light and medium armor']::text[],
  ARRAY['Common', 'Dwarvish']::text[],
  'Mountain Dwarves are strong and hardy, bred for a life of toil in underground fortresses and mountain strongholds.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Mountain Dwarf' AND source = 'PHB');

-- ── Elf ───────────────────────────────────────────────────────────────────────

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'High Elf', 'PHB', 'Medium', 30,
  '{"INT":1,"DEX":2}'::jsonb,
  ARRAY['Cantrip: know one wizard cantrip', 'Extra Language']::text[],
  ARRAY['Common', 'Elvish', 'One of your choice']::text[],
  'High Elves are studious and intelligent, with an innate gift for arcane magic and a keen eye for detail.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'High Elf' AND source = 'PHB');

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Wood Elf', 'PHB', 'Medium', 35,
  '{"WIS":1,"DEX":2}'::jsonb,
  ARRAY['Fleet of Foot: speed 35ft', 'Mask of the Wild: hide in natural phenomena']::text[],
  ARRAY['Common', 'Elvish']::text[],
  'Wood Elves are fleet and stealthy, in tune with nature and the beasts of the wild.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Wood Elf' AND source = 'PHB');

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Dark Elf (Drow)', 'PHB', 'Medium', 30,
  '{"CHA":1,"DEX":2}'::jsonb,
  ARRAY['Superior Darkvision 120ft', 'Sunlight Sensitivity', 'Drow Magic', 'Drow Weapon Training']::text[],
  ARRAY['Common', 'Elvish', 'Undercommon']::text[],
  'Drow are dark-skinned elves who dwell in the Underdark, wielding innate magic and feared by surface-dwellers.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Dark Elf (Drow)' AND source = 'PHB');

-- ── Halfling ──────────────────────────────────────────────────────────────────

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Lightfoot Halfling', 'PHB', 'Small', 25,
  '{"CHA":1,"DEX":2}'::jsonb,
  ARRAY['Naturally Stealthy: can hide behind creatures one size larger']::text[],
  ARRAY['Common', 'Halfling']::text[],
  'Lightfoot Halflings are easy-going wanderers and the most common halflings in the world, known for their stealth and charm.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Lightfoot Halfling' AND source = 'PHB');

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Stout Halfling', 'PHB', 'Small', 25,
  '{"CON":1,"DEX":2}'::jsonb,
  ARRAY['Stout Resilience: advantage vs poison, resistance to poison damage']::text[],
  ARRAY['Common', 'Halfling']::text[],
  'Stout Halflings are hardier than their Lightfoot kin, with a resistance to poison that hints at dwarven ancestry.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Stout Halfling' AND source = 'PHB');

-- ── Gnome ─────────────────────────────────────────────────────────────────────

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Forest Gnome', 'PHB', 'Small', 25,
  '{"DEX":1,"INT":2}'::jsonb,
  ARRAY['Natural Illusionist: Minor Illusion cantrip', 'Speak with Small Beasts']::text[],
  ARRAY['Common', 'Gnomish']::text[],
  'Forest Gnomes are naturally illusionists with a gift for speaking with animals, living hidden lives in the wild.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Forest Gnome' AND source = 'PHB');

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Rock Gnome', 'PHB', 'Small', 25,
  '{"CON":1,"INT":2}'::jsonb,
  ARRAY['Artificer''s Lore: add twice proficiency to History checks on magic/alchemy/tech', 'Tinker: construct tiny clockwork devices']::text[],
  ARRAY['Common', 'Gnomish']::text[],
  'Rock Gnomes are natural inventors and tinkerers, obsessed with gadgets and mechanisms of all kinds.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Rock Gnome' AND source = 'PHB');

-- ── Dragonborn (one entry per ancestry colour) ────────────────────────────────
-- All share STR +2, CHA +1 per PHB 2014. Breath weapon element and damage
-- resistance vary by ancestry.

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Black Dragonborn', 'PHB', 'Medium', 30,
  '{"STR":2,"CHA":1}'::jsonb,
  ARRAY['Acid Breath Weapon (5×30ft line)', 'Acid Resistance']::text[],
  ARRAY['Common', 'Draconic']::text[],
  'Descended from black dragons, these dragonborn wield a corrosive acid breath weapon and resist acid damage.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Black Dragonborn' AND source = 'PHB');

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Blue Dragonborn', 'PHB', 'Medium', 30,
  '{"STR":2,"CHA":1}'::jsonb,
  ARRAY['Lightning Breath Weapon (5×30ft line)', 'Lightning Resistance']::text[],
  ARRAY['Common', 'Draconic']::text[],
  'Descended from blue dragons, these dragonborn unleash crackling lightning and resist electrical damage.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Blue Dragonborn' AND source = 'PHB');

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Brass Dragonborn', 'PHB', 'Medium', 30,
  '{"STR":2,"CHA":1}'::jsonb,
  ARRAY['Fire Breath Weapon (5×30ft line)', 'Fire Resistance']::text[],
  ARRAY['Common', 'Draconic']::text[],
  'Descended from brass dragons, these dragonborn breathe fire and resist fire damage.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Brass Dragonborn' AND source = 'PHB');

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Bronze Dragonborn', 'PHB', 'Medium', 30,
  '{"STR":2,"CHA":1}'::jsonb,
  ARRAY['Lightning Breath Weapon (5×30ft line)', 'Lightning Resistance']::text[],
  ARRAY['Common', 'Draconic']::text[],
  'Descended from bronze dragons, these dragonborn crackle with lightning and resist electrical damage.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Bronze Dragonborn' AND source = 'PHB');

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Copper Dragonborn', 'PHB', 'Medium', 30,
  '{"STR":2,"CHA":1}'::jsonb,
  ARRAY['Acid Breath Weapon (5×30ft line)', 'Acid Resistance']::text[],
  ARRAY['Common', 'Draconic']::text[],
  'Descended from copper dragons, these dragonborn spit corrosive acid and resist acid damage.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Copper Dragonborn' AND source = 'PHB');

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Gold Dragonborn', 'PHB', 'Medium', 30,
  '{"STR":2,"CHA":1}'::jsonb,
  ARRAY['Fire Breath Weapon (15ft cone)', 'Fire Resistance']::text[],
  ARRAY['Common', 'Draconic']::text[],
  'Descended from gold dragons, the noblest of metallic dragons, these dragonborn breathe fire from a wide cone.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Gold Dragonborn' AND source = 'PHB');

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Green Dragonborn', 'PHB', 'Medium', 30,
  '{"STR":2,"CHA":1}'::jsonb,
  ARRAY['Poison Breath Weapon (15ft cone)', 'Poison Resistance']::text[],
  ARRAY['Common', 'Draconic']::text[],
  'Descended from green dragons, these dragonborn breathe a cone of toxic gas and resist poison damage.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Green Dragonborn' AND source = 'PHB');

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Red Dragonborn', 'PHB', 'Medium', 30,
  '{"STR":2,"CHA":1}'::jsonb,
  ARRAY['Fire Breath Weapon (15ft cone)', 'Fire Resistance']::text[],
  ARRAY['Common', 'Draconic']::text[],
  'Descended from red dragons, the most fearsome of chromatic dragons, these dragonborn breathe devastating fire.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Red Dragonborn' AND source = 'PHB');

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'Silver Dragonborn', 'PHB', 'Medium', 30,
  '{"STR":2,"CHA":1}'::jsonb,
  ARRAY['Cold Breath Weapon (15ft cone)', 'Cold Resistance']::text[],
  ARRAY['Common', 'Draconic']::text[],
  'Descended from silver dragons, these dragonborn breathe a freezing cone of cold and resist cold damage.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'Silver Dragonborn' AND source = 'PHB');

INSERT INTO races (id, name, source, size, speed, ability_bonuses, traits, languages, description)
SELECT gen_random_uuid(), 'White Dragonborn', 'PHB', 'Medium', 30,
  '{"STR":2,"CHA":1}'::jsonb,
  ARRAY['Cold Breath Weapon (15ft cone)', 'Cold Resistance']::text[],
  ARRAY['Common', 'Draconic']::text[],
  'Descended from white dragons, the most feral of chromatic dragons, these dragonborn breathe icy cold.'
WHERE NOT EXISTS (SELECT 1 FROM races WHERE name = 'White Dragonborn' AND source = 'PHB');

-- ── Verify ────────────────────────────────────────────────────────────────────

SELECT name, source, size, speed, ability_bonuses
FROM races
WHERE source = 'PHB'
  AND name IN (
    'Hill Dwarf', 'Mountain Dwarf',
    'High Elf', 'Wood Elf', 'Dark Elf (Drow)',
    'Lightfoot Halfling', 'Stout Halfling',
    'Forest Gnome', 'Rock Gnome',
    'Black Dragonborn', 'Blue Dragonborn', 'Brass Dragonborn',
    'Bronze Dragonborn', 'Copper Dragonborn', 'Gold Dragonborn',
    'Green Dragonborn', 'Red Dragonborn', 'Silver Dragonborn',
    'White Dragonborn'
  )
ORDER BY name;
