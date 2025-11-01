# 快速启动指南

## 第一步：Supabase 设置

### 1. 创建 Supabase 项目

1. 访问 https://supabase.com 并登录
2. 点击 "New Project"
3. 输入项目信息：
   - Project Name: `baustelle-system`
   - Database Password: 设置一个强密码
   - Region: 选择最近的区域
4. 等待项目创建完成（约 2 分钟）

### 2. 初始化数据库

1. 在项目中点击左侧的 "SQL Editor"
2. 点击 "New Query"
3. 复制 `database/schema.sql` 的全部内容
4. 粘贴并点击 "Run" 执行
5. 确认所有表创建成功（应该看到成功消息）

### 3. 获取 API 密钥

1. 点击左侧的 "Settings" → "API"
2. 复制以下内容：
   - Project URL: `https://xxxxx.supabase.co`
   - anon public key: `eyJhbGc...`
   - service_role key: `eyJhbGc...` (注意保密)

## 第二步：后端设置

```bash
# 1. 进入后端目录
cd backend

# 2. 创建 Python 虚拟环境
python3 -m venv venv

# 3. 激活虚拟环境
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 4. 安装依赖
pip install -r requirements.txt

# 5. 配置环境变量
cp .env.example .env

# 6. 编辑 .env 文件
# 使用你喜欢的编辑器打开 .env，填入从 Supabase 获取的信息：
nano .env  # 或 vim .env 或 code .env

# 填入：
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGc...  (anon key)
SUPABASE_SERVICE_KEY=eyJhbGc...  (service_role key)

# 7. 启动后端
python -m app.main

# 或使用 uvicorn：
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

后端启动成功后，访问：
- API: http://localhost:8000
- 文档: http://localhost:8000/docs

## 第三步：前端设置

**打开新的终端窗口**

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖（首次需要，之后不用）
npm install

# 3. 配置环境变量
cp .env.example .env

# 4. 编辑 .env 文件
nano .env  # 或 vim .env 或 code .env

# 填入：
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...  (anon key，注意不是 service_role)
VITE_API_URL=http://localhost:8000

# 5. 启动前端
npm run dev
```

前端启动成功后，访问：http://localhost:3000

## 第四步：创建测试账号

### 方式 1：通过 UI 注册

1. 访问 http://localhost:3000
2. 点击 "Registrieren" 标签
3. 填写信息：
   - Name: `Test Worker`
   - Email: `worker@test.de`
   - Password: `password123`
   - Role: `Arbeiter`
4. 点击注册

**重要**: 目前需要到 Supabase Dashboard 确认邮箱：
- 进入 Supabase Dashboard
- 点击 "Authentication" → "Users"
- 找到新用户，点击 "..." → "Confirm User"

### 方式 2：直接在 Supabase 创建

1. 在 Supabase Dashboard，点击 "Authentication" → "Users"
2. 点击 "Add user" → "Create new user"
3. 填写：
   - Email: `worker@test.de`
   - Password: `password123`
   - Auto Confirm User: 打勾
4. 创建成功后，进入 "Table Editor" → "profiles"
5. 点击 "Insert" → "Insert row"
6. 填写：
   - id: 复制刚才创建的用户 ID
   - email: `worker@test.de`
   - full_name: `Test Worker`
   - role: `worker`

### 创建仓库账号

同样的方式创建：
- Email: `lager@test.de`
- Password: `password123`
- Role: `lager`

## 第五步：测试系统

### 工人端测试

1. 使用 `worker@test.de` 登录
2. 点击 "Neue Anfrage" 创建申请
3. 选择工地、添加材料
4. 提交申请
5. 在 "Meine Anfragen" 查看申请状态

### 仓库端测试

1. 登出，使用 `lager@test.de` 登录
2. 在 Dashboard 查看统计
3. 进入 "Alle Anfragen" 查看所有申请
4. 点击申请，更新状态（确认→准备→发货→完成）
5. 查看 "Lagerbestand" 和 "Statistiken"

## 常用命令

### 后端开发

```bash
# 启动后端（开发模式，自动重载）
uvicorn app.main:app --reload

# 查看 API 文档
open http://localhost:8000/docs

# 停止后端
Ctrl + C
```

### 前端开发

```bash
# 启动前端（开发模式）
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 停止前端
Ctrl + C
```

### 数据库管理

```bash
# 重置数据库（删除所有数据）
# 在 Supabase SQL Editor 中运行：
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

# 然后重新运行 schema.sql
```

## 故障排除

### 后端启动失败

```bash
# 检查 Python 版本（需要 3.11+）
python --version

# 检查虚拟环境是否激活
which python  # 应该显示 venv 路径

# 重新安装依赖
pip install -r requirements.txt --force-reinstall
```

### 前端启动失败

```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install

# 检查 Node 版本（需要 16+）
node --version
```

### 登录失败

1. 检查 Supabase 环境变量是否正确
2. 确认用户邮箱已验证
3. 检查浏览器控制台错误信息
4. 确认 Supabase Auth 服务正常

### 实时通知不工作

1. 确认 Supabase Realtime 已启用
2. 检查浏览器控制台是否有 WebSocket 错误
3. 在 Supabase Dashboard → Settings → API → Realtime 确认启用

## 下一步

系统已经可以正常运行！你可以：

1. **添加更多测试数据**：
   - 在 Supabase Table Editor 中添加更多工地、材料
   - 创建多个测试账号

2. **自定义界面**：
   - 修改 `frontend/src/index.css` 自定义颜色
   - 编辑 `tailwind.config.js` 自定义主题

3. **扩展功能**：
   - 添加图片上传功能
   - 集成真实的推送通知
   - 添加导出 PDF/Excel 功能

4. **部署到生产环境**：
   - 参考 README.md 的部署章节

## 需要帮助？

- 查看 README.md 获取详细文档
- 检查后端 API 文档：http://localhost:8000/docs
- 查看 Supabase 日志：Dashboard → Logs
- 查看浏览器控制台错误信息

祝你使用愉快！🎉
