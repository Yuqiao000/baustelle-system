-- ============================================
-- Add new fields to items table for enhanced material tracking
-- ============================================
-- This adds supplier, drum number, total length, storage location, and remarks fields

-- Add supplier/brand field
ALTER TABLE items
ADD COLUMN supplier TEXT;

-- Add drum/spool number for Rohrverbund materials
ALTER TABLE items
ADD COLUMN trommel_nummer TEXT;

-- Add total length field (separate from stock_quantity which is remaining length)
ALTER TABLE items
ADD COLUMN total_length DECIMAL(10, 2);

-- Add storage location field
ALTER TABLE items
ADD COLUMN lagerplatz TEXT;

-- Add remarks/notes field
ALTER TABLE items
ADD COLUMN bemerkung TEXT;

-- Create indexes for frequently queried fields
CREATE INDEX idx_items_supplier ON items(supplier);
CREATE INDEX idx_items_lagerplatz ON items(lagerplatz);

-- Add comments to explain the columns
COMMENT ON COLUMN items.supplier IS 'Supplier or brand name (Lieferant/Marke)';
COMMENT ON COLUMN items.trommel_nummer IS 'Drum or spool number for materials like Rohrverbund';
COMMENT ON COLUMN items.total_length IS 'Original total length of the drum/spool';
COMMENT ON COLUMN items.lagerplatz IS 'Storage location (e.g., Hamm, Berlin)';
COMMENT ON COLUMN items.bemerkung IS 'Additional remarks or notes about the material';
