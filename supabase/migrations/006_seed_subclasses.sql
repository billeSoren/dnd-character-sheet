-- Seed all PHB / XGE / TCE / EGtW / SCAG / DMG / GGtR / FToD / BHC subclasses
-- Column: "class" (not class_name)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/rhwgnomfkchgzpmqiubb/sql/new

INSERT INTO public.subclasses (class, name, source) VALUES

-- ── Artificer ──────────────────────────────────────────────────────────────
('Artificer', 'Alchemist',    'TCE'),
('Artificer', 'Armorer',      'TCE'),
('Artificer', 'Artillerist',  'TCE'),
('Artificer', 'Battle Smith', 'TCE'),

-- ── Barbarian ──────────────────────────────────────────────────────────────
('Barbarian', 'Path of the Berserker',          'PHB'),
('Barbarian', 'Path of the Totem Warrior',      'PHB'),
('Barbarian', 'Path of the Ancestral Guardian', 'XGE'),
('Barbarian', 'Path of the Storm Herald',       'XGE'),
('Barbarian', 'Path of the Zealot',             'XGE'),
('Barbarian', 'Path of the Beast',              'TCE'),
('Barbarian', 'Path of Wild Magic',             'TCE'),
('Barbarian', 'Path of the Battlerager',        'SCAG'),

-- ── Bard ───────────────────────────────────────────────────────────────────
('Bard', 'College of Lore',      'PHB'),
('Bard', 'College of Valor',     'PHB'),
('Bard', 'College of Glamour',   'XGE'),
('Bard', 'College of Swords',    'XGE'),
('Bard', 'College of Whispers',  'XGE'),
('Bard', 'College of Creation',  'TCE'),
('Bard', 'College of Eloquence', 'TCE'),

-- ── Blood Hunter ───────────────────────────────────────────────────────────
('Blood Hunter', 'Order of the Ghostslayer',   'BHC'),
('Blood Hunter', 'Order of the Mutant',        'BHC'),
('Blood Hunter', 'Order of the Lycan',         'BHC'),
('Blood Hunter', 'Order of the Profane Soul',  'BHC'),

-- ── Cleric ─────────────────────────────────────────────────────────────────
('Cleric', 'Knowledge Domain', 'PHB'),
('Cleric', 'Life Domain',      'PHB'),
('Cleric', 'Light Domain',     'PHB'),
('Cleric', 'Nature Domain',    'PHB'),
('Cleric', 'Tempest Domain',   'PHB'),
('Cleric', 'Trickery Domain',  'PHB'),
('Cleric', 'War Domain',       'PHB'),
('Cleric', 'Arcana Domain',    'SCAG'),
('Cleric', 'Death Domain',     'DMG'),
('Cleric', 'Forge Domain',     'XGE'),
('Cleric', 'Grave Domain',     'XGE'),
('Cleric', 'Order Domain',     'TCE'),
('Cleric', 'Peace Domain',     'TCE'),
('Cleric', 'Twilight Domain',  'TCE'),

-- ── Druid ──────────────────────────────────────────────────────────────────
('Druid', 'Circle of the Land',     'PHB'),
('Druid', 'Circle of the Moon',     'PHB'),
('Druid', 'Circle of Dreams',       'XGE'),
('Druid', 'Circle of the Shepherd', 'XGE'),
('Druid', 'Circle of Spores',       'GGtR'),
('Druid', 'Circle of Stars',        'TCE'),
('Druid', 'Circle of Wildfire',     'TCE'),

-- ── Fighter ────────────────────────────────────────────────────────────────
('Fighter', 'Champion',       'PHB'),
('Fighter', 'Battle Master',  'PHB'),
('Fighter', 'Eldritch Knight','PHB'),
('Fighter', 'Arcane Archer',  'XGE'),
('Fighter', 'Cavalier',       'XGE'),
('Fighter', 'Samurai',        'XGE'),
('Fighter', 'Psi Warrior',    'TCE'),
('Fighter', 'Rune Knight',    'TCE'),
('Fighter', 'Echo Knight',    'EGtW'),

