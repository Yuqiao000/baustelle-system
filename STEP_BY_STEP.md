# 一步一步设置指南

按照这个指南，你可以在 15 分钟内完成整个系统的设置。

## 前置准备

在开始之前，确保你已经有：

- ✅ macOS 系统
- ✅ 网络连接
- ✅ 文本编辑器（推荐 VS Code）

## 第一部分：Supabase 设置（5 分钟）

### 步骤 1：创建 Supabase 账号

1. 打开浏览器，访问：https://supabase.com
2. 点击右上角 **"Start your project"**
3. 选择用 **GitHub** 登录（最快）
4. 授权登录

### 步骤 2：创建项目

1. 点击 **"New Project"**
2. 如果是首次使用，先创建 Organization：
   - Organization name: 随便填（例如：`my-org`）
   - 点击 **"Create organization"**
3. 填写项目信息：
   ```
   Project Name: baustelle-system
   Database Password: ********（设置一个密码，记住它！）
   Region: Europe (Frankfurt)  # 或离你最近的
   ```
4. 点击 **"Create new project"**
5. 等待 1-2 分钟（会显示进度条）

### 步骤 3：初始化数据库

1. 在左侧菜单找到 **"SQL Editor"** 图标（`</>`）
2. 点击 **"New query"**
3. 打开你电脑上的文件：
   ```
   /Users/yuqiao/baustelle-system/database/schema.sql
   ```
4. 复制全部内容（Cmd+A，Cmd+C）
5. 粘贴到 Supabase SQL Editor
6. 点击 **"Run"** 按钮（或按 Cmd+Enter）
7. 等待几秒，看到 "Success" 消息

### 步骤 4：获取 API 密钥

1. 点击左下角 **"Settings"** (⚙️ 图标)
2. 选择 **"API"**
3. 你会看到三个重要信息，**复制并保存它们**：

   **① Project URL**（在页面顶部）
   ```
   https://xxxxxxxxxxxxxxx.supabase.co
   ```

   **② anon public**（在 Project API keys 部分）
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
   ```

   **③ service_role**（在 Project API keys 部分，需要点击"Reveal"）
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
   ```

   💡 **建议**：把这三个信息临时保存在记事本里，待会要用

### 步骤 5：启用实时功能

1. 还是在 **Settings > API** 页面
2. 向下滚动找到 **"Realtime"** 部分
3. 确保 **"Enable Realtime"** 是开启状态（绿色）

### 步骤 6：配置认证

1. 进入 **Settings > Authentication**
2. 找到 **"Email Auth"**
3. 确保 **"Enable Email Signup"** 已启用
4. **在开发阶段**，建议：
   - 关闭 **"Confirm email"**（方便测试）
   - 关闭 **"Secure email change"**

✅ Supabase 设置完成！

---

## 第二部分：后端设置（3 分钟）

### 步骤 1：打开终端

1. 打开 macOS 的 **"终端"** 应用
2. 进入项目目录：
   ```bash
   cd /Users/yuqiao/baustelle-system/backend
   ```

### 步骤 2：运行自动设置脚本

```bash
# 给脚本执行权限
chmod +x setup.sh

# 运行设置脚本
./setup.sh
```

这个脚本会：
- ✅ 检查 Python 版本
- ✅ 创建虚拟环境
- ✅ 安装所有依赖
- ✅ 创建 .env 文件

### 步骤 3：配置环境变量

脚本运行后会提示你配置 `.env` 文件。

**方式 1：使用 VS Code**
```bash
code .env
```

**方式 2：使用 nano**
```bash
nano .env
```

**填入你刚才保存的 Supabase 信息：**

```env
# 从 Supabase 复制的信息
SUPABASE_URL=https://xxxxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（anon public key）
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（service_role key）

# 这些保持不变
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
ENVIRONMENT=development
```

**保存文件：**
- VS Code: Cmd+S
- nano: Ctrl+O，Enter，然后 Ctrl+X

### 步骤 4：测试连接

```bash
# 激活虚拟环境
source venv/bin/activate

# 测试 Supabase 连接
python3 -c "
from app.database import get_supabase
try:
    supabase = get_supabase()
    print('✅ Supabase 连接成功!')
except Exception as e:
    print(f'❌ 连接失败: {e}')
"
```

如果看到 **"✅ Supabase 连接成功!"**，说明配置正确！

### 步骤 5：启动后端

```bash
# 确保虚拟环境已激活（命令行前面会有 (venv)）
# 如果没有，运行：source venv/bin/activate

# 启动后端服务
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

你应该看到：
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**测试后端是否正常：**
- 打开浏览器访问：http://localhost:8000
- 应该看到：`{"message":"Baustelle Material Management System API",...}`
- 访问 API 文档：http://localhost:8000/docs

✅ 后端启动成功！**保持这个终端窗口打开**

---

## 第三部分：前端设置（3 分钟）

### 步骤 1：打开新的终端窗口

按 **Cmd+T** 打开新的终端标签页，或者打开新的终端窗口

### 步骤 2：进入前端目录

```bash
cd /Users/yuqiao/baustelle-system/frontend
```

### 步骤 3：运行自动设置脚本

```bash
# 给脚本执行权限
chmod +x setup.sh

