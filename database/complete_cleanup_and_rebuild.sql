-- ============================================
-- 完整清理和重建数据库
-- ============================================
-- 这个脚本会：
-- 1. 删除所有重复数据
-- 2. 添加必要的唯一约束
-- 3. 重新插入干净的数据

-- ============================================
-- 第1步：删除所有数据（保留表结构）
-- ============================================
DELETE FROM request_items;
DELETE FROM items;
DELETE FROM request_history;
DELETE FROM requests;
DELETE FROM baustellen;
DELETE FROM categories;

-- ============================================
-- 第2步：添加唯一约束
-- ============================================

-- Categories: name 必须唯一
ALTER TABLE categories
DROP CONSTRAINT IF EXISTS categories_name_unique;

ALTER TABLE categories
ADD CONSTRAINT categories_name_unique
UNIQUE (name);

-- Baustellen: name 必须唯一
ALTER TABLE baustellen
DROP CONSTRAINT IF EXISTS baustellen_name_unique;

ALTER TABLE baustellen
ADD CONSTRAINT baustellen_name_unique
UNIQUE (name);

-- Items: (name, baustelle_id) 必须唯一 (已存在，但确保)
ALTER TABLE items
DROP CONSTRAINT IF EXISTS items_name_baustelle_unique;

ALTER TABLE items
ADD CONSTRAINT items_name_baustelle_unique
UNIQUE (name, baustelle_id);

-- ============================================
-- 第3步：插入干净的 Categories
-- ============================================
INSERT INTO categories (name, type, description) VALUES
('Rohrsysteme', 'material', 'Pipe systems and accessories'),
('Rohrverbund', 'material', 'Main pipe connections'),
('Verbindungselemente', 'material', 'Connection elements'),
('Warnmaterialien', 'material', 'Warning materials'),
('Markierungsmaterial', 'material', 'Marking materials');

-- ============================================
-- 第4步：插入 Projekt Bergkamen
-- ============================================
INSERT INTO baustellen (name, address, city, postal_code, contact_person, contact_phone, is_active)
VALUES ('Projekt Bergkamen', 'Bergkamen Straße 1', 'Bergkamen', '59192', 'Max Mustermann', '+49 231 12345678', true);

-- ============================================
-- 第5步：验证
-- ============================================
SELECT 'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'baustellen', COUNT(*) FROM baustellen
UNION ALL
SELECT 'items', COUNT(*) FROM items;

-- 应该返回：
-- categories: 5
-- baustellen: 1
-- items: 0
