# 开发工作流程指南

## 🎯 你现在的情况

✅ 本地开发环境已配置好
✅ 前端：`npm run dev`
✅ 后端：`uvicorn --reload`
✅ 功能还在开发中

---

## 📋 推荐的工作流程

```
阶段 1: 本地开发 (现在) 👈 你在这里
   ↓
   继续用 npm run dev 和 uvicorn 开发
   改代码立即生效，调试方便

阶段 2: 功能测试 (开发完成后)
   ↓
   完整测试所有功能
   修复 bug

阶段 3: Docker 测试 (功能稳定后)
   ↓
   用 docker-compose 测试
   确保部署环境没问题

阶段 4: 部署上线 (测试通过后)
   ↓
   部署到 AWS Lightsail
```

---

## 阶段 1：本地开发（现在）

### 启动开发服务器

```bash
# 终端 1 - 后端
cd backend
venv\Scripts\activate          # Windows
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 终端 2 - 前端
cd frontend
npm run dev
```

### 开发时的工作方式

**修改后端代码**：
- 保存文件 → 自动重启 → 立即生效 ✅
- 查看终端输出确认

**修改前端代码**：
- 保存文件 → 自动刷新 → 立即看到效果 ✅
- 浏览器自动刷新

**安装新的依赖**：
```bash
# 后端
pip install 包名
pip freeze > requirements.txt  # 更新依赖列表

# 前端
npm install 包名  # 自动更新 package.json
```

### 专注开发，暂时忽略

- ❌ 不需要管 Docker
- ❌ 不需要管部署
- ❌ 不需要管生产环境

**只管写代码！** 💻

---

## 阶段 2：功能开发完成检查

当你觉得主要功能都开发完了，用这个清单测试：

### 核心功能测试

#### 🔐 认证功能
- [ ] 注册新账号
- [ ] 登录
- [ ] 退出
- [ ] 不同角色看到不同页面

#### 👷 工人功能
- [ ] 创建物资申请
- [ ] 查看我的申请
- [ ] 查看申请详情

#### 📦 仓库功能
- [ ] 查看所有申请
- [ ] 审批申请
- [ ] 管理库存
- [ ] 扫描二维码

#### 🛒 采购功能
- [ ] 查看需求
- [ ] 管理供应商

### Bug 修复

把测试中发现的问题都修复，然后重新测试。

---

## 阶段 3：Docker 本地测试

### 为什么要用 Docker 测试？

✅ 模拟生产环境
✅ 发现部署问题
✅ 确保在服务器上也能运行

### 准备工作

1. **确认文件存在**：
   - ✅ `backend/Dockerfile`（已创建）
   - ✅ `docker-compose.yml`（已创建）
   - 需要检查 `frontend/Dockerfile`

2. **创建 .env 文件**（项目根目录）：
```env
SUPABASE_URL=https://euxerhrjoqawcplejpjj.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eGVyaHJqb3Fhd2NwbGVqcGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTcyNjYsImV4cCI6MjA3NzU3MzI2Nn0.s7SAGwOYbTY0hsI0qX_2onVM0D1UuGjxAwcBAsUisak
SUPABASE_SERVICE_KEY=你的service_key
VITE_API_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:3000,http://localhost:80
```

### 开始 Docker 测试

```bash
# 1. 停止本地开发服务器
# 两个终端都按 Ctrl+C

# 2. 启动 Docker
docker-compose up -d --build

# 3. 查看日志（确认没有错误）
docker-compose logs -f

# 4. 测试访问
浏览器打开：
- http://localhost (前端)
- http://localhost:8000/docs (后端 API)
```

### Docker 测试清单

- [ ] 所有容器正常启动
- [ ] 前端可以访问
- [ ] 后端 API 可以访问
- [ ] 重新测试所有功能（和本地测试一样）
- [ ] 性能正常

### 遇到问题怎么办？

```bash
# 查看错误日志
docker-compose logs backend
docker-compose logs frontend

# 停止服务
docker-compose down

# 修改代码后重新构建
docker-compose up -d --build
```

---

## 阶段 4：部署到 Lightsail

Docker 测试通过后，就可以部署了！

### 部署步骤

详细步骤看：[LIGHTSAIL_DEPLOYMENT.md](./LIGHTSAIL_DEPLOYMENT.md)

简要流程：
1. 创建 Lightsail 实例
2. 安装 Docker
3. 上传代码
4. 配置环境变量
5. 启动服务
6. 配置域名和 SSL

**预计时间**：半天到一天

---

## 🔄 日常开发循环

### 开发新功能

```bash
# 1. 启动开发服务器（如果还没启动）
终端1: cd backend && venv\Scripts\activate && uvicorn app.main:app --reload
终端2: cd frontend && npm run dev

# 2. 写代码
修改文件 → 保存 → 自动生效

# 3. 测试
在浏览器测试功能

# 4. 修复 bug
继续修改 → 保存 → 测试

# 5. 满意后提交代码
git add .
git commit -m "Add new feature"
git push
```

### 遇到问题

**后端报错**：
- 看终端 1 的错误信息
- 修改代码
- 自动重启，重新测试

**前端报错**：
- 按 F12 看浏览器控制台
- 修改代码
- 自动刷新

**数据库问题**：
- 检查 Supabase 配置
- 查看 Supabase 控制台

---

## 📊 进度追踪

### 当前状态：阶段 1 - 本地开发 ✅

你现在应该做：
- ✅ 用 `npm run dev` 和 `uvicorn --reload` 开发
- ✅ 专注写代码和实现功能
- ❌ 暂时不需要管 Docker 和部署

### 下一步行动：

1. **继续开发功能**（估计 1-2 周）
2. **完成后完整测试**（2-3 天）
3. **Docker 本地测试**（1 天）
4. **部署到 Lightsail**（半天）

---

## 🆘 需要帮助？

### 开发中遇到问题
- 后端问题：查看后端终端错误
- 前端问题：查看浏览器控制台
- 数据库问题：检查 Supabase 配置
- 其他问题：随时问我

### Docker 测试问题
- 查看 [LOCAL_DOCKER_SETUP.md](./LOCAL_DOCKER_SETUP.md)

### 部署问题
- 查看 [LIGHTSAIL_DEPLOYMENT.md](./LIGHTSAIL_DEPLOYMENT.md)

---

## 💡 重点提醒

1. **现在专注开发**：
   - 用熟悉的本地开发方式
   - 不需要管 Docker

2. **功能完成后再测 Docker**：
   - 确保部署环境没问题
   - 发现并解决潜在问题

3. **Docker 测试通过再部署**：
   - 一次性部署成功
   - 避免在服务器上调试

---

## ✅ 总结

```
现在（本地开发）→ 写代码，快速迭代
  ↓
功能完成 → 完整测试
  ↓
Docker测试 → 确保能部署
  ↓
部署上线 → 用户使用
```

**你现在在第一步，专注开发就好！** 🚀

继续加油！功能做完了再来找我测试 Docker 👍
