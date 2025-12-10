-- ============================================
-- Add new category structure: Rohrsysteme (Pipe systems)
-- ============================================

-- Top category: Rohrsysteme
INSERT INTO categories (name, type, description)
VALUES ('Rohrsysteme', 'material', 'Pipe systems and accessories')
ON CONFLICT DO NOTHING;

-- Subcategory: Rohrverbund (Main pipes)
INSERT INTO categories (name, type, description)
VALUES ('Rohrverbund', 'material', 'Main pipe connections')
ON CONFLICT DO NOTHING;

-- Subcategory: Verbindungselemente (Connection elements)
INSERT INTO categories (name, type, description)
VALUES ('Verbindungselemente', 'material', 'Connection elements')
ON CONFLICT DO NOTHING;

-- Subcategory: Warnmaterialien (Warning materials)
INSERT INTO categories (name, type, description)
VALUES ('Warnmaterialien', 'material', 'Warning materials')
ON CONFLICT DO NOTHING;

-- Subcategory: Markierungsmaterial (Marking materials)
INSERT INTO categories (name, type, description)
VALUES ('Markierungsmaterial', 'material', 'Marking materials')
ON CONFLICT DO NOTHING;

-- ============================================
-- Add Projekt Bergkamen
-- ============================================
INSERT INTO baustellen (name, address, city, postal_code, contact_person, contact_phone, is_active)
VALUES ('Projekt Bergkamen', 'Bergkamen Straße 1', 'Bergkamen', '59192', 'Max Mustermann', '+49 231 12345678', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- Add materials: Rohrverbund (Each drum/spool as separate entry)
-- ============================================

-- Rohrverbund 12x10/6 - Orange (AfriPipes)
INSERT INTO items (
  category_id,
  baustelle_id,
  name,
  type,
  unit,
  description,
  stock_quantity,
  min_stock_level,
  supplier,
  trommel_nummer,
  total_length,
  lagerplatz,
  bemerkung,
  image_url,
  is_active
)
SELECT
  c.id,
  b.id,
  'Rohrverbund 12x10/6 - Orange',
  'material',
  'm',
  'Orange colored pipe compound 12x10/6',
  979,
  100,
  'AfriPipes',
  'T001',
  2000,
  'Hamm',
  '',
  NULL,
  true
FROM categories c, baustellen b
WHERE c.name = 'Rohrverbund' AND b.name = 'Projekt Bergkamen'
ON CONFLICT DO NOTHING;

-- Rohrverbund 7x16/12 - Orange (Ege-Com)
INSERT INTO items (
  category_id,
  baustelle_id,
  name,
  type,
  unit,
  description,
  stock_quantity,
  min_stock_level,
  supplier,
  trommel_nummer,
  total_length,
  lagerplatz,
  bemerkung,
  image_url,
  is_active
)
SELECT
  c.id,
  b.id,
  'Rohrverbund 7x16/12 - Orange',
  'material',
  'm',
  'Orange colored pipe compound 7x16/12',
  298,
  100,
  'Ege-Com',
  'T002',
  1000,
  'Hamm',
  '',
  NULL,
  true
FROM categories c, baustellen b
WHERE c.name = 'Rohrverbund' AND b.name = 'Projekt Bergkamen'
ON CONFLICT DO NOTHING;

-- Rohrverbund 12x10/6 - Rot (AEHAU)
INSERT INTO items (
  category_id,
  baustelle_id,
  name,
  type,
  unit,
  description,
  stock_quantity,
  min_stock_level,
  supplier,
  trommel_nummer,
  total_length,
  lagerplatz,
  bemerkung,
  image_url,
  is_active
)
SELECT
  c.id,
  b.id,
  'Rohrverbund 12x10/6 - Rot',
  'material',
  'm',
  'Red colored pipe compound 12x10/6',
  325,
  100,
  'AEHAU',
  'T003',
  950,
  'Hamm',
  '',
  NULL,
  true
FROM categories c, baustellen b
WHERE c.name = 'Rohrverbund' AND b.name = 'Projekt Bergkamen'
ON CONFLICT DO NOTHING;

-- ============================================
-- Add accessories: Verbinder (Connectors)
-- ============================================

-- Verbinder 10mm (Emtelle)
INSERT INTO items (
  category_id,
  baustelle_id,
  name,
  type,
  unit,
  description,
  stock_quantity,
  min_stock_level,
  supplier,
  trommel_nummer,
  total_length,
  lagerplatz,
  bemerkung,
  image_url,
  is_active
)
SELECT
  c.id,
  b.id,
  'Verbinder - 10mm',
  'material',
  'Stück',
  'Connector for 10mm pipes',
  500,
  100,
  'Emtelle',
  NULL,
  NULL,
  NULL,
  '',
  'Material_Fotos/Verbinder.jpg',
  true
FROM categories c, baustellen b
WHERE c.name = 'Verbindungselemente' AND b.name = 'Projekt Bergkamen'
ON CONFLICT DO NOTHING;

-- Verbinder 16mm (Emtelle)
INSERT INTO items (
  category_id,
  baustelle_id,
  name,
  type,
  unit,
  description,
  stock_quantity,
  min_stock_level,
  supplier,
  trommel_nummer,
  total_length,
  lagerplatz,
  bemerkung,
  image_url,
  is_active
)
SELECT
  c.id,
  b.id,
  'Verbinder - 16mm',
  'material',
  'Stück',
  'Connector for 16mm pipes',
  500,
  100,
  'Emtelle',
  NULL,
  NULL,
  NULL,
  '',
  'Material_Fotos/Verbinder.jpg',
  true
FROM categories c, baustellen b
WHERE c.name = 'Verbindungselemente' AND b.name = 'Projekt Bergkamen'
ON CONFLICT DO NOTHING;

-- ============================================
-- Add accessories: Endekappe (End caps)
-- ============================================

-- Endekappe 10mm (Emtelle)
INSERT INTO items (
  category_id,
  baustelle_id,
  name,
  type,
  unit,
  description,
  stock_quantity,
  min_stock_level,
  supplier,
  trommel_nummer,
  total_length,
  lagerplatz,
  bemerkung,
  image_url,
  is_active
)
SELECT
  c.id,
  b.id,
  'Endekappe - 10mm',
  'material',
  'Stück',
  '',
  500,
  100,
  'Emtelle',
  NULL,
  NULL,
  NULL,
  '',
  'Material_Fotos/EndKappe.jpg',
  true
FROM categories c, baustellen b
WHERE c.name = 'Verbindungselemente' AND b.name = 'Projekt Bergkamen'
ON CONFLICT DO NOTHING;

-- Endekappe 16mm (Emtelle)
INSERT INTO items (
  category_id,
  baustelle_id,
  name,
  type,
  unit,
  description,
  stock_quantity,
  min_stock_level,
  supplier,
  trommel_nummer,
  total_length,
  lagerplatz,
  bemerkung,
  image_url,
  is_active
)
SELECT
  c.id,
  b.id,
  'Endekappe - 16mm',
  'material',
  'Stück',
  '',
  500,
  100,
  'Emtelle',
  NULL,
  NULL,
  NULL,
  '',
  'Material_Fotos/EndKappe.jpg',
  true
FROM categories c, baustellen b
WHERE c.name = 'Verbindungselemente' AND b.name = 'Projekt Bergkamen'
ON CONFLICT DO NOTHING;

-- ============================================
-- Add accessories: Trassenwarnband (Trench warning tape)
-- ============================================
INSERT INTO items (
  category_id,
  baustelle_id,
  name,
  type,
  unit,
  description,
  stock_quantity,
  min_stock_level,
  supplier,
  trommel_nummer,
  total_length,
  lagerplatz,
  bemerkung,
  image_url,
  is_active
)
SELECT
  c.id,
  b.id,
  'Trassenwarnband',
  'material',
  'm',
  'Warning tape for trench marking',
  0,
  50,
  'Unbekannt',
  NULL,
  NULL,
  NULL,
  '',
  'Material_Fotos/Trassenwarnband.jpg',
  true
FROM categories c, baustellen b
WHERE c.name = 'Warnmaterialien' AND b.name = 'Projekt Bergkamen'
ON CONFLICT DO NOTHING;

-- ============================================
-- Add accessories: Fähnchen (Marking flags - multiple colors)
-- ============================================

-- Fähnchen Blau (Blue)
INSERT INTO items (
  category_id,
  baustelle_id,
  name,
  type,
  unit,
  description,
  stock_quantity,
  min_stock_level,
  supplier,
  trommel_nummer,
  total_length,
  lagerplatz,
  bemerkung,
  image_url,
  is_active
)
SELECT
  c.id,
  b.id,
  'Fähnchen Blau',
  'material',
  'Beutel',
  'Blue marking flags for pipelines',
  15,
  3,
  'Unbekannt',
  NULL,
  NULL,
  NULL,
  '',
  'Material_Fotos/Fähnchen.jpg',
  true
FROM categories c, baustellen b
WHERE c.name = 'Markierungsmaterial' AND b.name = 'Projekt Bergkamen'
ON CONFLICT DO NOTHING;

-- Fähnchen Rot (Red)
INSERT INTO items (
  category_id,
  baustelle_id,
  name,
  type,
  unit,
  description,
  stock_quantity,
  min_stock_level,
  supplier,
  trommel_nummer,
  total_length,
  lagerplatz,
  bemerkung,
  image_url,
  is_active
)
SELECT
  c.id,
  b.id,
  'Fähnchen Rot',
  'material',
  'Beutel',
  'Red marking flags for pipelines',
  8,
  3,
  'Unbekannt',
  NULL,
  NULL,
  NULL,
  '',
  'Material_Fotos/Fähnchen.jpg',
  true
FROM categories c, baustellen b
WHERE c.name = 'Markierungsmaterial' AND b.name = 'Projekt Bergkamen'
ON CONFLICT DO NOTHING;

-- Fähnchen Grün (Green)
INSERT INTO items (
  category_id,
  baustelle_id,
  name,
  type,
  unit,
  description,
  stock_quantity,
  min_stock_level,
  supplier,
  trommel_nummer,
  total_length,
  lagerplatz,
  bemerkung,
  image_url,
  is_active
)
SELECT
  c.id,
  b.id,
  'Fähnchen Grün',
  'material',
  'Beutel',
  'Green marking flags for pipelines',
  22,
  3,
  'Unbekannt',
  NULL,
  NULL,
  NULL,
  '',
  'Material_Fotos/Fähnchen.jpg',
  true
FROM categories c, baustellen b
WHERE c.name = 'Markierungsmaterial' AND b.name = 'Projekt Bergkamen'
ON CONFLICT DO NOTHING;

-- Fähnchen Gelb (Yellow)
INSERT INTO items (
  category_id,
  baustelle_id,
  name,
  type,
  unit,
  description,
  stock_quantity,
  min_stock_level,
  supplier,
  trommel_nummer,
  total_length,
  lagerplatz,
  bemerkung,
  image_url,
  is_active
)
SELECT
  c.id,
  b.id,
  'Fähnchen Gelb',
  'material',
  'Beutel',
  'Yellow marking flags for pipelines',
  12,
  3,
  'Unbekannt',
  NULL,
  NULL,
  NULL,
  '',
  'Material_Fotos/Fähnchen.jpg',
  true
FROM categories c, baustellen b
WHERE c.name = 'Markierungsmaterial' AND b.name = 'Projekt Bergkamen'
ON CONFLICT DO NOTHING;

-- Fähnchen Orange (Orange)
INSERT INTO items (
  category_id,
  baustelle_id,
  name,
  type,
  unit,
  description,
  stock_quantity,
  min_stock_level,
  supplier,
  trommel_nummer,
  total_length,
  lagerplatz,
  bemerkung,
  image_url,
  is_active
)
SELECT
  c.id,
  b.id,
  'Fähnchen Orange',
  'material',
  'Beutel',
  'Orange marking flags for pipelines',
  5,
  3,
  'Unbekannt',
  NULL,
  NULL,
  NULL,
  '',
  'Material_Fotos/Fähnchen.jpg',
  true
FROM categories c, baustellen b
WHERE c.name = 'Markierungsmaterial' AND b.name = 'Projekt Bergkamen'
ON CONFLICT DO NOTHING;

-- Fähnchen Lila (Purple)
INSERT INTO items (
  category_id,
  baustelle_id,
  name,
  type,
  unit,
  description,
  stock_quantity,
  min_stock_level,
  supplier,
  trommel_nummer,
  total_length,
  lagerplatz,
  bemerkung,
  image_url,
  is_active
)
SELECT
  c.id,
  b.id,
  'Fähnchen Lila',
  'material',
  'Beutel',
  'Purple marking flags for pipelines',
  18,
  3,
  'Unbekannt',
  NULL,
  NULL,
  NULL,
  '',
  'Material_Fotos/Fähnchen.jpg',
  true
FROM categories c, baustellen b
WHERE c.name = 'Markierungsmaterial' AND b.name = 'Projekt Bergkamen'
ON CONFLICT DO NOTHING;
