-- ============================================
-- Check for duplicate materials
-- ============================================

-- Find materials with the same name
SELECT
  name,
  COUNT(*) as count,
  STRING_AGG(id::text, ', ') as ids,
  STRING_AGG(stock_quantity::text, ', ') as quantities
FROM items
WHERE is_active = true
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY name;

-- Show all active materials
SELECT
  id,
  name,
  stock_quantity,
  unit,
  supplier,
  created_at
FROM items
WHERE is_active = true
ORDER BY name, created_at;
