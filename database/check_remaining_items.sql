-- ============================================
-- Check remaining items to see what's left
-- ============================================

SELECT
  id,
  name,
  description,
  stock_quantity,
  unit,
  supplier,
  baustelle_id,
  is_active,
  created_at
FROM items
WHERE is_active = true
ORDER BY created_at DESC;

-- Also check if there are any items linked to Projekt Bergkamen
SELECT
  i.id,
  i.name,
  i.description,
  b.name as baustelle_name
FROM items i
LEFT JOIN baustellen b ON i.baustelle_id = b.id
WHERE i.is_active = true;
