-- ============================================
-- 完整仓库管理系统 (Complete Warehouse Management)
-- ============================================
-- 包含架位管理、材料调拨、签字、统计等功能

-- ============================================
-- 1. 架位管理表 (Storage Locations / Regal)
-- ============================================
CREATE TABLE IF NOT EXISTS storage_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE, -- 架位名称，如 "A1", "B2"
  qr_code TEXT UNIQUE, -- 架位二维码
  zone TEXT, -- 区域，如 "Zone A", "Zone B"
  description TEXT, -- 备注说明
  bemerkung TEXT, -- 特殊说明（如：多型号电缆）
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 如果表已存在但缺少 qr_code 列，则添加
ALTER TABLE storage_locations ADD COLUMN IF NOT EXISTS qr_code TEXT UNIQUE;
ALTER TABLE storage_locations ADD COLUMN IF NOT EXISTS zone TEXT;
ALTER TABLE storage_locations ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE storage_locations ADD COLUMN IF NOT EXISTS bemerkung TEXT;
ALTER TABLE storage_locations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE storage_locations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE storage_locations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 为架位创建索引
CREATE INDEX IF NOT EXISTS idx_storage_locations_qr_code ON storage_locations(qr_code);
CREATE INDEX IF NOT EXISTS idx_storage_locations_zone ON storage_locations(zone);

-- ============================================
-- 2. 库存表 (Inventory) - 材料在架位上的存放
-- ============================================
-- 一个架位可以存放多个材料（多材料摆放）
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES storage_locations(id) ON DELETE CASCADE NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  bemerkung TEXT, -- 备注（如：多种型号混放）
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, location_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_item_id ON inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_location_id ON inventory(location_id);

-- ============================================
-- 3. 项目管理表 (Projekt)
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  project_number TEXT UNIQUE, -- 项目编号
  description TEXT,
  start_date DATE,
  end_date DATE,
  bauleiter_id UUID REFERENCES profiles(id), -- 项目负责人
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_number ON projects(project_number);
CREATE INDEX IF NOT EXISTS idx_projects_bauleiter ON projects(bauleiter_id);

-- ============================================
-- 4. Sub 承包商管理表
-- ============================================
CREATE TABLE IF NOT EXISTS subcontractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company_name TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. 增强申请单表 (扩展 requests 表)
-- ============================================
-- 先添加列（不带外键约束），然后再添加约束
ALTER TABLE requests ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS worker_type TEXT DEFAULT 'intern';
ALTER TABLE requests ADD COLUMN IF NOT EXISTS subcontractor_id UUID;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS signature_data TEXT; -- 签名数据（Base64）
ALTER TABLE requests ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ; -- 签字时间
ALTER TABLE requests ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMPTZ; -- 领取时间

-- 删除旧的外键约束（如果存在）
ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_project_id_fkey;
ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_subcontractor_id_fkey;

-- 添加外键约束（在 projects 和 subcontractors 表已存在后）
ALTER TABLE requests ADD CONSTRAINT requests_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES projects(id);
ALTER TABLE requests ADD CONSTRAINT requests_subcontractor_id_fkey
  FOREIGN KEY (subcontractor_id) REFERENCES subcontractors(id);

-- 先删除旧的 CHECK 约束
ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_status_check;
ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_worker_type_check;

-- 更新任何无效的状态值为 'pending'
UPDATE requests
SET status = 'pending'
WHERE status IS NULL OR status NOT IN (
  'pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'completed', 'cancelled'
);

-- 更新任何无效的 worker_type 值为 'intern'
UPDATE requests
SET worker_type = 'intern'
WHERE worker_type IS NULL OR worker_type NOT IN ('intern', 'sub');

-- 添加新的状态 CHECK 约束
ALTER TABLE requests ADD CONSTRAINT requests_status_check
  CHECK (status IN (
    'pending',           -- 待处理 (Neu)
    'confirmed',         -- 已确认
    'preparing',         -- 准备中 (In Bearbeitung)
    'ready',            -- 已准备完成 (Bereit zur Abholung)
    'picked_up',        -- 已领取 (Abgeholt)
    'completed',        -- 已完成
    'cancelled'         -- 已取消
  ));

-- 添加 worker_type CHECK 约束
ALTER TABLE requests ADD CONSTRAINT requests_worker_type_check
  CHECK (worker_type IN ('intern', 'sub'));

