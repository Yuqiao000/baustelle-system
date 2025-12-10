-- ============================================
-- Add baustelle_id to items table
-- ============================================
-- This allows materials to be associated with specific projects (Baustellen)

-- Add baustelle_id column to items table
ALTER TABLE items
ADD COLUMN baustelle_id UUID REFERENCES baustellen(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX idx_items_baustelle ON items(baustelle_id);

-- Add comment to explain the column
COMMENT ON COLUMN items.baustelle_id IS 'The Baustelle (project) this material belongs to. NULL means it is in the central warehouse.';

-- ============================================
-- Update existing materials to belong to Projekt Bergkamen
-- ============================================

-- First, get the ID of Projekt Bergkamen
-- Then update all Rohrverbund and Fähnchen materials to belong to it
UPDATE items
SET baustelle_id = (SELECT id FROM baustellen WHERE name = 'Projekt Bergkamen')
WHERE name IN (
  'Rohrverbund 12x10/6 - Trommel 1',
  'Rohrverbund 7x16/12 - Trommel 1',
  'Verbinder für Rohrverbund',
  'Endekappe für Rohrverbund',
  'Trassenwarnband',
  'Fähnchen Blau',
  'Fähnchen Rot',
  'Fähnchen Grün',
  'Fähnchen Gelb',
  'Fähnchen Orange',
  'Fähnchen Lila'
);

-- Verify the update
SELECT
  i.name,
  i.stock_quantity,
  i.unit,
  b.name as baustelle_name
FROM items i
LEFT JOIN baustellen b ON i.baustelle_id = b.id
WHERE i.is_active = true
ORDER BY b.name, i.name;
