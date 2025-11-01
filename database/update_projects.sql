-- 更新项目名称为 GSW 位置
-- 在 Supabase SQL Editor 中运行

-- 为了避免外键约束错误，需要按顺序删除数据
-- 1. 删除申请单明细
DELETE FROM request_items WHERE request_id IN (SELECT id FROM requests);

-- 2. 删除申请单历史
DELETE FROM request_history WHERE request_id IN (SELECT id FROM requests);

-- 3. 删除通知
DELETE FROM notifications WHERE related_request_id IN (SELECT id FROM requests);

-- 4. 删除申请单
DELETE FROM requests;

-- 5. 删除旧的示例项目
DELETE FROM baustellen;

-- 插入新的 GSW 项目（使用正确的列名）
INSERT INTO baustellen (name, address, city, postal_code, contact_person, contact_phone, is_active) VALUES
('GSW_Kamen', 'Kamen', 'Kamen', '59174', 'Projekt Manager', '+49 231 123456', true),
('Bochum', 'Bochum', 'Bochum', '44787', 'Projekt Manager', '+49 234 789012', true),
('Oberhausen', 'Oberhausen', 'Oberhausen', '46045', 'Projekt Manager', '+49 208 345678', true),
('Mülheim an der Ruhr', 'Mülheim an der Ruhr', 'Mülheim an der Ruhr', '45468', 'Projekt Manager', '+49 208 901234', true);
