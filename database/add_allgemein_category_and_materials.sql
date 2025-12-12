-- Add Allgemein category and materials
-- This script adds safety equipment to the Baustelle system

-- Step 1: Create Allgemein category
INSERT INTO categories (name, type, description, is_active)
VALUES ('Allgemein', 'material', 'General safety and work equipment', TRUE)
ON CONFLICT (name, type) DO NOTHING;

-- Step 2: Get the category ID and add materials
DO $$
DECLARE
  v_category_id UUID;
BEGIN
  -- Get Allgemein category ID
  SELECT id INTO v_category_id
  FROM categories
  WHERE name = 'Allgemein' AND type = 'material';

  -- Add Warnweste (Safety Vest)
  INSERT INTO items (category_id, name, type, unit, description, stock_quantity, min_stock_level, image_url, is_active)
  VALUES (
    v_category_id,
    'Warnweste',
    'material',
    'Stück',
    'High-visibility safety vest',
    50,
    10,
    'Material_Fotos/Warnweste.jpg',
    TRUE
  );

  -- Add Zollstock (Folding Ruler)
  INSERT INTO items (category_id, name, type, unit, description, stock_quantity, min_stock_level, image_url, is_active)
  VALUES (
    v_category_id,
    'Zollstock',
    'material',
    'Stück',
    'Folding ruler / measuring stick 2m',
    30,
    5,
    'Material_Fotos/Zollstock.jpg',
    TRUE
  );

  -- Add Warnschutzjacke (High-vis Jacket) - Size variants
  INSERT INTO items (category_id, name, type, unit, description, stock_quantity, min_stock_level, image_url, is_active)
  VALUES
    (v_category_id, 'Warnschutzjacke - S', 'material', 'Stück', 'High-visibility jacket Size S', 8, 2, 'Material_Fotos/Warnschutzjacke.jpg', TRUE),
    (v_category_id, 'Warnschutzjacke - M', 'material', 'Stück', 'High-visibility jacket Size M', 15, 3, 'Material_Fotos/Warnschutzjacke.jpg', TRUE),
    (v_category_id, 'Warnschutzjacke - L', 'material', 'Stück', 'High-visibility jacket Size L', 20, 5, 'Material_Fotos/Warnschutzjacke.jpg', TRUE),
    (v_category_id, 'Warnschutzjacke - XL', 'material', 'Stück', 'High-visibility jacket Size XL', 15, 3, 'Material_Fotos/Warnschutzjacke.jpg', TRUE),
    (v_category_id, 'Warnschutzjacke - XXL', 'material', 'Stück', 'High-visibility jacket Size XXL', 10, 2, 'Material_Fotos/Warnschutzjacke.jpg', TRUE);

  -- Add Sicherheitsschuhe (Safety Shoes) - Size variants
  INSERT INTO items (category_id, name, type, unit, description, stock_quantity, min_stock_level, image_url, is_active)
  VALUES
    (v_category_id, 'Sicherheitsschuhe - 39', 'material', 'Paar', 'Safety shoes S3 Size 39', 5, 1, 'Material_Fotos/Sicherheitsschuhe.jpg', TRUE),
    (v_category_id, 'Sicherheitsschuhe - 40', 'material', 'Paar', 'Safety shoes S3 Size 40', 8, 2, 'Material_Fotos/Sicherheitsschuhe.jpg', TRUE),
    (v_category_id, 'Sicherheitsschuhe - 41', 'material', 'Paar', 'Safety shoes S3 Size 41', 10, 2, 'Material_Fotos/Sicherheitsschuhe.jpg', TRUE),
    (v_category_id, 'Sicherheitsschuhe - 42', 'material', 'Paar', 'Safety shoes S3 Size 42', 12, 3, 'Material_Fotos/Sicherheitsschuhe.jpg', TRUE),
    (v_category_id, 'Sicherheitsschuhe - 43', 'material', 'Paar', 'Safety shoes S3 Size 43', 12, 3, 'Material_Fotos/Sicherheitsschuhe.jpg', TRUE),
    (v_category_id, 'Sicherheitsschuhe - 44', 'material', 'Paar', 'Safety shoes S3 Size 44', 10, 2, 'Material_Fotos/Sicherheitsschuhe.jpg', TRUE),
    (v_category_id, 'Sicherheitsschuhe - 45', 'material', 'Paar', 'Safety shoes S3 Size 45', 8, 2, 'Material_Fotos/Sicherheitsschuhe.jpg', TRUE),
    (v_category_id, 'Sicherheitsschuhe - 46', 'material', 'Paar', 'Safety shoes S3 Size 46', 5, 1, 'Material_Fotos/Sicherheitsschuhe.jpg', TRUE),
    (v_category_id, 'Sicherheitsschuhe - 47', 'material', 'Paar', 'Safety shoes S3 Size 47', 3, 1, 'Material_Fotos/Sicherheitsschuhe.jpg', TRUE);

END $$;
