# Supabase 详细设置指南

## 第一步：创建 Supabase 账号和项目

### 1. 注册 Supabase 账号

1. 访问 https://supabase.com
2. 点击右上角的 **"Start your project"** 或 **"Sign in"**
3. 选择登录方式：
   - **GitHub** (推荐，最快)
   - **Google**
   - **Email**
4. 完成登录授权

### 2. 创建新项目

登录后会进入 Dashboard：

1. 点击 **"New Project"** 按钮（绿色大按钮）

2. 如果是首次使用，需要先创建一个 Organization：
   - Organization name: 输入你的组织名称（例如：`my-company`）
   - 点击 **"Create organization"**

3. 填写项目信息：
   ```
   Project Name: baustelle-system
   Database Password: 输入一个强密码（务必保存好这个密码！）
   Region: 选择离你最近的区域
   - Europe (Frankfurt) - 如果在欧洲
   - US East (Ohio) - 如果在美国东部
   - Southeast Asia (Singapore) - 如果在亚洲

   Pricing Plan: Free (免费版足够使用)
   ```

4. 点击 **"Create new project"**

5. 等待项目创建（通常需要 1-2 分钟）
   - 你会看到一个进度条
   - 完成后会自动进入项目页面

## 第二步：运行数据库初始化脚本

### 方法 1：通过 SQL Editor（推荐）

1. **打开 SQL Editor**
   - 在左侧菜单栏找到 **"SQL Editor"** 图标（看起来像 `</>`）
   - 点击进入

2. **创建新查询**
   - 点击 **"New query"** 按钮

3. **复制并粘贴 SQL 脚本**
   - 打开本地文件 `/Users/yuqiao/baustelle-system/database/schema.sql`
   - 全选并复制所有内容（Cmd+A，然后 Cmd+C）
   - 粘贴到 Supabase SQL Editor 中

4. **运行脚本**
   - 点击右下角的 **"Run"** 按钮（或按 Cmd+Enter）
   - 等待执行完成（通常需要几秒钟）
   - 如果成功，会显示 "Success. No rows returned"

5. **验证表是否创建成功**
   - 点击左侧菜单的 **"Table Editor"**
   - 你应该看到以下表：
     - profiles
     - baustellen
     - categories
     - items
     - requests
     - request_items
     - request_history
     - notifications

### 方法 2：使用命令行（可选）

如果你熟悉命令行：

```bash
# 1. 安装 Supabase CLI
npm install -g supabase

# 2. 登录
supabase login

# 3. 关联项目
supabase link --project-ref YOUR_PROJECT_REF

# 4. 运行迁移
supabase db push --file database/schema.sql
```

## 第三步：获取 API 密钥

### 1. 进入 API 设置页面

1. 点击左下角的 **"Settings"** (齿轮图标)
2. 在左侧菜单中选择 **"API"**

### 2. 复制必要的信息

你会看到以下信息：

#### **Project URL**
```
https://xxxxxxxxxxxxx.supabase.co
```
- 这是你的 Supabase 项目 URL
- 复制这个 URL（点击右侧的复制图标）

#### **API Keys**

你会看到两个密钥：

**1. anon public (公开密钥)**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...
```
- 这是前端使用的密钥
- 可以安全地暴露在客户端代码中
- 复制这个密钥

**2. service_role (服务密钥)**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...
```
- 这是后端使用的密钥
- **务必保密！不要提交到 Git！**
- 复制这个密钥

## 第四步：配置项目环境变量

### 1. 配置后端

```bash
cd /Users/yuqiao/baustelle-system/backend

# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
nano .env  # 或使用你喜欢的编辑器
```

填入以下内容：

```env
# 从 Supabase Settings > API 获取
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGc...（你的 anon public key）
SUPABASE_SERVICE_KEY=eyJhbGc...（你的 service_role key）

# API 配置
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# 环境
ENVIRONMENT=development
```

**保存文件**（Ctrl+O，然后 Enter，然后 Ctrl+X）

### 2. 配置前端

```bash
cd /Users/yuqiao/baustelle-system/frontend

# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
nano .env
```

填入以下内容：

```env
# 从 Supabase Settings > API 获取
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...（你的 anon public key，注意不是 service_role）

# API 地址
VITE_API_URL=http://localhost:8000
```

**保存文件**

## 第五步：启用必要的 Supabase 功能

### 1. 启用 Email Auth（如果需要）

1. 进入 **Settings** > **Authentication**
2. 找到 **Email Auth** 部分
3. 确保 **Enable Email Signup** 已启用
4. 在开发阶段，建议关闭 **Confirm Email**（方便测试）

