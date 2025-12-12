-- Add Allgemein (General) category and materials
-- Create Allgemein category
INSERT INTO categories (name, type, description, is_active)
VALUES ('Allgemein', 'material', 'General safety and work equipment', true)
ON CONFLICT (name) DO UPDATE SET is_active = true
RETURNING id;

-- Get the category ID (for reference, actual insertion will use subquery)
-- We'll use a WITH clause to get the category_id

WITH allgemein_category AS (
  SELECT id FROM categories WHERE name = 'Allgemein' LIMIT 1
)

-- Insert Warnweste (Safety Vest)
INSERT INTO items (category_id, name, type, unit, description, stock_quantity, min_stock_level, image_url, is_active)
SELECT
  ac.id,
  'Warnweste',
  'material',
  'Stück',
  'High-visibility safety vest',
  50,
  10,
  'Material_Fotos/Warnweste.jpg',
  true
FROM allgemein_category ac;

-- Insert Zollstock (Folding Rule / Measuring Stick)
WITH allgemein_category AS (
  SELECT id FROM categories WHERE name = 'Allgemein' LIMIT 1
)
INSERT INTO items (category_id, name, type, unit, description, stock_quantity, min_stock_level, image_url, is_active)
SELECT
  ac.id,
  'Zollstock',
  'material',
  'Stück',
  'Folding ruler / measuring stick 2m',
  30,
  5,
  'Material_Fotos/Zollstock.jpg',
  true
FROM allgemein_category ac;

-- Insert Warnschutzjacke variants (High-visibility Jacket with sizes)
WITH allgemein_category AS (
  SELECT id FROM categories WHERE name = 'Allgemein' LIMIT 1
)
INSERT INTO items (category_id, name, type, unit, description, stock_quantity, min_stock_level, image_url, is_active)
SELECT
  ac.id,
  name,
  'material',
  'Stück',
  description,
  stock_quantity,
  min_stock_level,
  'Material_Fotos/Warnschutzjacke.jpg',
  true
FROM allgemein_category ac,
(VALUES
  ('Warnschutzjacke - S', 'High-visibility jacket Size S', 8, 2),
  ('Warnschutzjacke - M', 'High-visibility jacket Size M', 15, 3),
  ('Warnschutzjacke - L', 'High-visibility jacket Size L', 20, 5),
  ('Warnschutzjacke - XL', 'High-visibility jacket Size XL', 15, 3),
  ('Warnschutzjacke - XXL', 'High-visibility jacket Size XXL', 10, 2)
) AS sizes(name, description, stock_quantity, min_stock_level);

-- Insert Sicherheitsschuhe variants (Safety Shoes with sizes)
WITH allgemein_category AS (
  SELECT id FROM categories WHERE name = 'Allgemein' LIMIT 1
)
INSERT INTO items (category_id, name, type, unit, description, stock_quantity, min_stock_level, image_url, is_active)
SELECT
  ac.id,
  name,
  'material',
  'Paar',
  description,
  stock_quantity,
  min_stock_level,
  'Material_Fotos/Sicherheitsschuhe.jpg',
  true
FROM allgemein_category ac,
(VALUES
  ('Sicherheitsschuhe - 39', 'Safety shoes S3 Size 39', 5, 1),
  ('Sicherheitsschuhe - 40', 'Safety shoes S3 Size 40', 8, 2),
  ('Sicherheitsschuhe - 41', 'Safety shoes S3 Size 41', 10, 2),
  ('Sicherheitsschuhe - 42', 'Safety shoes S3 Size 42', 12, 3),
  ('Sicherheitsschuhe - 43', 'Safety shoes S3 Size 43', 12, 3),
  ('Sicherheitsschuhe - 44', 'Safety shoes S3 Size 44', 10, 2),
  ('Sicherheitsschuhe - 45', 'Safety shoes S3 Size 45', 8, 2),
  ('Sicherheitsschuhe - 46', 'Safety shoes S3 Size 46', 5, 1),
  ('Sicherheitsschuhe - 47', 'Safety shoes S3 Size 47', 3, 1)
) AS sizes(name, description, stock_quantity, min_stock_level);

-- Verify the insertions
SELECT c.name as category, i.name, i.unit, i.stock_quantity, i.min_stock_level, i.image_url
FROM items i
JOIN categories c ON i.category_id = c.id
WHERE c.name = 'Allgemein'
ORDER BY i.name;
