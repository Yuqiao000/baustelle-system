# 工地物资申领系统 (Baustelle Material Management System)

一个完整的工地物资申领管理系统，支持工人申请材料/设备，仓库管理人员处理申请，并提供实时通知和统计报表功能。

## 功能特性

### 工人端 (Worker)
- ✅ 创建物资申请
  - 选择工地 (Baustelle)
  - 添加多个材料/设备 (Materialien/Maschinen)
  - 设置数量、备注、所需时间
  - 设置优先级
- ✅ 查看我的申请
  - 实时跟踪申请状态
  - 查看申请历史
  - 搜索和筛选功能
- ✅ 申请详情查看
  - 完整的物品清单
  - 状态变更历史
  - 工地信息

### 仓库端 (Lager)
- ✅ 仪表板
  - 实时统计数据
  - 待处理申请概览
  - 低库存警告
- ✅ 申请管理
  - 查看所有申请
  - 快速状态更新（确认→准备→发货→完成）
  - 按状态和优先级筛选
  - 搜索功能
- ✅ 库存管理
  - 查看所有材料和设备
  - 库存数量监控
  - 低库存警告
  - 按类型筛选
- ✅ 统计报表
  - 月度申请统计
  - 材料使用分析
  - 完成率追踪

### 通用功能
- ✅ 用户认证 (Supabase Auth)
- ✅ 角色权限管理 (Worker/Lager/Admin)
- ✅ 实时通知系统
- ✅ PWA 支持（可作为手机应用安装）
- ✅ 响应式设计（支持手机、平板、桌面）

## 技术栈

### 前端
- **React 18** - UI 框架
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **React Router** - 路由管理
- **Zustand** - 状态管理
- **Supabase JS Client** - 数据库和认证
- **Vite PWA Plugin** - PWA 支持
- **Lucide React** - 图标库

### 后端
- **Python 3.11+**
- **FastAPI** - REST API 框架
- **Supabase Python Client** - 数据库客户端
- **Uvicorn** - ASGI 服务器
- **Pydantic** - 数据验证

### 数据库
- **Supabase (PostgreSQL)** - 主数据库
- **Row Level Security (RLS)** - 数据权限控制
- **Realtime Subscriptions** - 实时数据更新

## 项目结构

```
baustelle-system/
├── database/
│   └── schema.sql              # 数据库表结构和初始化脚本
├── backend/
│   ├── app/
│   │   ├── routers/           # API 路由
│   │   │   ├── auth.py        # 认证相关
│   │   │   ├── baustellen.py  # 工地管理
│   │   │   ├── items.py       # 物品管理
│   │   │   ├── requests.py    # 申请管理
│   │   │   ├── notifications.py # 通知
│   │   │   └── statistics.py  # 统计
│   │   ├── config.py          # 配置
│   │   ├── database.py        # 数据库连接
│   │   ├── models.py          # 数据模型
│   │   └── main.py            # 应用入口
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx     # 页面布局
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── worker/        # 工人端页面
    │   │   │   ├── WorkerDashboard.jsx
    │   │   │   ├── CreateRequest.jsx
    │   │   │   ├── MyRequests.jsx
    │   │   │   └── RequestDetails.jsx
    │   │   └── lager/         # 仓库端页面
    │   │       ├── LagerDashboard.jsx
    │   │       ├── AllRequests.jsx
    │   │       ├── InventoryManagement.jsx
    │   │       └── Statistics.jsx
    │   ├── store/
    │   │   ├── authStore.js   # 认证状态
    │   │   └── notificationStore.js # 通知状态
    │   ├── lib/
    │   │   ├── supabase.js    # Supabase 客户端
    │   │   └── api.js         # API 客户端
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    └── .env.example
```

## 快速开始

### 1. 准备工作

