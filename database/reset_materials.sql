-- ============================================
-- Reset Materials - Delete old and add new
-- ============================================
-- This script will completely reset all materials for Projekt Bergkamen

-- Step 1: Delete all request items that reference materials from Projekt Bergkamen
DELETE FROM request_items
WHERE item_id IN (
  SELECT id FROM items
  WHERE baustelle_id = (SELECT id FROM baustellen WHERE name = 'Projekt Bergkamen')
);

-- Step 2: Delete all old materials from Projekt Bergkamen
DELETE FROM items
WHERE baustelle_id = (SELECT id FROM baustellen WHERE name = 'Projekt Bergkamen');

-- Step 3: Also delete any old sample materials
DELETE FROM request_items
WHERE item_id IN (
  SELECT id FROM items
  WHERE name IN (
    'Winkelschleifer',
    'Zement',
    'Schrauben M8',
    'Sand',
    'Kabel NYM 3x1,5',
    'Bagger Radlader',
    'Bohrmaschine'
  ) OR description ~ '[\u4e00-\u9fff]'
);

DELETE FROM items
WHERE name IN (
  'Winkelschleifer',
  'Zement',
  'Schrauben M8',
  'Sand',
  'Kabel NYM 3x1,5',
  'Bagger Radlader',
  'Bohrmaschine'
) OR description ~ '[\u4e00-\u9fff]';

-- Step 4: Verify deletion
SELECT COUNT(*) as remaining_items FROM items WHERE is_active = true;

-- You can now run add_initial_data.sql to add the new materials
