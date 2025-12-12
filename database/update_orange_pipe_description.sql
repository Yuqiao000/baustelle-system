-- Update Orange pipe compound description to include Trommel size information
UPDATE items
SET description = 'Orange colored pipe compound 12x10/6 (Each Trommel contains 2000m)'
WHERE name ILIKE '%Orange%pipe%compound%'
  OR (name ILIKE '%Orange%' AND category = 'Kabel und Rohre');

-- Verify the update
SELECT id, name, description, stock_quantity, unit, min_stock_level
FROM items
WHERE name ILIKE '%Orange%pipe%compound%'
   OR (name ILIKE '%Orange%' AND category = 'Kabel und Rohre');
