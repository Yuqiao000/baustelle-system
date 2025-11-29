# Baustelle System - 新电脑设置指南

## 第一步：安装必要软件

### 1. 安装 Git
- **Mac**: 打开终端，输入 `git --version`，如果没有会自动提示安装
- **Windows**: 下载 https://git-scm.com/download/win

### 2. 安装 Node.js
- 访问 https://nodejs.org/
- 下载并安装 LTS 版本（推荐 v18 或更高）
- 安装完成后，打开终端验证：
  ```bash
  node --version
  npm --version
  ```

### 3. 安装 Python
- **Mac**: 打开终端
  ```bash
  python3 --version
  ```
  如果没有，访问 https://www.python.org/downloads/

- **Windows**: 访问 https://www.python.org/downloads/
  - 下载 Python 3.9 或更高版本
  - ⚠️ 安装时勾选 "Add Python to PATH"

### 4. 安装 VSCode
- 访问 https://code.visualstudio.com/
- 下载并安装
- 安装 Claude Code 扩展

---

## 第二步：克隆项目

### 1. 打开终端（Mac）或 Git Bash（Windows）

### 2. 选择项目存放位置
```bash
# Mac 示例
cd ~/Documents

# Windows 示例
cd C:/Users/你的用户名/Documents
```

### 3. 克隆仓库
```bash
git clone https://github.com/Yuqiao000/baustelle-system.git
cd baustelle-system
```

### 4. 在 VSCode 中打开项目
```bash
code .
```

---

## 第三步：设置后端

### 1. 打开终端，进入 backend 目录
```bash
cd backend
```

### 2. 创建 Python 虚拟环境

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

看到 `(venv)` 出现在命令行前面就说明成功了！

### 3. 安装 Python 依赖
```bash
pip install -r requirements.txt
```

这会安装：
- FastAPI（后端框架）
- Uvicorn（服务器）
- Supabase（数据库客户端）
- 其他必要的库

### 4. 创建 .env 文件

**重要！** 这个文件包含数据库连接信息

在 `backend` 文件夹中创建一个名为 `.env` 的文件：

**Mac/Linux:**
```bash
touch .env
```

**Windows:**
```bash
type nul > .env
```

然后用 VSCode 打开这个文件，复制粘贴以下内容：

```env
# Supabase Configuration
SUPABASE_URL=https://euxerhrjoqawcplejpjj.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eGVyaHJqb3Fhd2NwbGVqcGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTcyNjYsImV4cCI6MjA3NzU3MzI2Nn0.s7SAGwOYbTY0hsI0qX_2onVM0D1UuGjxAwcBAsUisak
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eGVyaHJqb3Fhd2NwbGVqcGpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTk5NzI2NiwiZXhwIjoyMDc3NTczMjY2fQ.LTMkdQaQlsnFukd51KgbjjUcoqreRuhK2fS2UO2lNVo

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Environment
ENVIRONMENT=development
```

保存文件。

### 5. 测试后端启动

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

如果看到：
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

说明成功了！

打开浏览器访问 http://localhost:8000/docs 应该能看到 API 文档。

**测试完成后按 Ctrl+C 停止服务器**

---

## 第四步：设置前端

### 1. 打开新的终端窗口，进入 frontend 目录
```bash
cd frontend
```

### 2. 安装 Node.js 依赖
```bash
npm install
```

这会安装：
- React（前端框架）
- Vite（构建工具）
- TailwindCSS（样式）
- 其他必要的库

等待安装完成（可能需要几分钟）。

### 3. 创建 .env 文件

在 `frontend` 文件夹中创建 `.env` 文件：

**Mac/Linux:**
```bash
echo "VITE_API_URL=http://localhost:8000" > .env
```

**Windows:**
```bash
echo VITE_API_URL=http://localhost:8000 > .env
```

### 4. 测试前端启动

```bash
npm run dev
```

如果看到：
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

说明成功了！

打开浏览器访问 http://localhost:3000

**测试完成后按 Ctrl+C 停止服务器**

---

## 第五步：同时运行前后端（正常开发）

你需要打开 **两个终端窗口**：

### 终端 1 - 后端
```bash
cd backend
source venv/bin/activate        # Mac/Linux
# 或
venv\Scripts\activate           # Windows

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 终端 2 - 前端
```bash
cd frontend
npm run dev
```

现在你的应用就运行起来了！

- 前端：http://localhost:3000
- 后端 API：http://localhost:8000
- API 文档：http://localhost:8000/docs

---

## 第六步：使用 Claude Code

### 1. 在 VSCode 中打开项目
```bash
code /path/to/baustelle-system
```

### 2. 打开 Claude Code
- 按 `Cmd+Shift+P`（Mac）或 `Ctrl+Shift+P`（Windows）
- 输入 "Claude Code: Open Chat"
- 回车

### 3. 开始提问！
例如：
- "帮我添加一个新功能"
- "这段代码有什么问题"
- "如何优化这个页面"

---

## 常见问题解决

### Python 虚拟环境激活失败

**Mac/Linux:**
```bash
chmod +x venv/bin/activate
source venv/bin/activate
```

**Windows PowerShell:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
venv\Scripts\activate
```

### npm install 失败

1. 清除缓存：
```bash
npm cache clean --force
```

2. 删除 node_modules 重新安装：
```bash
rm -rf node_modules
npm install
```

### 端口被占用

**查找占用端口的进程：**

Mac/Linux:
```bash
lsof -ti:8000  # 后端
lsof -ti:3000  # 前端
```

Windows:
```bash
netstat -ano | findstr :8000
netstat -ano | findstr :3000
```

**杀死进程：**
```bash
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

---

## 日常开发流程

### 1. 开始工作
```bash
# 拉取最新代码
git pull origin main

# 启动后端（终端1）
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 启动前端（终端2）
cd frontend
npm run dev
```

### 2. 开发中
- 修改代码
- 浏览器会自动刷新
- 向 Claude Code 提问

### 3. 完成工作
```bash
# 查看改动
git status

# 添加改动
git add .

# 提交
git commit -m "描述你做了什么"

# 推送到 GitHub
git push origin main
```

---

## 项目结构

```
baustelle-system/
├── backend/              # Python FastAPI 后端
│   ├── app/
│   │   ├── main.py      # 主应用
│   │   ├── routers/     # API 路由
│   │   ├── models.py    # 数据模型
│   │   └── database.py  # 数据库连接
│   ├── venv/            # Python 虚拟环境（不提交）
│   ├── .env             # 环境变量（不提交）
│   └── requirements.txt # Python 依赖
│
├── frontend/            # React + Vite 前端
│   ├── src/
│   │   ├── pages/       # 页面组件
│   │   ├── components/  # 可复用组件
│   │   ├── lib/         # 工具库
│   │   └── App.jsx      # 主应用
│   ├── node_modules/    # Node 依赖（不提交）
│   ├── .env             # 环境变量（不提交）
│   └── package.json     # Node 依赖配置
│
└── SETUP.md            # 本文档
```

---

## 获取帮助

- GitHub 仓库：https://github.com/Yuqiao000/baustelle-system
- Claude Code 文档：https://docs.claude.com/claude-code
- 遇到问题直接问 Claude Code！

祝开发顺利！🎉
