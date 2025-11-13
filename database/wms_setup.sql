-- WMS (仓库管理系统) 数据库结构
-- 在 Supabase SQL Editor 中运行

-- 1. 扩展现有的 items 表，添加 WMS 相关字段
ALTER TABLE items
ADD COLUMN IF NOT EXISTS barcode TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS min_stock DECIMAL DEFAULT 10,
ADD COLUMN IF NOT EXISTS current_stock DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS reorder_point DECIMAL DEFAULT 20;

-- 为 barcode 创建索引以加快扫描速度
CREATE INDEX IF NOT EXISTS idx_items_barcode ON items(barcode);

-- 2. 创建库位表（货架位置管理）
CREATE TABLE IF NOT EXISTS storage_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,  -- 例如: "2A", "13B1", "Regal-3-Fach-2"
  description TEXT,
  zone TEXT,  -- 区域，例如: "A区", "B区"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. 创建库存记录表（每个库位的详细库存）
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  location_id UUID REFERENCES storage_locations(id) ON DELETE CASCADE,
  quantity DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(item_id, location_id)  -- 同一物料在同一库位只有一条记录
);

-- 为库存表创建索引
CREATE INDEX IF NOT EXISTS idx_inventory_item ON inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_location ON inventory(location_id);

-- 4. 创建出入库记录表（完整的操作历史，用于审计和追踪）
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  location_id UUID REFERENCES storage_locations(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjust', 'initial')),
  -- in: 入库, out: 出库, adjust: 调整, initial: 初始盘点
  quantity DECIMAL NOT NULL,
  before_quantity DECIMAL,  -- 操作前数量
  after_quantity DECIMAL,   -- 操作后数量
  operator_id UUID REFERENCES profiles(id),  -- 操作人
  notes TEXT,
  reference_type TEXT,  -- 关联类型: 'request', 'purchase', 'manual'
  reference_id UUID,    -- 关联ID（如果是申请单出库，则关联到 request_id）
  created_at TIMESTAMP DEFAULT NOW()
);

-- 为交易记录创建索引
CREATE INDEX IF NOT EXISTS idx_transactions_item ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_operator ON inventory_transactions(operator_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON inventory_transactions(created_at DESC);

-- 5. 创建采购申请表（低库存自动生成采购需求）
CREATE TABLE IF NOT EXISTS purchase_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_number TEXT UNIQUE NOT NULL,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  quantity DECIMAL NOT NULL,
  reason TEXT,  -- 例如: "低库存自动触发"
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'ordered', 'received', 'cancelled')),
  created_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 为采购申请创建索引
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_created ON purchase_requests(created_at DESC);

-- 6. 创建自动更新 items.current_stock 的触发器
-- 当 inventory 表变化时，自动汇总更新 items 表的 current_stock
CREATE OR REPLACE FUNCTION update_item_current_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- 汇总该物料在所有库位的总库存
  UPDATE items
  SET current_stock = (
    SELECT COALESCE(SUM(quantity), 0)
    FROM inventory
    WHERE item_id = COALESCE(NEW.item_id, OLD.item_id)
  )
  WHERE id = COALESCE(NEW.item_id, OLD.item_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_item_stock ON inventory;
CREATE TRIGGER trigger_update_item_stock
AFTER INSERT OR UPDATE OR DELETE ON inventory
FOR EACH ROW
EXECUTE FUNCTION update_item_current_stock();

-- 7. 创建自动生成采购申请编号的函数
CREATE OR REPLACE FUNCTION generate_purchase_request_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  -- 格式: PR-YYYYMMDD-XXX
  SELECT COUNT(*) + 1 INTO counter
  FROM purchase_requests
  WHERE request_number LIKE 'PR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%';

  new_number := 'PR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 3, '0');

  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- 8. 插入一些示例库位
INSERT INTO storage_locations (name, description, zone) VALUES
('2A', 'Regal 2, Fach A', 'Zone A'),
('13B1', 'Regal 13, Fach B, Ebene 1', 'Zone B'),
('Regal-1-A', 'Erstes Regal, Fach A', 'Zone A'),
('Regal-1-B', 'Erstes Regal, Fach B', 'Zone A'),
('Regal-2-A', 'Zweites Regal, Fach A', 'Zone A'),
('Regal-2-B', 'Zweites Regal, Fach B', 'Zone A')
ON CONFLICT (name) DO NOTHING;

-- 9. 为现有物料添加示例条码（如果需要）
-- 这是可选的，仅用于测试
UPDATE items SET barcode = 'BAR-' || id::TEXT WHERE barcode IS NULL;

-- 10. 创建视图：库存摘要（方便查询每个物料的总库存和分布）
CREATE OR REPLACE VIEW inventory_summary AS
SELECT
  i.id as item_id,
  i.name as item_name,
  i.type as item_type,
  i.unit,
  i.barcode,
  i.current_stock,
  i.min_stock,
  i.reorder_point,
  CASE
    WHEN i.current_stock <= i.min_stock THEN 'critical'
    WHEN i.current_stock <= i.reorder_point THEN 'low'
    ELSE 'normal'
  END as stock_status,
  COUNT(inv.id) as location_count,
  STRING_AGG(sl.name || ' (' || inv.quantity || ')', ', ' ORDER BY sl.name) as locations
FROM items i
LEFT JOIN inventory inv ON i.id = inv.item_id
LEFT JOIN storage_locations sl ON inv.location_id = sl.id
WHERE i.is_active = true
GROUP BY i.id, i.name, i.type, i.unit, i.barcode, i.current_stock, i.min_stock, i.reorder_point;

-- 11. 创建视图：低库存物料（需要补货的物料）
CREATE OR REPLACE VIEW low_stock_items AS
SELECT
  i.id as item_id,
  i.name as item_name,
  i.barcode,
  i.current_stock,
  i.min_stock,
  i.reorder_point,
  i.unit,
  (i.reorder_point - i.current_stock) as shortage_quantity
FROM items i
WHERE i.is_active = true
  AND i.current_stock <= i.reorder_point
ORDER BY (i.current_stock / NULLIF(i.min_stock, 0)) ASC;

-- 完成！WMS 数据库结构已创建
COMMENT ON TABLE storage_locations IS '仓库库位表 - 管理货架位置';
COMMENT ON TABLE inventory IS '库存记录表 - 每个库位的详细库存';
COMMENT ON TABLE inventory_transactions IS '出入库记录表 - 完整的操作历史';
COMMENT ON TABLE purchase_requests IS '采购申请表 - 低库存自动生成';
COMMENT ON VIEW inventory_summary IS '库存摘要视图 - 显示每个物料的总库存和分布';
COMMENT ON VIEW low_stock_items IS '低库存物料视图 - 需要补货的物料列表';
