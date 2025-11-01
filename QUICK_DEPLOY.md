# ⚡ 快速部署指南

最快 10 分钟部署到互联网！

---

## 🎯 推荐：Railway 一键部署

Railway 是最简单的部署方式，自动配置 HTTPS，无需购买服务器。

### 步骤 1: 准备代码

```bash
# 1. 初始化 Git（如果还没有）
cd /Users/yuqiao/baustelle-system
git init
git add .
git commit -m "Ready for deployment"

# 2. 推送到 GitHub
# 在 GitHub 创建新仓库: https://github.com/new
git remote add origin https://github.com/你的用户名/baustelle-system.git
git branch -M main
git push -u origin main
```

### 步骤 2: 部署到 Railway

#### 2.1 注册 Railway
1. 访问 https://railway.app
2. 用 GitHub 账号登录
3. 获得 $5 免费额度

#### 2.2 部署 Backend

1. 在 Railway Dashboard 点击 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 选择你的 `baustelle-system` 仓库
4. Railway 会自动检测到多个服务

5. 创建 **Backend Service**:
   - 点击 **"Add Service"** → **"GitHub Repo"**
   - Root Directory: 输入 `backend`
   - 点击 **"Add variables"** 添加环境变量:

   ```
   SUPABASE_URL=https://euxerhrjoqawcplejpjj.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eGVyaHJqb3Fhd2NwbGVqcGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTcyNjYsImV4cCI6MjA3NzU3MzI2Nn0.s7SAGwOYbTY0hsI0qX_2onVM0D1UuGjxAwcBAsUisak
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eGVyaHJqb3Fhd2NwbGVqcGpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTk5NzI2NiwiZXhwIjoyMDc3NTczMjY2fQ.LTMkdQaQlsnFukd51KgbjjUcoqreRuhK2fS2UO2lNVo
   API_HOST=0.0.0.0
   API_PORT=8000
   CORS_ORIGINS=https://你的前端域名.up.railway.app
   ENVIRONMENT=production
   ```

6. 等待部署完成（约 2-3 分钟）

7. 在 **Settings** → **Networking** 中：
   - 点击 **"Generate Domain"**
   - 复制生成的域名（例如：`backend-production-abc123.up.railway.app`）

#### 2.3 部署 Frontend

1. 在同一个项目中，点击 **"New Service"**
2. 选择同一个 GitHub 仓库
3. 配置 **Frontend Service**:
   - Root Directory: 输入 `frontend`
   - 添加环境变量:

   ```
   VITE_SUPABASE_URL=https://euxerhrjoqawcplejpjj.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eGVyaHJqb3Fhd2NwbGVqcGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTcyNjYsImV4cCI6MjA3NzU3MzI2Nn0.s7SAGwOYbTY0hsI0qX_2onVM0D1UuGjxAwcBAsUisak
   VITE_API_URL=https://backend-production-abc123.up.railway.app
   ```

   **注意**: 把 `backend-production-abc123.up.railway.app` 替换成你的 Backend 域名！

4. 在 **Settings** → **Networking** 中：
   - 点击 **"Generate Domain"**
   - 复制前端域名（例如：`frontend-production-xyz789.up.railway.app`）

#### 2.4 更新 Backend CORS

1. 回到 **Backend Service**
2. 进入 **Variables**
3. 更新 `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://frontend-production-xyz789.up.railway.app
   ```
4. 点击 **"Deploy"** 重新部署

### 步骤 3: 测试

访问你的前端域名：`https://frontend-production-xyz789.up.railway.app`

应该可以看到登录页面，并且可以正常使用！

---

## 🎉 完成！

你的系统现在可以被任何人通过互联网访问了！

**你的链接:**
- 🌐 前端: `https://frontend-production-xyz789.up.railway.app`
- 🔧 后端 API: `https://backend-production-abc123.up.railway.app`
- 📚 API 文档: `https://backend-production-abc123.up.railway.app/docs`

**分享给你的团队:**
1. 发送前端链接
2. 让他们注册账号
3. 开始使用！

---

## 💰 费用

Railway 计费方式：
- **免费额度**: $5 credit（约可用一个月）
- **付费**: 按使用量计费，约 $5-10/月
- **暂停服务**: 可以随时在 Dashboard 中暂停服务，不会产生费用

---

## 🔧 后续优化

### 1. 自定义域名

在 Railway Settings → Networking:
- 点击 **"Custom Domain"**
- 输入你的域名（例如：`app.你的域名.com`）
- 在域名注册商添加 CNAME 记录

### 2. 监控

在 Railway Dashboard 可以查看:
- 📊 使用量统计
- 📝 实时日志
- 🔔 部署状态

### 3. 自动部署

每次推送到 GitHub main 分支，Railway 会自动重新部署：
```bash
git add .
git commit -m "Update feature"
git push origin main
```

---

## 📱 移动端访问

你的 PWA 应用现在可以安装到手机主屏幕：

**iOS:**
1. 在 Safari 打开你的网站
2. 点击底部分享按钮
3. 选择 "添加到主屏幕"

**Android:**
1. 在 Chrome 打开你的网站
2. 点击菜单
3. 选择 "添加到主屏幕"

---

## ❓ 常见问题

### Q: 前端显示 CORS 错误？
**A:** 确保 Backend 的 `CORS_ORIGINS` 包含你的前端域名，然后重新部署 Backend。

### Q: 502 Bad Gateway？
**A:** Backend 可能正在启动，等待 1-2 分钟。查看 Railway logs 确认启动状态。

### Q: 前端白屏？
**A:** 检查浏览器控制台错误，确认 `VITE_API_URL` 配置正确。

### Q: 如何查看日志？
**A:** 在 Railway Dashboard → 选择服务 → 点击 "Logs" 标签。

### Q: 如何更新代码？
**A:** 推送到 GitHub 即可自动部署：
```bash
git push origin main
```

---

## 🆘 需要帮助？

如果遇到问题：

1. **查看 Railway 日志**: Dashboard → Service → Logs
2. **检查环境变量**: Dashboard → Service → Variables
3. **查看部署状态**: Dashboard → Service → Deployments
4. **Railway 文档**: https://docs.railway.app

---

**恭喜！你的系统已经上线了！** 🚀

现在任何人都可以通过互联网访问你的工地物资申领系统！