#### 创建 Supabase 项目
1. 访问 [Supabase](https://supabase.com) 并创建新项目
2. 在 SQL Editor 中运行 `database/schema.sql` 初始化数据库
3. 获取项目 URL 和 API Keys（在 Settings > API）

### 2. 后端设置

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入 Supabase 配置

# 启动后端服务
python -m app.main
# 或使用 uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

后端 API 将运行在 http://localhost:8000
- API 文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/health

### 3. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入 Supabase 和 API 配置

# 启动开发服务器
npm run dev
```

前端应用将运行在 http://localhost:3000

### 4. 构建生产版本

```bash
# 前端构建
cd frontend
npm run build

# 预览生产构建
npm run preview
```

## 数据库架构

### 核心表

- **profiles** - 用户资料（角色、姓名、联系方式）
- **baustellen** - 工地信息
- **categories** - 物品分类
- **items** - 材料和设备
- **requests** - 申请单主表
- **request_items** - 申请单明细
- **request_history** - 状态变更历史
- **notifications** - 通知记录

### 状态流转

```
pending (待处理)
    ↓
confirmed (已确认)
    ↓
preparing (准备中)
    ↓
ready (已准备完成)
    ↓
shipped (已发货)
    ↓
completed (已完成)
```

也可以在任何阶段标记为 `cancelled` (已取消)

## API 端点

### 认证
- `POST /auth/register` - 注册新用户
- `POST /auth/login` - 登录
- `POST /auth/logout` - 登出
- `GET /auth/me` - 获取当前用户信息

### 工地
- `GET /baustellen/` - 获取工地列表
- `GET /baustellen/{id}` - 获取工地详情
- `POST /baustellen/` - 创建工地
- `PATCH /baustellen/{id}` - 更新工地

### 物品
- `GET /items/` - 获取物品列表
- `GET /items/{id}` - 获取物品详情
- `POST /items/` - 创建物品
- `PATCH /items/{id}` - 更新物品
- `GET /items/categories/` - 获取分类列表

### 申请
- `GET /requests/` - 获取申请列表
- `GET /requests/{id}` - 获取申请详情
- `POST /requests/` - 创建申请
- `PATCH /requests/{id}` - 更新申请状态
- `DELETE /requests/{id}` - 取消申请
- `GET /requests/{id}/history` - 获取状态历史

### 通知
- `GET /notifications/` - 获取通知列表
- `GET /notifications/unread-count` - 获取未读数量
- `PATCH /notifications/{id}/read` - 标记为已读
- `PATCH /notifications/mark-all-read` - 全部标记为已读

### 统计
- `GET /statistics/dashboard` - 仪表板统计
- `GET /statistics/monthly` - 月度统计
- `GET /statistics/material-usage` - 材料使用统计
- `GET /statistics/baustelle-stats` - 工地统计

## 权限系统

系统通过 Supabase Row Level Security (RLS) 实现权限控制：

- **Worker (工人)**
  - 可以创建申请
  - 只能查看自己的申请
  - 可以查看所有工地和物品

- **Lager (仓库)**
  - 可以查看所有申请
  - 可以更新申请状态
  - 可以管理物品和工地
  - 可以查看统计数据

- **Admin (管理员)**
  - 拥有所有权限
  - 可以管理用户

## 实时功能

系统使用 Supabase Realtime 实现实时更新：

1. **通知实时推送** - 当有新通知时自动更新
2. **申请状态更新** - 状态变化实时同步
3. **库存变化提醒** - 低库存实时警告

## PWA 功能

应用支持作为 PWA 安装到设备：

- ✅ 离线缓存
- ✅ 添加到主屏幕
- ✅ 推送通知（需配置）
- ✅ 后台同步

在手机浏览器中打开应用，可以选择"添加到主屏幕"进行安装。

## 环境变量

### 后端 (.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000
ENVIRONMENT=development
```

### 前端 (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000
```

## 开发建议

### 测试账号创建

在 Supabase Dashboard 或通过注册功能创建测试账号：

```javascript
// Worker 账号
{
  email: "worker@demo.de",
  password: "password123",
  role: "worker"
}

// Lager 账号
{
  email: "lager@demo.de",
  password: "password123",
  role: "lager"
}
```

### 数据库管理

使用 Supabase Dashboard 的 Table Editor 可以：
- 查看和编辑数据
- 添加测试数据
- 监控实时连接
- 查看 SQL 日志

## 部署

### 前端部署 (Vercel/Netlify)

```bash
cd frontend
npm run build
# 将 dist/ 目录部署到 Vercel 或 Netlify
```

### 后端部署 (Railway/Render/Docker)

使用 Docker:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

或直接部署到 Railway/Render：
- 连接 Git 仓库
- 设置环境变量
- 自动构建和部署

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 Supabase URL 和 Keys 是否正确
   - 确认网络可以访问 Supabase

2. **认证失败**
   - 检查 Supabase Auth 是否启用
   - 确认 Email 认证设置

3. **权限错误**
   - 检查 RLS 策略是否正确设置
   - 确认用户角色正确

4. **实时通知不工作**
   - 检查 Supabase Realtime 是否启用
   - 确认订阅设置正确

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请创建 Issue 或联系开发团队。

---

**开发状态**: ✅ 完成
**版本**: 1.0.0
**最后更新**: 2025-11-01
