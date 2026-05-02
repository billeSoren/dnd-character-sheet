-- ── Findings ──────────────────────────────────────────────────────────────────
--
-- 1. All existing BR/PHB backgrounds already have correct 5e feature names
--    (fixed by migration 009). No feat names remain in source IN ('BR','PHB').
--
-- 2. Three core PHB 5e backgrounds are missing a PHB/BR row entirely:
--    Charlatan, Hermit, Noble.  Without these rows a 5e character (no PHB24
--    in allowedSources) sees the PHB24 version (feat) or nothing at all.
--
-- 3. Four PHB24 rows have the placeholder feature_name 'Ability Scores'
--    instead of the correct Origin Feat from the 2024 PHB:
--    Hermit → Healer, Merchant → Lucky, Noble → Skilled,
--    Sage → Magic Initiate (Wizard).
--
-- This migration addresses all three.

-- ── Part 1: Insert missing PHB rows for Charlatan, Hermit, Noble ────────────

INSERT INTO backgrounds (
  id, name, source, description,
  skill_proficiencies, tool_proficiencies, languages,
  feature_name, feature_description
)
VALUES
  (
    gen_random_uuid(),
    'Charlatan', 'PHB',
    'You have always had a way with people. You know what makes them tick, and you can tease out their desires after a few minutes of conversation.',
    ARRAY['Deception', 'Sleight of Hand'],
    ARRAY['Disguise kit', 'Forgery kit'],
    ARRAY[]::text[],
    'False Identity',
    'You have created a second identity that includes documentation, established acquaintances, and disguises that allow you to assume that persona. Additionally, you can forge documents including official papers and personal letters, as long as you have seen an example of the kind of document or the handwriting you are trying to copy.'
  ),
  (
    gen_random_uuid(),
    'Hermit', 'PHB',
    'You lived in seclusion — either in a sheltered community such as a monastery, or entirely alone — for a formative part of your life.',
    ARRAY['Medicine', 'Religion'],
    ARRAY['Herbalism kit'],
    ARRAY['One of your choice'],
    'Discovery',
    'The quiet seclusion of your extended hermitage gave you access to a unique and powerful discovery. Work with your DM to determine the nature of what you discovered — perhaps a great truth about the cosmos, the gods, powerful beings, or the forces of nature.'
  ),
  (
    gen_random_uuid(),
    'Noble', 'PHB',
    'You understand wealth, power, and privilege. You carry a noble title, and your family owns land, collects taxes, and wields significant political influence.',
    ARRAY['History', 'Persuasion'],
    ARRAY['One type of gaming set'],
    ARRAY['One of your choice'],
    'Position of Privilege',
    'Thanks to your noble birth, people are inclined to think the best of you. You are welcome in high society, and people assume you have the right to be wherever you are. The common folk make every effort to accommodate you and avoid your displeasure, and other people of high birth treat you as a member of the same social sphere.'
  )
ON CONFLICT DO NOTHING;

-- ── Part 2: Fix PHB24 'Ability Scores' placeholders → correct Origin Feats ──
-- Source: D&D 2024 Player's Handbook, each background's Origin Feat.

UPDATE backgrounds
SET feature_name = 'Healer'
WHERE name = 'Hermit' AND source = 'PHB24' AND feature_name = 'Ability Scores';

UPDATE backgrounds
SET feature_name = 'Lucky'
WHERE name = 'Merchant' AND source = 'PHB24' AND feature_name = 'Ability Scores';

UPDATE backgrounds
SET feature_name = 'Skilled'
WHERE name = 'Noble' AND source = 'PHB24' AND feature_name = 'Ability Scores';

UPDATE backgrounds
SET feature_name = 'Magic Initiate (Wizard)'
WHERE name = 'Sage' AND source = 'PHB24' AND feature_name = 'Ability Scores';

-- ── Verify ───────────────────────────────────────────────────────────────────

-- Should show all 13 core 5e backgrounds with proper feature names (no feats)
SELECT name, source, feature_name
FROM backgrounds
WHERE source IN ('BR', 'PHB')
ORDER BY name;

-- Should show no 'Ability Scores' placeholders in PHB24
SELECT name, source, feature_name
FROM backgrounds
WHERE source = 'PHB24'
ORDER BY name;
