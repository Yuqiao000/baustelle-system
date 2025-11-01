# 📋 部署检查清单

在部署之前，请确保完成以下所有检查项。

---

## ✅ 部署前检查

### 代码准备

- [ ] 代码已提交到 Git
- [ ] 所有功能已测试
- [ ] 没有 console.log 调试代码（或已清理）
- [ ] 敏感信息已移除（密钥、密码等）
- [ ] `.gitignore` 已配置正确

### 环境变量

- [ ] 后端环境变量已准备:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_KEY`
  - [ ] `SUPABASE_SERVICE_KEY`
  - [ ] `API_HOST=0.0.0.0`
  - [ ] `API_PORT=8000`
  - [ ] `CORS_ORIGINS` (包含前端域名)
  - [ ] `ENVIRONMENT=production`

- [ ] 前端环境变量已准备:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_API_URL` (后端域名)

### 数据库

- [ ] Supabase 项目已创建
- [ ] 数据库 schema 已执行
- [ ] 示例数据已加载
- [ ] RLS 策略已配置（推荐生产环境启用）
- [ ] 数据库连接已测试

---

## 🚀 部署步骤

### 1. 推送代码到 GitHub

```bash
cd /Users/yuqiao/baustelle-system

# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial deployment"

# 在 GitHub 创建仓库
# https://github.com/new

# 添加远程仓库
git remote add origin https://github.com/你的用户名/baustelle-system.git

# 推送
git branch -M main
git push -u origin main
```

- [ ] 代码已推送到 GitHub
- [ ] 仓库是 Public 或 Private（Railway 都支持）

### 2. 部署 Backend (Railway)

访问: https://railway.app

- [ ] 已注册/登录 Railway
- [ ] 创建新项目
- [ ] 连接 GitHub 仓库
- [ ] 配置 Backend Service:
  - [ ] Root Directory: `backend`
  - [ ] 所有环境变量已添加
  - [ ] 生成了 Backend 域名
  - [ ] 部署成功（绿色状态）
  - [ ] 可以访问 `/health` 端点

### 3. 部署 Frontend (Railway)

- [ ] 在同一项目中创建 Frontend Service
- [ ] 配置 Frontend Service:
  - [ ] Root Directory: `frontend`
  - [ ] 所有环境变量已添加
  - [ ] `VITE_API_URL` 指向 Backend 域名
  - [ ] 生成了 Frontend 域名
  - [ ] 部署成功（绿色状态）

### 4. 更新 CORS

- [ ] 回到 Backend Service
- [ ] 更新 `CORS_ORIGINS` 包含 Frontend 域名
- [ ] 重新部署 Backend
- [ ] 确认 CORS 工作正常

---

## 🧪 部署后测试

### 基本功能测试

- [ ] 可以访问前端 URL
- [ ] 可以看到登录页面
- [ ] 样式加载正常
- [ ] 没有控制台错误

### 注册和登录

- [ ] 可以注册新账号
- [ ] 注册后可以登录
- [ ] 登录状态持久化
- [ ] 可以登出

### Worker 功能

- [ ] 可以查看工地列表
- [ ] 可以查看物品列表
- [ ] 可以创建新申请
- [ ] 可以查看我的申请
- [ ] 可以查看申请详情

### Lager 功能

- [ ] 可以查看所有申请
- [ ] 可以更新申请状态
- [ ] 可以查看库存
- [ ] 可以查看统计数据

### 性能测试

- [ ] 页面加载速度 < 3秒
- [ ] API 响应速度 < 1秒
- [ ] 图片加载正常
- [ ] PWA 可以安装

### 移动端测试

- [ ] 手机浏览器可以访问
- [ ] 手机上样式正常
- [ ] 可以添加到主屏幕 (iOS)
- [ ] 可以添加到主屏幕 (Android)
- [ ] 触摸操作流畅

---

## 🔒 安全检查

### 环境变量

- [ ] 没有在代码中硬编码密钥
- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] 生产环境使用不同的密钥

### HTTPS

- [ ] 前端使用 HTTPS
- [ ] 后端使用 HTTPS
- [ ] Cookie 设置为 Secure

### Supabase

- [ ] 使用正确的 anon key（不是 service role key）
- [ ] RLS 策略已配置（生产环境）
- [ ] 数据库访问受限

---

## 📊 监控设置

### Railway 监控

- [ ] 查看部署日志
- [ ] 查看运行日志
- [ ] 查看资源使用

### 错误监控 (可选)

- [ ] 设置 Sentry 或其他错误追踪
- [ ] 配置错误通知

### 正常运行时间监控 (可选)

- [ ] 设置 UptimeRobot 或 Pingdom
- [ ] 配置宕机通知

---

## 📝 文档更新

- [ ] 更新 README.md 添加生产环境 URL
- [ ] 更新用户文档
- [ ] 记录部署日期和版本
- [ ] 创建用户使用指南

---

## 👥 用户设置

### 创建初始用户

- [ ] 创建管理员账号
- [ ] 创建测试 Worker 账号
- [ ] 创建测试 Lager 账号

### 数据初始化

- [ ] 添加真实工地数据
- [ ] 添加真实物品数据
- [ ] 设置正确的库存量

---

## 🎉 发布

### 通知用户

- [ ] 发送访问链接给团队
- [ ] 提供登录说明
- [ ] 提供使用教程
- [ ] 设置支持渠道

### 域名 (可选)

- [ ] 购买域名
- [ ] 配置 DNS
- [ ] 配置自定义域名
- [ ] 测试自定义域名

---

## 📌 记录信息

部署完成后，记录以下信息：

### Railway 信息
```
项目名称: ___________________
Backend URL: https://_______________.up.railway.app
Frontend URL: https://_______________.up.railway.app
部署日期: ___________________
```

### Supabase 信息
```
项目 ID: ___________________
项目 URL: https://_______________.supabase.co
部署日期: ___________________
```

### 访问信息
```
生产环境 URL: https://___________________
API 文档: https://___________________/docs
```

### 测试账号
```
Worker 账号: ___________________
Lager 账号: ___________________
密码: ___________________
```

---

## ✅ 完成！

当所有检查项都完成后：

1. ✅ 系统已成功部署
2. ✅ 所有功能正常工作
3. ✅ 安全措施已到位
4. ✅ 监控已设置
5. ✅ 用户已通知

**恭喜！你的工地物资申领系统已经上线！** 🎉

---

## 🔄 后续维护

### 定期检查

- 每周检查系统运行状态
- 每月查看使用统计
- 定期备份数据库
- 更新依赖包

### 用户反馈

- 收集用户反馈
- 修复 Bug
- 添加新功能
- 优化性能

---

需要帮助？查看 [DEPLOYMENT.md](DEPLOYMENT.md) 获取详细部署指南。