-- ============================================
-- 6. 出入库记录表 (Inventory Transactions)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) NOT NULL,
  location_id UUID REFERENCES storage_locations(id),
  transaction_type TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  before_quantity DECIMAL(10, 2), -- 操作前数量
  after_quantity DECIMAL(10, 2),  -- 操作后数量

  -- 关联信息
  request_id UUID REFERENCES requests(id), -- 关联申请单
  project_id UUID REFERENCES projects(id), -- 关联项目
  from_project_id UUID REFERENCES projects(id), -- 调拨源项目
  to_project_id UUID REFERENCES projects(id),   -- 调拨目标项目

  -- 操作人员
  operator_id UUID REFERENCES profiles(id) NOT NULL,
  worker_type TEXT,
  subcontractor_id UUID REFERENCES subcontractors(id),

  -- 备注和引用
  notes TEXT,
  reference_type TEXT, -- 引用类型
  reference_id UUID,   -- 引用ID

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 如果表已存在但缺少列，则添加
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS from_project_id UUID REFERENCES projects(id);
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS to_project_id UUID REFERENCES projects(id);
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS worker_type TEXT;
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS subcontractor_id UUID REFERENCES subcontractors(id);
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS reference_type TEXT;
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS reference_id UUID;
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS before_quantity DECIMAL(10, 2);
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS after_quantity DECIMAL(10, 2);

-- 删除旧的 CHECK 约束
ALTER TABLE inventory_transactions DROP CONSTRAINT IF EXISTS inventory_transactions_transaction_type_check;
ALTER TABLE inventory_transactions DROP CONSTRAINT IF EXISTS inventory_transactions_worker_type_check;

-- 添加 CHECK 约束
ALTER TABLE inventory_transactions ADD CONSTRAINT inventory_transactions_transaction_type_check
  CHECK (transaction_type IN (
    'in',              -- 入库 (Wareneingang)
    'out',             -- 出库 (Warenausgang)
    'transfer',        -- 调拨 (Transfer)
    'return',          -- 退货 (Rückgabe)
    'adjustment',      -- 调整/盘点
    'unauthorized'     -- 未经授权拿走（定期统计）
  ));

ALTER TABLE inventory_transactions ADD CONSTRAINT inventory_transactions_worker_type_check
  CHECK (worker_type IN ('intern', 'sub') OR worker_type IS NULL);

CREATE INDEX IF NOT EXISTS idx_transactions_item ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_location ON inventory_transactions(location_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_project ON inventory_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON inventory_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_operator ON inventory_transactions(operator_id);

-- ============================================
-- 7. 退货申请表 (Return Requests)
-- ============================================
CREATE TABLE IF NOT EXISTS return_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_number TEXT UNIQUE NOT NULL,
  worker_id UUID REFERENCES profiles(id) NOT NULL,
  project_id UUID REFERENCES projects(id),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reason TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 退货明细
CREATE TABLE IF NOT EXISTS return_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_request_id UUID REFERENCES return_requests(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES items(id) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  condition TEXT, -- 物品状态（如：全新、轻微磨损等）
  notes TEXT
);

-- ============================================
-- 8. 材料调拨记录表 (Material Transfers)
-- ============================================
CREATE TABLE IF NOT EXISTS material_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transfer_number TEXT UNIQUE NOT NULL,
  from_project_id UUID REFERENCES projects(id) NOT NULL,
  to_project_id UUID REFERENCES projects(id) NOT NULL,
  bauleiter_approved BOOLEAN DEFAULT false, -- Bauleiter 是否同意
  bauleiter_id UUID REFERENCES profiles(id), -- 批准的 Bauleiter
  approved_at TIMESTAMPTZ,
  operator_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'completed')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 调拨明细
CREATE TABLE IF NOT EXISTS transfer_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transfer_id UUID REFERENCES material_transfers(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES items(id) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  notes TEXT
);

-- ============================================
-- 9. 使用频率统计视图
-- ============================================
CREATE OR REPLACE VIEW material_usage_frequency AS
SELECT
  i.id AS item_id,
  i.name AS item_name,
  i.category_id,
  c.name AS category_name,
  COUNT(it.id) AS usage_count,
  SUM(ABS(it.quantity)) AS total_quantity,
  MAX(it.created_at) AS last_used_at,
  AVG(ABS(it.quantity)) AS avg_quantity
