# 本地 Docker 开发和测试指南

## 目的
在部署到 AWS Lightsail 之前，先在本地测试 Docker 环境，确保一切正常。

---

## 前提条件

✅ Docker Desktop 已安装并运行
✅ 前后端代码已完成
✅ Supabase 配置正确

---

## 快速开始（5 分钟）

### 1. 准备环境变量

在项目根目录创建 `.env` 文件：

```bash
# 在 Windows PowerShell 或 CMD
cd C:\Users\yhuan\baustelle-system

# 创建 .env 文件（复制下面内容）
```

创建 `.env` 文件内容：
```env
# Supabase 配置
SUPABASE_URL=https://euxerhrjoqawcplejpjj.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eGVyaHJqb3Fhd2NwbGVqcGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTcyNjYsImV4cCI6MjA3NzU3MzI2Nn0.s7SAGwOYbTY0hsI0qX_2onVM0D1UuGjxAwcBAsUisak
SUPABASE_SERVICE_KEY=你的_service_key_从supabase获取

# API 配置
VITE_API_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:3000,http://localhost:80

# 可选：AWS S3（如果要测试图片上传）
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=eu-central-1
S3_BUCKET_NAME=
CLOUDFRONT_DOMAIN=
```

### 2. 启动 Docker 服务

```bash
# 确保 Docker Desktop 正在运行

# 构建并启动所有服务
docker-compose up -d --build

# 查看日志
docker-compose logs -f
```

### 3. 验证服务

打开浏览器测试：

- **前端**：http://localhost
- **后端 API**：http://localhost:8000/docs
- **健康检查**：http://localhost:8000/health

---

## 常用命令

### 启动服务
```bash
# 启动所有服务（后台运行）
docker-compose up -d

# 启动并查看日志
docker-compose up

# 重新构建并启动
docker-compose up -d --build
```

### 查看状态
```bash
# 查看运行中的容器
docker-compose ps

# 查看日志（所有服务）
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f redis
```

### 停止和清理
```bash
# 停止所有服务
docker-compose down

# 停止并删除卷（清除数据）
docker-compose down -v

# 清理未使用的镜像
docker system prune -a
```

### 重启服务
```bash
# 重启所有
docker-compose restart

# 重启单个服务
docker-compose restart backend
```

### 进入容器调试
```bash
# 进入后端容器
docker-compose exec backend bash

# 进入 Redis
docker-compose exec redis redis-cli

# 查看容器内的文件
docker-compose exec backend ls -la /app
```

---

## 本地开发流程

### 场景 1：只修改后端代码

```bash
# 方式 A：重启后端容器
docker-compose restart backend

# 方式 B：重新构建后端
docker-compose up -d --build backend

# 查看日志确认
docker-compose logs -f backend
```

### 场景 2：只修改前端代码

```bash
# 前端需要重新构建
docker-compose up -d --build frontend

# 或者不用 Docker，直接开发模式
cd frontend
npm run dev
# 然后访问 http://localhost:3000
```

### 场景 3：修改了 requirements.txt 或 package.json

```bash
# 必须重新构建
docker-compose down
docker-compose up -d --build
```

---

## 调试技巧

### 1. 后端无法启动

```bash
# 查看详细错误
docker-compose logs backend

# 常见问题：
# - Supabase 配置错误
# - 端口 8000 被占用
# - Python 依赖安装失败

# 检查端口占用（Windows）
netstat -ano | findstr :8000
```

### 2. 前端无法访问后端

检查 CORS 配置：
- `.env` 中的 `CORS_ORIGINS` 包含前端地址
- 前端 `.env` 中的 `VITE_API_URL` 正确

### 3. Redis 连接失败

```bash
# 检查 Redis 是否运行
docker-compose ps redis

# 测试 Redis
docker-compose exec redis redis-cli ping
# 应该返回 PONG
```

### 4. 数据库连接问题