### 2. 启用 Realtime（实时通知功能）

1. 进入 **Settings** > **API**
2. 向下滚动找到 **Realtime** 部分
3. 确保 Realtime 已启用
4. 在 **Realtime Settings** 中：
   - Enable Database Webhooks: 打开
   - Enable Postgres Changes: 打开

### 3. 配置 CORS（如果需要）

如果遇到跨域问题：

1. 进入 **Settings** > **API**
2. 找到 **CORS Settings**
3. 添加允许的域名：
   - `http://localhost:3000`
   - `http://localhost:5173`
   - 你的生产域名（如果有）

## 第六步：验证设置

### 1. 检查数据库

1. 进入 **Table Editor**
2. 查看各个表是否有初始数据：
   - `categories` 表应该有 5 条记录
   - `items` 表应该有 7 条记录
   - `baustellen` 表应该有 3 条记录

### 2. 测试 API 连接

在终端运行：

```bash
# 测试后端连接
cd /Users/yuqiao/baustelle-system/backend
python -c "
from app.database import get_supabase
try:
    supabase = get_supabase()
    print('✅ Supabase 连接成功!')
except Exception as e:
    print(f'❌ 连接失败: {e}')
"
```

## 常见问题解决

### 问题 1：找不到 SQL Editor

**解决方案**：
- 确保你已经在项目内部（不是 Organization 页面）
- 左侧菜单栏应该显示：Home, Table Editor, SQL Editor 等
- 如果看不到，点击左上角的项目名称切换到正确的项目

### 问题 2：运行 SQL 脚本报错

**常见错误**：
```
ERROR: extension "uuid-ossp" does not exist
```

**解决方案**：
1. 在 SQL Editor 中先运行：
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```
2. 然后再运行完整的 schema.sql

### 问题 3：API 密钥找不到

**解决方案**：
- 确保进入了 **Settings** > **API**（不是 Authentication）
- 密钥在页面中间的 "Project API keys" 部分
- 如果还是看不到，尝试刷新页面

### 问题 4：Authentication 报错

**解决方案**：
1. 进入 **Settings** > **Authentication**
2. 确保 **Enable Email Signup** 已启用
3. 在开发阶段关闭 **Confirm email** 和 **Secure email change**

### 问题 5：Realtime 不工作

**解决方案**：
1. 进入 **Settings** > **API**
2. 确保 Realtime 已启用
3. 检查是否在免费套餐限制内（免费版有并发连接限制）

## 完整的配置检查清单

在开始开发前，确认以下所有项：

- [ ] Supabase 项目已创建
- [ ] schema.sql 已成功运行
- [ ] 在 Table Editor 中可以看到所有表
- [ ] 已复制 Project URL
- [ ] 已复制 anon public key
- [ ] 已复制 service_role key
- [ ] backend/.env 已正确配置
- [ ] frontend/.env 已正确配置
- [ ] Email Auth 已启用
- [ ] Realtime 已启用
- [ ] 数据库中有初始数据

## 下一步

配置完成后，你可以：

1. **启动后端**：
   ```bash
   cd backend
   source venv/bin/activate  # 激活虚拟环境
   uvicorn app.main:app --reload
   ```

2. **启动前端**：
   ```bash
   cd frontend
   npm run dev
   ```

3. **访问应用**：
   - 前端：http://localhost:3000
   - API 文档：http://localhost:8000/docs

## 有用的 Supabase 功能

### 1. SQL Editor 模板

Supabase 提供了很多有用的 SQL 模板：
- 点击 SQL Editor 中的 "Templates"
- 可以找到常用的查询示例

### 2. Logs 查看

如果遇到问题：
- 点击 **Logs**
- 可以查看 API、Database、Realtime 等日志
- 帮助调试问题

### 3. Database Webhooks

可以设置数据库触发器：
- 点击 **Database** > **Webhooks**
- 当数据变化时自动调用外部 API

### 4. Edge Functions（可选）

如果需要服务端逻辑：
- 点击 **Edge Functions**
- 可以部署 TypeScript/JavaScript 函数
- 类似 AWS Lambda

## 视频教程（可选）

如果你更喜欢看视频，Supabase 官方有很好的教程：
- YouTube: https://www.youtube.com/c/Supabase
- 官方文档: https://supabase.com/docs

## 需要帮助？

如果遇到问题：
1. 查看 Supabase 官方文档：https://supabase.com/docs
2. Supabase Discord 社区：https://discord.supabase.com
3. 检查本项目的 README.md

祝你设置顺利！🚀
