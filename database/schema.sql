-- ============================================
-- 工地物资申领系统 - Supabase 数据库架构
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 用户表（使用 Supabase Auth）
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('worker', 'lager', 'admin')) NOT NULL DEFAULT 'worker',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 工地表
-- ============================================
CREATE TABLE baustellen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 材料/设备类别表
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('material', 'maschine')) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 材料/设备表
-- ============================================
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('material', 'maschine')) NOT NULL,
  unit TEXT NOT NULL, -- 单位：kg, m, Stück 等
  description TEXT,
  stock_quantity DECIMAL(10, 2) DEFAULT 0,
  min_stock_level DECIMAL(10, 2) DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 申请单表
-- ============================================
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_number TEXT UNIQUE NOT NULL, -- 申请单号
  worker_id UUID REFERENCES profiles(id) NOT NULL,
  baustelle_id UUID REFERENCES baustellen(id) NOT NULL,
  status TEXT CHECK (status IN (
    'pending',      -- 待处理
    'confirmed',    -- 已确认
    'preparing',    -- 准备中
    'ready',        -- 已准备完成
    'shipped',      -- 已发货
    'completed',    -- 已完成
    'cancelled'     -- 已取消
  )) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  needed_date DATE,
  delivery_time TEXT, -- 期望送达时间段
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES profiles(id),
  completed_at TIMESTAMPTZ
);

-- ============================================
-- 申请单明细表
-- ============================================
CREATE TABLE request_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES items(id) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 申请单状态历史表
-- ============================================
CREATE TABLE request_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 通知表
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('request', 'status_change', 'system')) NOT NULL,
  related_request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 索引
-- ============================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

CREATE INDEX idx_baustellen_active ON baustellen(is_active);

CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_active ON items(is_active);

CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_worker ON requests(worker_id);
CREATE INDEX idx_requests_baustelle ON requests(baustelle_id);
CREATE INDEX idx_requests_created ON requests(created_at DESC);
CREATE INDEX idx_requests_needed_date ON requests(needed_date);

CREATE INDEX idx_request_items_request ON request_items(request_id);
CREATE INDEX idx_request_items_item ON request_items(item_id);

CREATE INDEX idx_request_history_request ON request_history(request_id);
CREATE INDEX idx_request_history_created ON request_history(created_at DESC);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- 触发器：自动更新 updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_baustellen_updated_at BEFORE UPDATE ON baustellen
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 触发器：生成申请单号
-- ============================================
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.request_number = 'REQ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE request_number_seq;

CREATE TRIGGER set_request_number BEFORE INSERT ON requests
  FOR EACH ROW EXECUTE FUNCTION generate_request_number();

-- ============================================
-- 触发器：记录申请单状态变更历史
-- ============================================
CREATE OR REPLACE FUNCTION record_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO request_history (request_id, status, changed_by)
    VALUES (NEW.id, NEW.status, NEW.confirmed_by);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_request_status_changes AFTER UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION record_request_status_change();

-- ============================================
-- 触发器：创建通知
-- ============================================
CREATE OR REPLACE FUNCTION create_notification_on_request()
RETURNS TRIGGER AS $$
DECLARE
  lager_user RECORD;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- 工人创建申请后，通知所有仓库管理员
    notification_title := '新申请单';
    notification_message := '申请单 ' || NEW.request_number || ' 已创建';

    FOR lager_user IN SELECT id FROM profiles WHERE role IN ('lager', 'admin')
    LOOP
      INSERT INTO notifications (user_id, title, message, type, related_request_id)
      VALUES (lager_user.id, notification_title, notification_message, 'request', NEW.id);
    END LOOP;

  ELSIF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    -- 状态变更后，通知申请工人
    notification_title := '申请单状态更新';
    notification_message := '申请单 ' || NEW.request_number || ' 状态已更新为: ' || NEW.status;

    INSERT INTO notifications (user_id, title, message, type, related_request_id)
    VALUES (NEW.worker_id, notification_title, notification_message, 'status_change', NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_request_changes AFTER INSERT OR UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION create_notification_on_request();

-- ============================================
-- Row Level Security (RLS) 策略
-- ============================================

-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE baustellen ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: 用户可以看到自己的资料，管理员可以看到所有
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Baustellen: 所有认证用户可以查看
CREATE POLICY "Authenticated users can view baustellen" ON baustellen
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Lager and admins can manage baustellen" ON baustellen
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('lager', 'admin'))
  );