检查 Supabase 配置：
```bash
# 进入后端容器测试
docker-compose exec backend python

# 在 Python 中测试
>>> from app.lib.supabase import supabase
>>> supabase.table('profiles').select('*').limit(1).execute()
```

---

## 性能监控

### 查看资源使用

```bash
# 实时监控
docker stats

# 输出示例：
# CONTAINER ID   NAME           CPU %   MEM USAGE / LIMIT
# abc123         backend        5.2%    150MiB / 2GiB
# def456         frontend       0.1%    50MiB / 2GiB
# ghi789         redis          0.5%    20MiB / 256MiB
```

### 查看磁盘使用

```bash
# Docker 使用的总空间
docker system df

# 详细信息
docker system df -v
```

---

## 本地测试清单

在部署到 Lightsail 之前，确保以下都测试通过：

### 基础功能
- [ ] 前端页面可以访问
- [ ] 可以登录/注册
- [ ] API 文档可以访问（/docs）
- [ ] 健康检查正常（/health）

### 核心功能
- [ ] 创建物资申请
- [ ] 查看申请列表
- [ ] 更新申请状态
- [ ] 上传图片（如果配置了 S3）
- [ ] 扫描二维码

### 性能测试
- [ ] 并发访问（打开多个浏览器标签）
- [ ] 图片上传速度
- [ ] API 响应时间
- [ ] Redis 缓存是否工作

### 安全测试
- [ ] 未登录无法访问保护页面
- [ ] 不同角色权限隔离
- [ ] CORS 配置正确

---

## 常见问题

### Q: Docker 容器启动慢
**A**: 首次构建需要下载镜像，耐心等待。后续启动会快很多。

### Q: 端口冲突
**A**: 如果你已经在运行 `npm run dev`，停止它再启动 Docker。
```bash
# 或修改 docker-compose.yml 中的端口
ports:
  - "3001:80"  # 改用 3001 端口
```

### Q: 修改代码不生效
**A**: Docker 中的代码需要重新构建：
```bash
docker-compose up -d --build
```

### Q: 想同时用 Docker 和本地开发
**A**: 可以！只启动需要的服务：
```bash
# 只启动后端和 Redis
docker-compose up -d backend redis

# 前端用本地开发模式
cd frontend
npm run dev
```

---

## Docker vs 本地开发对比

| 方式 | 优点 | 缺点 | 适合场景 |
|------|------|------|----------|
| **Docker** | ✅ 环境一致<br>✅ 一键启动<br>✅ 接近生产环境 | ❌ 构建慢<br>❌ 调试不便 | 测试、部署前验证 |
| **本地开发** | ✅ 热重载快<br>✅ 调试方便<br>✅ 改代码立即生效 | ❌ 环境配置麻烦<br>❌ 可能环境不一致 | 日常开发 |

### 推荐工作流程

```bash
# 日常开发：使用本地模式
终端 1: cd backend && source venv/bin/activate && uvicorn app.main:app --reload
终端 2: cd frontend && npm run dev

# 测试部署：使用 Docker
docker-compose up -d --build
# 测试完整流程

# 准备上线：在 Lightsail 部署
# 参考 LIGHTSAIL_DEPLOYMENT.md
```

---

## 准备部署到 Lightsail

当本地 Docker 测试都通过后：

1. **确保 .env 文件不提交到 Git**
   ```bash
   # 检查 .gitignore 包含：
   .env
   .env.*
   !.env.example
   ```

2. **提交代码到 Git**
   ```bash
   git add .
   git commit -m "Add Docker support for production deployment"
   git push
   ```

3. **按照 LIGHTSAIL_DEPLOYMENT.md 部署**

---

## 下一步

✅ 本地 Docker 测试通过后：
1. [ ] 提交代码到 GitHub
2. [ ] 创建 Lightsail 实例
3. [ ] 按照部署指南上线
4. [ ] 配置域名和 SSL

需要帮助随时问我！
