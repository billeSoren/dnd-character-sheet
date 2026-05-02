-- Remove rows with invalid class values that shouldn't exist in the subclasses table.

-- "varies" is not a real D&D class
DELETE FROM subclasses WHERE class = 'varies';

-- "Acquisitions Incorporated Franchise Role" is not a real class
DELETE FROM subclasses WHERE class = 'Acquisitions Incorporated Franchise Role';

-- Verify final counts per class
SELECT class, COUNT(*) AS count
FROM subclasses
GROUP BY class
ORDER BY class;
