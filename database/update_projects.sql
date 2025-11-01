-- 更新项目名称为 GSW 位置
-- 在 Supabase SQL Editor 中运行

-- 删除旧的示例项目
DELETE FROM baustellen;

-- 插入新的 GSW 项目
INSERT INTO baustellen (name, address, contact_person, contact_phone, contact_email, is_active) VALUES
('GSW_Kamen', 'Kamen, Germany', 'Max Mustermann', '+49 231 123456', 'kamen@gsw.de', true),
('Bochum', 'Bochum, Germany', 'Anna Schmidt', '+49 234 789012', 'bochum@gsw.de', true),
('Oberhausen', 'Oberhausen, Germany', 'Peter Weber', '+49 208 345678', 'oberhausen@gsw.de', true),
('Mülheim an der Ruhr', 'Mülheim an der Ruhr, Germany', 'Maria Fischer', '+49 208 901234', 'muelheim@gsw.de', true);
