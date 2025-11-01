-- 修复 RLS 策略中的无限递归问题

-- 删除所有现有策略
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

DROP POLICY IF EXISTS "Authenticated users can view baustellen" ON baustellen;
DROP POLICY IF EXISTS "Lager and admins can manage baustellen" ON baustellen;

DROP POLICY IF EXISTS "Authenticated users can view categories" ON categories;
DROP POLICY IF EXISTS "Lager and admins can manage categories" ON categories;

DROP POLICY IF EXISTS "Authenticated users can view items" ON items;
DROP POLICY IF EXISTS "Lager and admins can manage items" ON items;

DROP POLICY IF EXISTS "Workers can view own requests" ON requests;
DROP POLICY IF EXISTS "Workers can create requests" ON requests;
DROP POLICY IF EXISTS "Lager and admins can view all requests" ON requests;
DROP POLICY IF EXISTS "Lager and admins can update requests" ON requests;

DROP POLICY IF EXISTS "Users can view request items of accessible requests" ON request_items;
DROP POLICY IF EXISTS "Workers can create request items" ON request_items;

DROP POLICY IF EXISTS "Users can view request history of accessible requests" ON request_history;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- 重新创建简化的策略

-- Profiles: 用户可以看到自己的资料
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Baustellen: 所有认证用户可以查看，仓库和管理员可以管理
CREATE POLICY "baustellen_select_authenticated" ON baustellen
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "baustellen_all_lager_admin" ON baustellen
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('lager', 'admin')
    )
  );

-- Categories: 所有认证用户可以查看
CREATE POLICY "categories_select_authenticated" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "categories_all_lager_admin" ON categories
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('lager', 'admin')
    )
  );

-- Items: 所有认证用户可以查看
CREATE POLICY "items_select_authenticated" ON items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "items_all_lager_admin" ON items
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('lager', 'admin')
    )
  );

-- Requests: 工人可以查看和创建自己的申请，仓库和管理员可以查看和管理所有
CREATE POLICY "requests_select_own_or_lager" ON requests
  FOR SELECT USING (
    worker_id = auth.uid()
    OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('lager', 'admin'))
  );

CREATE POLICY "requests_insert_worker" ON requests
  FOR INSERT WITH CHECK (worker_id = auth.uid());

CREATE POLICY "requests_update_lager_admin" ON requests
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('lager', 'admin'))
  );

-- Request Items: 跟随申请的权限
CREATE POLICY "request_items_select_via_request" ON request_items
  FOR SELECT USING (
    request_id IN (
      SELECT id FROM requests
      WHERE worker_id = auth.uid()
      OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('lager', 'admin'))
    )
  );

CREATE POLICY "request_items_insert_via_request" ON request_items
  FOR INSERT WITH CHECK (
    request_id IN (SELECT id FROM requests WHERE worker_id = auth.uid())
  );

CREATE POLICY "request_items_update_lager_admin" ON request_items
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('lager', 'admin'))
  );

-- Request History: 跟随申请的权限
CREATE POLICY "request_history_select_via_request" ON request_history
  FOR SELECT USING (
    request_id IN (
      SELECT id FROM requests
      WHERE worker_id = auth.uid()
      OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('lager', 'admin'))
    )
  );

CREATE POLICY "request_history_insert_all" ON request_history
  FOR INSERT WITH CHECK (true);  -- 由触发器创建，允许所有

-- Notifications: 用户只能看到和更新自己的通知
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_all" ON notifications
  FOR INSERT WITH CHECK (true);  -- 由触发器创建，允许所有
