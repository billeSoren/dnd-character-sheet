-- Restore correct 5e (2014) feature_name / feature_description for BR and PHB backgrounds.
-- These rows were incorrectly showing PHB24 feat data instead of classic 5e features.

UPDATE backgrounds SET
  feature_name = 'Military Rank',
  feature_description = 'You have a military rank from your career as a soldier. Soldiers loyal to your former military organization still recognize your authority and influence, and they will defer to you if they are of a lower rank.'
WHERE name = 'Soldier' AND source IN ('BR', 'PHB');

UPDATE backgrounds SET
  feature_name = 'Shelter of the Faithful',
  feature_description = 'As an acolyte, you command the respect of those who share your faith. You and your companions can expect free healing at temples of your faith, though you must provide material components.'
WHERE name = 'Acolyte' AND source IN ('BR', 'PHB');

UPDATE backgrounds SET
  feature_name = 'Criminal Contact',
  feature_description = 'You have a reliable contact who acts as your liaison to a network of criminals. You can send and receive messages through this contact.'
WHERE name = 'Criminal' AND source IN ('BR', 'PHB');

UPDATE backgrounds SET
  feature_name = 'By Popular Demand',
  feature_description = 'You can always find a place to perform. Your performances generate income and you receive free lodging and food of modest quality.'
WHERE name = 'Entertainer' AND source IN ('BR', 'PHB');

UPDATE backgrounds SET
  feature_name = 'Rustic Hospitality',
  feature_description = 'Since you come from the ranks of the common folk, you fit in easily among them. You can find a place to hide, rest, or recuperate among commoners.'
WHERE name = 'Folk Hero' AND source IN ('BR', 'PHB');

UPDATE backgrounds SET
  feature_name = 'Guild Membership',
  feature_description = 'As an established member of a guild, you can rely on other guild members for lodging, food, and assistance in your trade.'
WHERE name = 'Guild Artisan' AND source IN ('BR', 'PHB');

UPDATE backgrounds SET
  feature_name = 'Wanderer',
  feature_description = 'You have an excellent memory for maps and geography, and you can always recall the layout of terrain, settlements, and other features. You can find food and water for yourself and up to 5 other people each day.'
WHERE name = 'Outlander' AND source IN ('BR', 'PHB');

UPDATE backgrounds SET
  feature_name = 'Researcher',
  feature_description = 'When you attempt to learn or recall a piece of lore, if you do not know that information, you often know where and from whom you can obtain it.'
WHERE name = 'Sage' AND source IN ('BR', 'PHB');

UPDATE backgrounds SET
  feature_name = 'Ship''s Passage',
  feature_description = 'When you need to, you can secure free passage on a sailing ship for yourself and your companions. You might sail on the ship you served on, or another. In return, you are expected to assist the crew.'
WHERE name = 'Sailor' AND source IN ('BR', 'PHB');

UPDATE backgrounds SET
  feature_name = 'City Secrets',
  feature_description = 'You know the secret patterns and flow to cities and can find passages through the urban sprawl that others would miss. When not in combat, you and your companions can travel twice as fast through cities.'
WHERE name = 'Urchin' AND source IN ('BR', 'PHB');

UPDATE backgrounds SET
  feature_name = 'Noble Privilege',
  feature_description = 'Thanks to your noble birth, people are inclined to think the best of you. You are welcome in high society, and people assume you have the right to be wherever you are.'
WHERE name = 'Noble' AND source IN ('BR', 'PHB');

UPDATE backgrounds SET
  feature_name = 'Hermit Discovery',
  feature_description = 'The quiet seclusion of your extended hermitage gave you access to a unique and powerful discovery. Work with your DM to determine what you discovered.'
WHERE name = 'Hermit' AND source IN ('BR', 'PHB');

-- Verify
SELECT name, source, feature_name
FROM backgrounds
WHERE source IN ('BR', 'PHB')
ORDER BY name;
