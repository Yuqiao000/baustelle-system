-- ============================================
-- 材料管理系统升级 (Material Management Upgrade)
-- ============================================
-- 实现别名系统、图片管理、分类优化等功能

-- ============================================
-- 1. 添加 barcode 字段到 items 表 (如果还没有)
-- ============================================
ALTER TABLE items ADD COLUMN IF NOT EXISTS barcode TEXT UNIQUE;

-- 为现有物料生成 barcode (使用物料名称)
UPDATE items
SET barcode = name
WHERE barcode IS NULL;

-- ============================================
-- 2. 更新 items 表字段名称以匹配新需求
-- ============================================
-- 添加主名称和当前库存字段 (如果需要重命名)
-- current_stock 用于实时库存查询
ALTER TABLE items ADD COLUMN IF NOT EXISTS current_stock DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE items ADD COLUMN IF NOT EXISTS min_stock DECIMAL(10, 2) DEFAULT 0;

-- 复制旧数据到新字段 (如果有旧字段)
UPDATE items SET current_stock = stock_quantity WHERE current_stock = 0;
UPDATE items SET min_stock = min_stock_level WHERE min_stock = 0;

-- ============================================
-- 3. 创建材料别名表 (Material Aliases)
-- ============================================
CREATE TABLE IF NOT EXISTS item_aliases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  alias TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, alias)
);

-- 为别名创建索引以加快搜索
CREATE INDEX IF NOT EXISTS idx_item_aliases_alias ON item_aliases(alias);
CREATE INDEX IF NOT EXISTS idx_item_aliases_item_id ON item_aliases(item_id);

-- ============================================
-- 4. 创建材料图片表 (Material Images)
-- ============================================
CREATE TABLE IF NOT EXISTS item_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, image_url)
);

CREATE INDEX IF NOT EXISTS idx_item_images_item_id ON item_images(item_id);

-- ============================================
-- 5. 优化分类系统
-- ============================================
-- 添加父级分类支持 (允许嵌套分类)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 为分类添加图标字段
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT;

-- ============================================
-- 6. 插入示例德语分类
-- ============================================
INSERT INTO categories (name, type, description, icon) VALUES
  ('Kabel', 'material', 'Elektrische Kabel und Leitungen', '🔌'),
  ('Muffen', 'material', 'Kabelmuffen und Verbindungen', '🔗'),
  ('Schutzkleidung', 'material', 'Persönliche Schutzausrüstung', '🦺'),
  ('Baumaschinen', 'maschine', 'Baumaschinen und Geräte', '🚜'),
  ('Werkzeuge', 'material', 'Handwerkzeuge', '🔧'),
  ('Baustoffe', 'material', 'Baumaterialien', '🧱')
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. 创建材料搜索视图 (包含别名)
-- ============================================
CREATE OR REPLACE VIEW items_with_aliases AS
SELECT
  i.id,
  i.category_id,
  i.name AS hauptname,
  i.barcode,
  i.type,
  i.unit,
  i.description,
  i.current_stock,
  i.min_stock,
  i.image_url,
  i.is_active,
  i.created_at,
  i.updated_at,
  c.name AS category_name,
  COALESCE(
    array_agg(ia.alias) FILTER (WHERE ia.alias IS NOT NULL),
    ARRAY[]::TEXT[]
  ) AS aliases
FROM items i
LEFT JOIN categories c ON i.category_id = c.id
LEFT JOIN item_aliases ia ON i.id = ia.item_id
GROUP BY i.id, c.name;