-- Categories: 所有认证用户可以查看
CREATE POLICY "Authenticated users can view categories" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Lager and admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('lager', 'admin'))
  );

-- Items: 所有认证用户可以查看
CREATE POLICY "Authenticated users can view items" ON items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Lager and admins can manage items" ON items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('lager', 'admin'))
  );

-- Requests: 工人可以查看自己的申请，仓库和管理员可以查看所有
CREATE POLICY "Workers can view own requests" ON requests
  FOR SELECT USING (worker_id = auth.uid());

CREATE POLICY "Workers can create requests" ON requests
  FOR INSERT WITH CHECK (worker_id = auth.uid());

CREATE POLICY "Lager and admins can view all requests" ON requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('lager', 'admin'))
  );

CREATE POLICY "Lager and admins can update requests" ON requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('lager', 'admin'))
  );

-- Request Items: 根据申请单权限
CREATE POLICY "Users can view request items of accessible requests" ON request_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM requests
      WHERE requests.id = request_items.request_id
      AND (requests.worker_id = auth.uid()
           OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('lager', 'admin')))
    )
  );

CREATE POLICY "Workers can create request items" ON request_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM requests WHERE id = request_id AND worker_id = auth.uid())
  );

-- Request History: 根据申请单权限
CREATE POLICY "Users can view request history of accessible requests" ON request_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM requests
      WHERE requests.id = request_history.request_id
      AND (requests.worker_id = auth.uid()
           OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('lager', 'admin')))
    )
  );

-- Notifications: 用户只能看到自己的通知
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- 初始数据
-- ============================================

-- 插入默认类别
INSERT INTO categories (name, type, description) VALUES
  ('Werkzeuge', 'maschine', '各类工具'),
  ('Baumaschinen', 'maschine', '建筑机械'),
  ('Baustoffe', 'material', '建筑材料'),
  ('Befestigungsmaterial', 'material', '固定材料'),
  ('Elektromaterial', 'material', '电气材料');

-- 插入示例材料和设备
INSERT INTO items (category_id, name, type, unit, description, stock_quantity, min_stock_level)
SELECT
  c.id,
  'Bohrmaschine',
  'maschine',
  'Stück',
  '电钻',
  5,
  2
FROM categories c WHERE c.name = 'Werkzeuge'
UNION ALL
SELECT
  c.id,
  'Winkelschleifer',
  'maschine',
  'Stück',
  '角磨机',
  3,
  1
FROM categories c WHERE c.name = 'Werkzeuge'
UNION ALL
SELECT
  c.id,
  'Bagger',
  'maschine',
  'Stück',
  '挖掘机',
  2,
  1
FROM categories c WHERE c.name = 'Baumaschinen'
UNION ALL
SELECT
  c.id,
  'Zement',
  'material',
  'Sack',
  '水泥',
  500,
  100
FROM categories c WHERE c.name = 'Baustoffe'
UNION ALL
SELECT
  c.id,
  'Sand',
  'material',
  'Tonne',
  '沙子',
  50,
  10
FROM categories c WHERE c.name = 'Baustoffe'
UNION ALL
SELECT
  c.id,
  'Schrauben M8',
  'material',
  'Stück',
  'M8 螺丝',
  10000,
  1000
FROM categories c WHERE c.name = 'Befestigungsmaterial'
UNION ALL
SELECT
  c.id,
  'Kabel NYM 3x1,5',
  'material',
  'Meter',
  '电缆线',
  1000,
  200
FROM categories c WHERE c.name = 'Elektromaterial';

-- 插入示例工地
INSERT INTO baustellen (name, address, city, postal_code, contact_person, contact_phone) VALUES
  ('Projekt Berlin Mitte', 'Unter den Linden 1', 'Berlin', '10117', 'Hans Müller', '+49 30 12345678'),
  ('Neubau Hamburg', 'Reeperbahn 154', 'Hamburg', '20359', 'Peter Schmidt', '+49 40 87654321'),
  ('Sanierung München', 'Marienplatz 8', 'München', '80331', 'Anna Weber', '+49 89 11223344');