# 运行设置脚本
./setup.sh
```

这个脚本会：
- ✅ 检查 Node.js 版本
- ✅ 安装所有依赖
- ✅ 创建 .env 文件

### 步骤 4：配置环境变量

**打开 .env 文件：**

```bash
code .env
# 或
nano .env
```

**填入配置：**

```env
# 从 Supabase 复制（注意：只用 anon key，不是 service_role）
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（anon public key）

# 后端地址（保持不变）
VITE_API_URL=http://localhost:8000
```

**保存文件**

### 步骤 5：启动前端

```bash
npm run dev
```

你应该看到：
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

✅ 前端启动成功！

---

## 第四部分：使用系统（2 分钟）

### 步骤 1：访问应用

打开浏览器，访问：http://localhost:3000

你应该看到登录页面！

### 步骤 2：创建测试账号

**方式 1：通过 UI 注册**

1. 点击 **"Registrieren"** 标签
2. 填写信息：
   ```
   Name: Test Worker
   E-Mail: worker@test.de
   Password: password123
   Role: Arbeiter (工人)
   ```
3. 点击 **"Registrieren"**

**⚠️ 重要：**因为我们关闭了邮箱验证，账号会自动激活。如果你之前没关闭，需要去 Supabase 手动确认：

1. 打开 Supabase Dashboard
2. 进入 **Authentication > Users**
3. 找到刚注册的用户
4. 点击 **"..."** > **"Confirm User"**

**方式 2：直接在 Supabase 创建（更快）**

1. 在 Supabase Dashboard，进入 **Authentication > Users**
2. 点击 **"Add user"** > **"Create new user"**
3. 填写：
   - Email: `worker@test.de`
   - Password: `password123`
   - Auto Confirm User: ✅ 打勾
4. 点击 **"Create user"**，复制生成的用户 ID
5. 进入 **Table Editor > profiles**
6. 点击 **"Insert row"**
7. 填写：
   - id: 粘贴刚才复制的用户 ID
   - email: `worker@test.de`
   - full_name: `Test Worker`
   - role: `worker`
8. 点击 **"Save"**

### 步骤 3：登录并测试

1. 回到应用登录页面
2. 输入：
   ```
   E-Mail: worker@test.de
   Password: password123
   ```
3. 点击 **"Anmelden"** 登录

你应该看到工人端的 Dashboard！

### 步骤 4：创建第一个申请

1. 点击 **"Neue Anfrage"** 或右上角的 **"+ Neue Anfrage"**
2. 填写：
   - Baustelle: 选择一个工地
   - Priorität: Normal
   - 在下方添加物品：
     - Material/Maschine: 选择一个（例如 Zement）
     - Menge: 10
     - 点击 **"+"** 添加
3. 点击 **"Anfrage erstellen"**

成功！你应该看到确认消息。

### 步骤 5：测试仓库端

创建一个仓库账号来测试完整流程：

1. 登出（点击右上角的退出图标）
2. 注册新账号：
   ```
   Name: Test Lager
   E-Mail: lager@test.de
   Password: password123
   Role: Lager (仓库)
   ```
3. 登录后，你会看到仓库端的界面
4. 可以查看所有申请、更新状态、管理库存等

🎉 **恭喜！系统已经完全运行了！**

---

## 常见问题

### ❓ 后端启动失败

**错误：`ModuleNotFoundError: No module named 'xxx'`**

解决：
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**错误：`连接 Supabase 失败`**

解决：
1. 检查 `.env` 文件中的 URL 和 Key 是否正确
2. 确保 Supabase 项目正常运行
3. 检查网络连接

### ❓ 前端启动失败

**错误：`command not found: npm`**

解决：
1. 安装 Node.js：https://nodejs.org
2. 推荐安装 LTS 版本

**错误：`Cannot find module`**

解决：
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### ❓ 登录失败

**提示：Invalid credentials**

解决：
1. 确认邮箱和密码正确
2. 在 Supabase Dashboard > Authentication > Users 确认用户已创建
3. 确认用户已被 Confirm（Auto Confirm User 打勾）

### ❓ 看不到数据

**申请列表是空的**

解决：
1. 确认数据库初始化成功（检查 Supabase Table Editor）
2. 确认用户角色正确（profiles 表中的 role 字段）
3. 检查浏览器控制台是否有错误（F12）

---

## 快速命令参考

### 启动系统

**终端 1（后端）：**
```bash
cd /Users/yuqiao/baustelle-system/backend
source venv/bin/activate
uvicorn app.main:app --reload
```

**终端 2（前端）：**
```bash
cd /Users/yuqiao/baustelle-system/frontend
npm run dev
```

### 停止系统

在两个终端中按 **Ctrl+C**

### 查看日志

- 后端日志：在后端终端中显示
- 前端日志：在前端终端中显示
- 浏览器日志：按 F12 打开开发者工具
- Supabase 日志：Dashboard > Logs

---

## 下一步

系统运行后，你可以：

1. **探索功能**：
   - 工人端：创建申请、查看状态
   - 仓库端：管理申请、查看统计

2. **自定义数据**：
   - 在 Supabase Table Editor 中添加更多工地、材料

3. **学习代码**：
   - 后端：查看 `backend/app/routers/` 了解 API
   - 前端：查看 `frontend/src/pages/` 了解界面

4. **扩展功能**：
   - 参考 README.md 的扩展建议

祝你使用愉快！🚀
