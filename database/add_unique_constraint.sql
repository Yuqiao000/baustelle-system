-- ============================================
-- Add unique constraint to prevent duplicate materials
-- ============================================

-- This will prevent duplicate materials with the same name and project
-- If you try to insert a duplicate, it will be silently ignored

ALTER TABLE items
ADD CONSTRAINT items_name_baustelle_unique
UNIQUE (name, baustelle_id);