FROM items i
LEFT JOIN categories c ON i.category_id = c.id
LEFT JOIN inventory_transactions it ON i.id = it.item_id
WHERE it.transaction_type IN ('out', 'return')
GROUP BY i.id, i.name, i.category_id, c.name
ORDER BY usage_count DESC, total_quantity DESC;

-- ============================================
-- 10. 项目材料使用统计视图
-- ============================================
CREATE OR REPLACE VIEW project_material_stats AS
SELECT
  p.id AS project_id,
  p.name AS project_name,
  p.project_number,
  i.id AS item_id,
  i.name AS item_name,
  i.unit,
  SUM(CASE WHEN it.transaction_type = 'out' THEN it.quantity ELSE 0 END) AS total_out,
  SUM(CASE WHEN it.transaction_type = 'return' THEN it.quantity ELSE 0 END) AS total_returned,
  SUM(CASE WHEN it.transaction_type = 'out' THEN it.quantity ELSE 0 END) -
  SUM(CASE WHEN it.transaction_type = 'return' THEN it.quantity ELSE 0 END) AS net_usage,
  COUNT(DISTINCT it.id) AS transaction_count
FROM projects p
LEFT JOIN inventory_transactions it ON p.id = it.project_id
LEFT JOIN items i ON it.item_id = i.id
GROUP BY p.id, p.name, p.project_number, i.id, i.name, i.unit;

-- ============================================
-- 11. 生成编号函数
-- ============================================
-- 生成退货单号
CREATE OR REPLACE FUNCTION generate_return_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  return_num TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM return_requests
  WHERE request_number LIKE 'RET%';

  return_num := 'RET' || LPAD(next_num::TEXT, 6, '0');
  RETURN return_num;
END;
$$ LANGUAGE plpgsql;

-- 生成调拨单号
CREATE OR REPLACE FUNCTION generate_transfer_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  transfer_num TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(transfer_number FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM material_transfers
  WHERE transfer_number LIKE 'TRF%';

  transfer_num := 'TRF' || LPAD(next_num::TEXT, 6, '0');
  RETURN transfer_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 12. 架位二维码生成
-- ============================================
-- 为架位生成唯一二维码
UPDATE storage_locations
SET qr_code = 'LOC-' || id::TEXT
WHERE qr_code IS NULL;

-- ============================================
-- 13. 插入示例架位数据
-- ============================================
INSERT INTO storage_locations (name, qr_code, zone, description) VALUES
  ('A1', 'LOC-A1', 'Zone A', 'Hauptlager - Linke Seite'),
  ('A2', 'LOC-A2', 'Zone A', 'Hauptlager - Linke Seite'),
  ('B1', 'LOC-B1', 'Zone B', 'Hauptlager - Rechte Seite'),
  ('B2', 'LOC-B2', 'Zone B', 'Hauptlager - Rechte Seite'),
  ('C1', 'LOC-C1', 'Zone C', 'Außenlager')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 14. 权限设置 (RLS Policies)
-- ============================================
-- 启用行级安全
ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcontractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_transfers ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Anyone can view locations" ON storage_locations;
DROP POLICY IF EXISTS "Anyone can view inventory" ON inventory;
DROP POLICY IF EXISTS "Anyone can view projects" ON projects;
DROP POLICY IF EXISTS "Lager can manage locations" ON storage_locations;
DROP POLICY IF EXISTS "Lager can manage inventory" ON inventory;

-- 所有认证用户可以查看
CREATE POLICY "Anyone can view locations" ON storage_locations FOR SELECT USING (true);
CREATE POLICY "Anyone can view inventory" ON inventory FOR SELECT USING (true);
CREATE POLICY "Anyone can view projects" ON projects FOR SELECT USING (true);

-- Lager 和 Admin 可以管理
CREATE POLICY "Lager can manage locations" ON storage_locations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('lager', 'admin'))
  );

CREATE POLICY "Lager can manage inventory" ON inventory
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('lager', 'admin'))
  );

-- ============================================
-- 完成！
-- ============================================
-- 系统现在支持：
-- ✅ 架位管理 (Regal Management) 带二维码
-- ✅ 多材料摆放（一个架位多个材料）
-- ✅ 项目管理 (Projekt)
-- ✅ Sub 承包商管理
-- ✅ 增强的申请流程（状态、签字）
-- ✅ 出入库记录（包括未经授权拿走）
-- ✅ 退货流程 (Rückgabe)
-- ✅ 材料调拨 (Projekttransfer)
-- ✅ 使用频率统计
-- ✅ 项目材料统计