-- ============================================
-- 8. 创建模糊搜索函数 (支持别名和纠错)
-- ============================================
CREATE OR REPLACE FUNCTION search_items(search_term TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  barcode TEXT,
  category_name TEXT,
  current_stock DECIMAL,
  unit TEXT,
  match_type TEXT,
  similarity_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  -- 精确匹配物料名称
  SELECT
    i.id,
    i.name,
    i.barcode,
    c.name AS category_name,
    i.current_stock,
    i.unit,
    'exact_name'::TEXT AS match_type,
    1.0::FLOAT AS similarity_score
  FROM items i
  LEFT JOIN categories c ON i.category_id = c.id
  WHERE LOWER(i.name) = LOWER(search_term)
    AND i.is_active = true

  UNION ALL

  -- 精确匹配 barcode
  SELECT
    i.id,
    i.name,
    i.barcode,
    c.name AS category_name,
    i.current_stock,
    i.unit,
    'exact_barcode'::TEXT AS match_type,
    1.0::FLOAT AS similarity_score
  FROM items i
  LEFT JOIN categories c ON i.category_id = c.id
  WHERE LOWER(i.barcode) = LOWER(search_term)
    AND i.is_active = true

  UNION ALL

  -- 精确匹配别名
  SELECT
    i.id,
    i.name,
    i.barcode,
    c.name AS category_name,
    i.current_stock,
    i.unit,
    'exact_alias'::TEXT AS match_type,
    1.0::FLOAT AS similarity_score
  FROM items i
  LEFT JOIN categories c ON i.category_id = c.id
  JOIN item_aliases ia ON i.id = ia.item_id
  WHERE LOWER(ia.alias) = LOWER(search_term)
    AND i.is_active = true

  UNION ALL

  -- 模糊匹配物料名称
  SELECT
    i.id,
    i.name,
    i.barcode,
    c.name AS category_name,
    i.current_stock,
    i.unit,
    'fuzzy_name'::TEXT AS match_type,
    similarity(LOWER(i.name), LOWER(search_term))::FLOAT AS similarity_score
  FROM items i
  LEFT JOIN categories c ON i.category_id = c.id
  WHERE LOWER(i.name) LIKE '%' || LOWER(search_term) || '%'
    AND i.is_active = true
    AND LOWER(i.name) != LOWER(search_term)

  UNION ALL

  -- 模糊匹配别名
  SELECT
    i.id,
    i.name,
    i.barcode,
    c.name AS category_name,
    i.current_stock,
    i.unit,
    'fuzzy_alias'::TEXT AS match_type,
    similarity(LOWER(ia.alias), LOWER(search_term))::FLOAT AS similarity_score
  FROM items i
  LEFT JOIN categories c ON i.category_id = c.id
  JOIN item_aliases ia ON i.id = ia.item_id
  WHERE LOWER(ia.alias) LIKE '%' || LOWER(search_term) || '%'
    AND i.is_active = true
    AND LOWER(ia.alias) != LOWER(search_term)

  ORDER BY similarity_score DESC, match_type
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. 插入示例材料别名
-- ============================================
-- 示例：为 "Muffe" 添加常见拼写错误作为别名
-- 注意：需要先有对应的 item_id，这里提供示例结构

-- INSERT INTO item_aliases (item_id, alias) VALUES
--   ((SELECT id FROM items WHERE name = 'Muffe' LIMIT 1), 'mufe'),
--   ((SELECT id FROM items WHERE name = 'Muffe' LIMIT 1), 'muff'),
--   ((SELECT id FROM items WHERE name = 'Muffe' LIMIT 1), 'Kabelmuffe');

-- ============================================
-- 10. 创建材料管理权限 (RLS Policies)
-- ============================================
-- 启用行级安全
ALTER TABLE item_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_images ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Anyone can view item aliases" ON item_aliases;
DROP POLICY IF EXISTS "Anyone can view item images" ON item_images;
DROP POLICY IF EXISTS "Lager and admin can manage aliases" ON item_aliases;
DROP POLICY IF EXISTS "Lager and admin can manage images" ON item_images;

-- 所有认证用户可以读取别名和图片
CREATE POLICY "Anyone can view item aliases" ON item_aliases
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view item images" ON item_images
  FOR SELECT USING (true);

-- 只有 lager 和 admin 可以管理别名
CREATE POLICY "Lager and admin can manage aliases" ON item_aliases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('lager', 'admin')
    )
  );

-- 只有 lager 和 admin 可以管理图片
CREATE POLICY "Lager and admin can manage images" ON item_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('lager', 'admin')
    )
  );

-- ============================================
-- 完成！
-- ============================================
-- 现在系统支持：
-- ✅ 材料主名称 (Hauptname) - items.name
-- ✅ 材料别名 (Aliase) - item_aliases 表
-- ✅ 分类系统 (Kategorie) - categories 表
-- ✅ 单位 (Einheit) - items.unit
-- ✅ 最低库存 (Min-Stock) - items.min_stock
-- ✅ 当前库存 (Current Stock) - items.current_stock
-- ✅ 二维码 (QR-Code) - items.barcode
-- ✅ 图片 (Bilder) - item_images 表
-- ✅ 模糊搜索 - search_items() 函数
-- ✅ 自动纠错 - 通过别名实现
