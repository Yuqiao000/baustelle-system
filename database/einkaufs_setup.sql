-- 采购系统数据库设计
-- Einkaufs (Purchasing) System Database Schema

-- ====================================
-- 1. 供应商表 (Suppliers)
-- ====================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  rating DECIMAL(2,1) DEFAULT 0, -- 评分 0-5
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ====================================
-- 2. 供应商-物料关系表 (Supplier Items)
-- ====================================
CREATE TABLE IF NOT EXISTS supplier_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  unit_price DECIMAL(10,2),
  lead_time_days INTEGER, -- 交货周期（天）
  min_order_quantity DECIMAL(10,2) DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(supplier_id, item_id)
);

-- ====================================
-- 3. 采购订单表 (Purchase Orders)
-- ====================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL, -- PO-20250114-001
  supplier_id UUID REFERENCES suppliers(id),
  purchaser_id UUID REFERENCES profiles(id), -- 采购员
  status TEXT NOT NULL DEFAULT 'draft', -- draft, ordered, shipping, delivered, cancelled
  total_amount DECIMAL(10,2) DEFAULT 0,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ====================================
-- 4. 采购订单明细表 (Purchase Order Items)
-- ====================================
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  received_quantity DECIMAL(10,2) DEFAULT 0, -- 已收货数量
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ====================================
-- 5. 采购请求表 (Purchase Requests)
-- 用于低库存自动生成或工人申请转换的采购需求
-- ====================================
CREATE TABLE IF NOT EXISTS purchase_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id),
  requested_quantity DECIMAL(10,2) NOT NULL,
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  reason TEXT, -- 请求原因：low_stock, worker_request, project_need
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, ordered
  requester_id UUID REFERENCES profiles(id),
  approver_id UUID REFERENCES profiles(id),
  purchase_order_id UUID REFERENCES purchase_orders(id), -- 关联的采购订单
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ====================================
-- 6. 到货记录表 (Delivery Records)
-- ====================================
CREATE TABLE IF NOT EXISTS delivery_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID REFERENCES purchase_orders(id),
  receiver_id UUID REFERENCES profiles(id), -- 收货人（Lager）
  delivery_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  quality_check_status TEXT DEFAULT 'pending', -- pending, passed, failed
  quality_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ====================================
-- 索引优化
-- ====================================
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON purchase_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_item ON purchase_requests(item_id);
CREATE INDEX IF NOT EXISTS idx_supplier_items_supplier ON supplier_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_items_item ON supplier_items(item_id);

-- ====================================
-- 自动更新 updated_at 触发器
-- ====================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_requests_updated_at BEFORE UPDATE ON purchase_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- 自动生成采购订单编号函数
-- ====================================
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TEXT AS $$
DECLARE
  today TEXT;
  counter INTEGER;
  po_number TEXT;
BEGIN
  today := TO_CHAR(NOW(), 'YYYYMMDD');

  -- 获取今天的订单数量
  SELECT COUNT(*) + 1 INTO counter
  FROM purchase_orders
  WHERE order_number LIKE 'PO-' || today || '%';

  po_number := 'PO-' || today || '-' || LPAD(counter::TEXT, 3, '0');

  RETURN po_number;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 视图：低库存物料
-- ====================================
CREATE OR REPLACE VIEW low_stock_items AS
SELECT
  i.id,
  i.name,
  i.barcode,
  i.current_stock,
  i.min_stock,
  i.unit,
  i.category_id,
  (i.min_stock - i.current_stock) AS shortage_quantity,
  CASE
    WHEN i.current_stock <= 0 THEN 'out_of_stock'
    WHEN i.current_stock < i.min_stock * 0.5 THEN 'critical'
    WHEN i.current_stock < i.min_stock THEN 'low'
    ELSE 'normal'
  END AS stock_level
FROM items i
WHERE i.current_stock < i.min_stock
  AND i.is_active = true
ORDER BY (i.current_stock / NULLIF(i.min_stock, 0)) ASC;

-- ====================================
-- 视图：采购订单详情
-- ====================================
CREATE OR REPLACE VIEW purchase_order_details AS
SELECT
  po.id AS order_id,
  po.order_number,
  po.status,
  po.total_amount,
  po.order_date,
  po.expected_delivery_date,
  po.actual_delivery_date,
  s.name AS supplier_name,
  s.contact_person AS supplier_contact,
  p.full_name AS purchaser_name,
  COUNT(poi.id) AS item_count,
  SUM(poi.quantity) AS total_quantity,
  SUM(poi.received_quantity) AS total_received
FROM purchase_orders po
LEFT JOIN suppliers s ON po.supplier_id = s.id
LEFT JOIN profiles p ON po.purchaser_id = p.id
LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
GROUP BY po.id, po.order_number, po.status, po.total_amount,
         po.order_date, po.expected_delivery_date, po.actual_delivery_date,
         s.name, s.contact_person, p.full_name;

-- ====================================
-- 初始化测试数据
-- ====================================

-- 添加测试供应商
INSERT INTO suppliers (name, contact_person, email, phone, address, rating) VALUES
('Baumarkt Schmidt GmbH', 'Hans Schmidt', 'schmidt@baumarkt.de', '+49 30 12345678', 'Berliner Str. 123, 10115 Berlin', 4.5),
('Werkzeug Meyer AG', 'Anna Meyer', 'meyer@werkzeug.de', '+49 89 87654321', 'Münchner Weg 45, 80333 München', 4.8),
('Material Express', 'Peter Wagner', 'wagner@material-express.de', '+49 40 55566677', 'Hamburger Allee 67, 20095 Hamburg', 4.2)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE suppliers IS '供应商信息表';
COMMENT ON TABLE supplier_items IS '供应商提供的物料及价格';
COMMENT ON TABLE purchase_orders IS '采购订单主表';
COMMENT ON TABLE purchase_order_items IS '采购订单明细';
COMMENT ON TABLE purchase_requests IS '采购请求（低库存或工人申请生成）';
COMMENT ON TABLE delivery_records IS '到货记录和质检信息';
