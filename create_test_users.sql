-- 创建测试用户的 SQL 脚本
-- 在 Supabase SQL Editor 中运行

-- 注意：这些用户 ID 是示例，你需要先在 Authentication 中创建用户，然后使用真实的 UUID

-- 如果你已经通过 Supabase Auth 创建了用户，使用以下脚本插入 profile
-- 替换 'USER_ID_FROM_AUTH' 为实际的用户 ID

-- 示例：创建 Worker 用户资料
INSERT INTO profiles (id, email, full_name, role, phone)
VALUES
  ('USER_ID_FROM_AUTH', 'worker@test.de', 'Test Worker', 'worker', '+49 123 456789')
ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      phone = EXCLUDED.phone;

-- 示例：创建 Lager 用户资料
INSERT INTO profiles (id, email, full_name, role, phone)
VALUES
  ('USER_ID_FROM_AUTH_2', 'lager@test.de', 'Test Lager', 'lager', '+49 987 654321')
ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      phone = EXCLUDED.phone;

-- 快速创建测试用户的步骤：
-- 1. 在 Supabase Dashboard > Authentication > Users
-- 2. 点击 "Add user" > "Create new user"
-- 3. 填写 Email 和 Password，勾选 "Auto Confirm User"
-- 4. 复制生成的 User ID
-- 5. 将上面的 'USER_ID_FROM_AUTH' 替换为复制的 ID
-- 6. 在 SQL Editor 中运行修改后的 SQL