-- ── Monk ───────────────────────────────────────────────────────────────────
('Monk', 'Way of the Open Hand',      'PHB'),
('Monk', 'Way of Shadow',             'PHB'),
('Monk', 'Way of the Four Elements',  'PHB'),
('Monk', 'Way of the Long Death',     'SCAG'),
('Monk', 'Way of the Sun Soul',       'XGE'),
('Monk', 'Way of the Drunken Master', 'XGE'),
('Monk', 'Way of the Kensei',         'XGE'),
('Monk', 'Way of Mercy',              'TCE'),
('Monk', 'Way of the Astral Self',    'TCE'),

-- ── Paladin ────────────────────────────────────────────────────────────────
('Paladin', 'Oath of Devotion',     'PHB'),
('Paladin', 'Oath of the Ancients', 'PHB'),
('Paladin', 'Oath of Vengeance',    'PHB'),
('Paladin', 'Oathbreaker',          'DMG'),
('Paladin', 'Oath of Conquest',     'XGE'),
('Paladin', 'Oath of Redemption',   'XGE'),
('Paladin', 'Oath of Glory',        'TCE'),
('Paladin', 'Oath of the Watchers', 'TCE'),

-- ── Ranger ─────────────────────────────────────────────────────────────────
('Ranger', 'Hunter',          'PHB'),
('Ranger', 'Beast Master',    'PHB'),
('Ranger', 'Gloom Stalker',   'XGE'),
('Ranger', 'Horizon Walker',  'XGE'),
('Ranger', 'Monster Slayer',  'XGE'),
('Ranger', 'Fey Wanderer',    'TCE'),
('Ranger', 'Swarmkeeper',     'TCE'),
('Ranger', 'Drakewarden',     'FToD'),

-- ── Rogue ──────────────────────────────────────────────────────────────────
('Rogue', 'Thief',            'PHB'),
('Rogue', 'Assassin',         'PHB'),
('Rogue', 'Arcane Trickster', 'PHB'),
('Rogue', 'Inquisitive',      'XGE'),
('Rogue', 'Mastermind',       'XGE'),
('Rogue', 'Scout',            'XGE'),
('Rogue', 'Swashbuckler',     'XGE'),
('Rogue', 'Phantom',          'TCE'),
('Rogue', 'Soulknife',        'TCE'),

-- ── Sorcerer ───────────────────────────────────────────────────────────────
('Sorcerer', 'Draconic Bloodline', 'PHB'),
('Sorcerer', 'Wild Magic',         'PHB'),
('Sorcerer', 'Divine Soul',        'XGE'),
('Sorcerer', 'Shadow Magic',       'XGE'),
('Sorcerer', 'Storm Sorcery',      'XGE'),
('Sorcerer', 'Aberrant Mind',      'TCE'),
('Sorcerer', 'Clockwork Soul',     'TCE'),

-- ── Warlock ────────────────────────────────────────────────────────────────
('Warlock', 'The Archfey',      'PHB'),
('Warlock', 'The Fiend',        'PHB'),
('Warlock', 'The Great Old One','PHB'),
('Warlock', 'The Celestial',    'XGE'),
('Warlock', 'The Hexblade',     'XGE'),
('Warlock', 'The Fathomless',   'TCE'),
('Warlock', 'The Genie',        'TCE'),

-- ── Wizard ─────────────────────────────────────────────────────────────────
('Wizard', 'School of Abjuration',    'PHB'),
('Wizard', 'School of Conjuration',   'PHB'),
('Wizard', 'School of Divination',    'PHB'),
('Wizard', 'School of Enchantment',   'PHB'),
('Wizard', 'School of Evocation',     'PHB'),
('Wizard', 'School of Illusion',      'PHB'),
('Wizard', 'School of Necromancy',    'PHB'),
('Wizard', 'School of Transmutation', 'PHB'),
('Wizard', 'Bladesinger',             'TCE'),
('Wizard', 'War Magic',               'XGE'),
('Wizard', 'Chronurgy Magic',         'EGtW'),
('Wizard', 'Graviturgy Magic',        'EGtW'),
('Wizard', 'Order of Scribes',        'TCE')

ON CONFLICT (id) DO NOTHING;

-- Verify counts per class
-- SELECT class, COUNT(*) FROM subclasses GROUP BY class ORDER BY class;
