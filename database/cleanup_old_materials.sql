-- ============================================
-- Clean up old sample material data
-- ============================================
-- Note: Since these materials are referenced by requests, we set them to inactive instead of deleting

-- Method 1: Set old materials to inactive (Recommended - preserves historical data)
UPDATE items
SET is_active = false
WHERE name IN (
  'Winkelschleifer',
  'Zement',
  'Schrauben M8',
  'Sand',
  'Kabel NYM 3x1,5',
  'Bagger Radlader',
  'Bohrmaschine',
  'Endkappe 10mm',
  'Endkappe 16mm'
) OR description ~ '[\u4e00-\u9fff]';  -- Match any Chinese characters

-- View active materials list
SELECT
  id,
  name,
  description,
  stock_quantity,
  unit,
  is_active
FROM items
WHERE is_active = true
ORDER BY created_at DESC;

-- ============================================
-- Method 2: Complete deletion (Use with caution!)
-- ============================================
-- This will delete all related request records, confirm before use!

-- Uncomment the following code to completely delete:
/*
-- First delete request items that reference these materials
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
    'Bohrmaschine',
    'Endkappe 10mm',
    'Endkappe 16mm'
  ) OR description ~ '[\u4e00-\u9fff]'  -- Match any Chinese characters
);

-- Then delete the materials
DELETE FROM items
WHERE name IN (
  'Winkelschleifer',
  'Zement',
  'Schrauben M8',
  'Sand',
  'Kabel NYM 3x1,5',
  'Bagger Radlader',
  'Bohrmaschine',
  'Endkappe 10mm',
  'Endkappe 16mm'
) OR description ~ '[\u4e00-\u9fff]';  -- Match any Chinese characters
*/
