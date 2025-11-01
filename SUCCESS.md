# 🎉 系统启动成功！

## ✅ 运行状态

### 后端 (Backend)
**状态**: ✅ 运行中
- **地址**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health

### 前端 (Frontend)
**状态**: ✅ 运行中
- **地址**: http://localhost:3000
- **PWA**: 可安装

### 数据库 (Supabase)
**状态**: ✅ 已连接
- **项目**: https://euxerhrjoqawcplejpjj.supabase.co
- **数据**: 已初始化
  - 3 个工地
  - 7 个物品
  - 5 个分类

---

## 🚀 立即开始使用

### 方式 1：直接在前端注册（推荐）

1. **打开浏览器访问**: http://localhost:3000

2. **注册新账号**:
   - 点击 "Registrieren"
   - 填写信息：
     ```
     Name: Test Worker
     E-Mail: worker@test.de
     Password: password123
     Role: Arbeiter (工人)
     ```
   - 点击 "Registrieren"

3. **激活账号**（如果需要）:
   - 打开 Supabase Dashboard
   - 进入 Authentication > Users
   - 找到新用户，点击 "..." > "Confirm User"

4. **登录并测试**:
   - 返回 http://localhost:3000
   - 使用 worker@test.de / password123 登录
   - 开始创建申请！

### 方式 2：在 Supabase Dashboard 创建

1. **进入 Supabase Dashboard**
   - https://supabase.com/dashboard/project/euxerhrjoqawcplejpjj

2. **创建认证用户**:
   - Authentication > Users > Add user
   - Create new user
   - Email: `worker@test.de`
   - Password: `password123`
   - ✅ Auto Confirm User
   - 复制生成的 User ID

3. **创建用户资料**:
   - Table Editor > profiles > Insert row
   - 填写：
     ```
     id: [粘贴刚才复制的 User ID]
     email: worker@test.de
     full_name: Test Worker
     role: worker
     ```

4. **登录测试**:
   - 访问 http://localhost:3000
   - 登录并开始使用

---

## 📱 功能演示

### 工人端（Worker）

1. **创建物资申请**:
   - 登录后点击 "Neue Anfrage"
   - 选择工地：例如 "Projekt Berlin Mitte"
   - 添加物品：
     - 选择 "Zement"，数量 10
     - 选择 "Sand"，数量 5
   - 设置优先级和日期
   - 提交申请

2. **查看申请状态**:
   - 进入 "Meine Anfragen"
   - 查看申请列表和状态
   - 点击查看详情

### 仓库端（Lager）

1. **创建仓库账号**:
   - 注册时选择 "Lager" 角色

2. **管理申请**:
   - 查看所有申请
   - 更新状态：pending → confirmed → preparing → ready → shipped → completed
   - 筛选和搜索

3. **库存管理**:
   - 进入 "Lagerbestand"
   - 查看所有物品
   - 检查低库存警告

4. **查看统计**:
   - 进入 "Statistiken"
   - 查看月度报表
   - 分析材料使用

---

## 🔧 管理命令

### 查看运行状态

```bash
# 检查后端
curl http://localhost:8000/health

# 检查前端
curl -I http://localhost:3000
```

### 停止服务

后端和前端都在后台运行，如果需要停止：

```bash
# 查找进程
lsof -i :8000  # 后端
lsof -i :3000  # 前端

# 停止进程
kill <PID>
```

或者：

```bash
# 停止所有 Python（后端）
pkill -f uvicorn

# 停止所有 Node（前端）
pkill -f vite
```

### 重启服务

**后端**:
```bash
cd /Users/yuqiao/baustelle-system/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**前端**:
```bash
cd /Users/yuqiao/baustelle-system/frontend
npm run dev
```

---

## 📊 数据库管理

### 在 Supabase Dashboard

1. **查看数据**:
   - Table Editor > 选择表格
   - 可以直接编辑、插入、删除

2. **运行 SQL**:
   - SQL Editor > New query
   - 输入 SQL 并运行

3. **查看日志**:
   - Logs > 选择日志类型
   - 实时查看请求和错误

### 常用 SQL 查询

```sql
-- 查看所有申请
SELECT * FROM requests ORDER BY created_at DESC LIMIT 10;

-- 查看申请详情（包含物品）
SELECT
  r.*,
  ri.item_id,
  ri.quantity,
  i.name as item_name
FROM requests r
LEFT JOIN request_items ri ON r.id = ri.request_id
LEFT JOIN items i ON ri.item_id = i.id
WHERE r.id = 'REQUEST_ID';

-- 查看低库存物品
SELECT * FROM items
WHERE stock_quantity <= min_stock_level
AND is_active = true;

-- 查看今日申请
SELECT * FROM requests
WHERE DATE(created_at) = CURRENT_DATE;
```

---

## 🐛 故障排除

### 问题 1: 前端无法连接后端

**症状**: 网页加载但数据不显示

**解决**:
1. 确认后端运行：`curl http://localhost:8000/health`
2. 检查前端 `.env` 文件：`VITE_API_URL=http://localhost:8000`
3. 打开浏览器控制台（F12）查看错误

### 问题 2: 登录失败

**症状**: 提示 "Invalid credentials"

**解决**:
1. 确认用户已在 Supabase Authentication 中创建
2. 确认用户已 Confirm（或 Auto Confirm）
3. 检查 profiles 表中是否有对应记录
4. 尝试在 Supabase 重置密码

### 问题 3: 数据不显示

**症状**: 登录成功但看不到数据

**解决**:
1. 确认数据库已初始化：Table Editor 检查表
2. 确认 RLS 已禁用（开发环境）
3. 检查用户角色是否正确
4. 查看浏览器控制台和网络请求

### 问题 4: 端口被占用

**症状**: 启动失败，提示端口已使用

**解决**:
```bash
# 查找占用端口的进程
lsof -i :8000  # 或 :3000

# 停止进程
kill -9 <PID>

# 或使用不同端口
npm run dev -- --port 3001  # 前端
```

---

## 📚 学习资源

### 项目文档
- [README.md](README.md) - 完整项目文档
- [STEP_BY_STEP.md](STEP_BY_STEP.md) - 逐步设置指南
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Supabase 详细配置

### 技术文档
- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [React 文档](https://react.dev/)
- [Supabase 文档](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)

### API 文档
- 访问 http://localhost:8000/docs
- 可以直接测试所有 API 端点

---

## 🎯 下一步

### 功能扩展建议

1. **图片上传**:
   - 为物品添加图片
   - 为申请单添加附件

2. **实时通知**:
   - 浏览器推送通知
   - 邮件通知

3. **导出功能**:
   - PDF 报表
   - Excel 导出

4. **移动端优化**:
   - PWA 离线支持
   - 更好的移动端手势

5. **高级筛选**:
   - 日期范围筛选
   - 多条件组合筛选

6. **权限细化**:
   - 启用 RLS 策略
   - 更细粒度的权限控制

### 部署到生产环境

准备部署时查看 README.md 的部署章节。

---

## ✨ 恭喜！

你的工地物资申领系统已经完全运行！

- ✅ 后端 API 正常
- ✅ 前端界面正常
- ✅ 数据库连接正常
- ✅ 示例数据已加载

**立即访问**: http://localhost:3000

开始创建你的第一个物资申请吧！🚀

---

**需要帮助？**
查看文档或检查浏览器控制台的错误信息。

**祝你使用愉快！** 🎉
