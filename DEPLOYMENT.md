# 🚀 部署指南 (Deployment Guide)

完整的生产环境部署指南，让你的工地物资申领系统可以被任何人通过互联网访问。

---

## 📋 目录

1. [部署前准备](#部署前准备)
2. [推荐部署方案](#推荐部署方案)
3. [方案一：Railway (最简单)](#方案一railway-最简单推荐)
4. [方案二：Render (免费额度)](#方案二render-有免费额度)
5. [方案三：Vercel + Railway](#方案三vercel--railway)
6. [方案四：自己的服务器 (VPS)](#方案四自己的服务器-vps)
7. [部署后配置](#部署后配置)
8. [域名和 HTTPS](#域名和-https)

---

## 部署前准备

### 1. 确认 Supabase 已配置

确保你的 Supabase 项目：
- ✅ 数据库 schema 已创建
- ✅ RLS 策略已配置（生产环境建议启用）
- ✅ 有 API 密钥（anon key 和 service role key）

### 2. 准备环境变量

复制示例文件：
```bash
cp .env.production.example .env.production
```

填写你的实际值：
- Supabase URL 和密钥
- 生产环境的域名
- CORS 允许的域名

---

## 推荐部署方案

| 方案 | 前端 | 后端 | 价格 | 难度 | 推荐度 |
|------|------|------|------|------|--------|
| Railway | Railway | Railway | $5/月起 | ⭐ | ⭐⭐⭐⭐⭐ |
| Render | Render | Render | 免费/$7/月 | ⭐⭐ | ⭐⭐⭐⭐ |
| Vercel + Railway | Vercel | Railway | $5/月起 | ⭐⭐ | ⭐⭐⭐⭐ |
| VPS | Nginx | Docker | $5/月起 | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 方案一：Railway (最简单，推荐)

Railway 是最简单的部署方案，支持 monorepo，自动 HTTPS。

### 优点
- ✅ 一键部署
- ✅ 自动 HTTPS
- ✅ 免费额度（$5 credit）
- ✅ 支持 Docker 和 Git
- ✅ 自动域名

### 部署步骤

#### 1. 创建 Railway 账号
访问 https://railway.app 注册账号

#### 2. 安装 Railway CLI (可选)
```bash
npm install -g @railway/cli
railway login
```

#### 3. 准备项目

在项目根目录创建 `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "echo 'Building services'"
  },
  "deploy": {
    "startCommand": "echo 'Use docker-compose'",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 4. 通过 GitHub 部署

**推荐方式：通过 GitHub 自动部署**

1. 将代码推送到 GitHub：
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/baustelle-system.git
git push -u origin main
```

2. 在 Railway Dashboard：
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库
   - Railway 会自动检测 Dockerfile

3. 分别部署 Backend 和 Frontend：

**部署 Backend:**
- New Service → Backend
- Root Directory: `backend`
- 添加环境变量（在 Settings → Variables）:
  ```
  SUPABASE_URL=你的supabase_url
  SUPABASE_KEY=你的anon_key
  SUPABASE_SERVICE_KEY=你的service_role_key
  API_HOST=0.0.0.0
  API_PORT=8000
  CORS_ORIGINS=https://你的前端域名.railway.app
  ENVIRONMENT=production
  ```
- 获取 Backend URL（例如：`https://backend-production-xxxx.up.railway.app`）

**部署 Frontend:**
- New Service → Frontend
- Root Directory: `frontend`
- 添加环境变量:
  ```
  VITE_SUPABASE_URL=你的supabase_url
  VITE_SUPABASE_ANON_KEY=你的anon_key
  VITE_API_URL=https://backend-production-xxxx.up.railway.app
  ```
- 部署完成后会得到前端 URL

#### 5. 更新 Backend CORS

回到 Backend 服务，更新 `CORS_ORIGINS`:
```
CORS_ORIGINS=https://你的前端域名.railway.app
```

#### 6. 测试部署

访问前端 URL，测试功能是否正常。

---

## 方案二：Render (有免费额度)

Render 提供免费托管，但免费版会在不活动时休眠。

### 优点
- ✅ 有免费额度
- ✅ 自动 HTTPS
- ✅ 简单易用
- ❌ 免费版会休眠（15分钟不活动）

### 部署步骤

#### 1. 创建 Render 账号
访问 https://render.com 注册

#### 2. 部署 Backend

1. 在 Dashboard 点击 "New +" → "Web Service"
2. 连接 GitHub 仓库
3. 配置：
   - Name: `baustelle-backend`
   - Root Directory: `backend`
   - Environment: `Docker`
   - Plan: Free (或 Starter $7/月)
4. 添加环境变量（Environment）:
   ```
   SUPABASE_URL=你的supabase_url
   SUPABASE_KEY=你的anon_key
   SUPABASE_SERVICE_KEY=你的service_role_key
   API_HOST=0.0.0.0
   API_PORT=8000
   CORS_ORIGINS=https://你的前端域名.onrender.com
   ENVIRONMENT=production
   ```
5. 点击 "Create Web Service"
6. 获取 Backend URL（例如：`https://baustelle-backend.onrender.com`）

#### 3. 部署 Frontend

1. 新建 "Static Site"
2. 连接同一个 GitHub 仓库
3. 配置：
   - Name: `baustelle-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. 添加环境变量:
   ```
   VITE_SUPABASE_URL=你的supabase_url
   VITE_SUPABASE_ANON_KEY=你的anon_key
   VITE_API_URL=https://baustelle-backend.onrender.com
   ```
5. 部署完成

#### 4. 更新 Backend CORS

回到 Backend 服务，更新 `CORS_ORIGINS` 环境变量。

---

## 方案三：Vercel + Railway

前端用 Vercel（最快），后端用 Railway。

### Vercel 部署前端

#### 1. 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 2. 部署
```bash
cd frontend
vercel
```

按照提示：
- Link to existing project? No
- Project name: baustelle-frontend
- Directory: `./` (已经在 frontend 目录)
- Override settings? No

#### 3. 添加环境变量
```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_API_URL production
```

#### 4. 重新部署
```bash
vercel --prod
```

### Railway 部署后端

按照方案一的 Backend 部署步骤。

---

## 方案四：自己的服务器 (VPS)

如果你有自己的服务器（如 DigitalOcean, Linode, AWS EC2 等）。

### 前提条件
- 一台 Linux 服务器（Ubuntu 20.04+ 推荐）
- 服务器有公网 IP
- 已安装 Docker 和 Docker Compose

### 部署步骤

#### 1. 连接服务器
```bash
ssh root@你的服务器IP
```

#### 2. 安装 Docker
```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安装 Docker Compose
apt install docker-compose -y
```

#### 3. 克隆代码
```bash
git clone https://github.com/你的用户名/baustelle-system.git
cd baustelle-system
```

#### 4. 配置环境变量
```bash
cp .env.production.example .env.production
nano .env.production
```

填写：
```env
SUPABASE_URL=你的supabase_url
SUPABASE_KEY=你的anon_key
SUPABASE_SERVICE_KEY=你的service_role_key
CORS_ORIGINS=http://你的服务器IP,https://你的域名
VITE_API_URL=http://你的服务器IP:8000
```

#### 5. 构建并启动
```bash
docker-compose --env-file .env.production up -d --build
```

#### 6. 查看状态
```bash
docker-compose ps
docker-compose logs -f
```

#### 7. 访问应用
- 前端: `http://你的服务器IP`
- 后端: `http://你的服务器IP:8000`
- API 文档: `http://你的服务器IP:8000/docs`

#### 8. 设置防火墙
```bash
ufw allow 80/tcp
ufw allow 8000/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

#### 9. 配置自动重启
```bash
# 添加到系统启动
systemctl enable docker

# 创建 systemd 服务
cat > /etc/systemd/system/baustelle.service <<EOF
[Unit]
Description=Baustelle System
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/root/baustelle-system
ExecStart=/usr/bin/docker-compose --env-file .env.production up -d
ExecStop=/usr/bin/docker-compose --env-file .env.production down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl enable baustelle
systemctl start baustelle
```

---

## 部署后配置

### 1. 配置 HTTPS (重要！)

生产环境必须使用 HTTPS。

#### 使用 Cloudflare (推荐，最简单)

1. 注册 Cloudflare 账号: https://cloudflare.com
2. 添加你的域名
3. 修改域名 DNS 服务器指向 Cloudflare
4. 在 DNS 设置中添加 A 记录指向服务器 IP
5. 在 SSL/TLS 设置中选择 "Full" 或 "Flexible"
6. 自动获得 HTTPS

#### 使用 Let's Encrypt (VPS 服务器)

```bash
# 安装 Certbot
apt install certbot python3-certbot-nginx -y

# 获取证书
certbot --nginx -d 你的域名 -d www.你的域名

# 自动续期
certbot renew --dry-run
```

### 2. 更新环境变量

部署完成后，记得更新：

**Backend:**
```env
CORS_ORIGINS=https://你的域名,https://www.你的域名
```

**Frontend:**
```env
VITE_API_URL=https://api.你的域名
```

### 3. 启用 Supabase RLS (安全)

生产环境建议启用 Row Level Security：

```sql
-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_items ENABLE ROW LEVEL SECURITY;
-- ... 其他表

-- 创建策略（在 Supabase SQL Editor 中运行）
-- 参考 database/schema.sql 中的策略
```

---

## 域名和 HTTPS

### 购买域名

推荐域名注册商：
- **Namecheap**: https://namecheap.com （便宜）
- **Cloudflare**: https://cloudflare.com （集成方便）
- **GoDaddy**: https://godaddy.com （知名）

价格：约 $10-15/年

### DNS 配置

在域名注册商或 Cloudflare 添加 DNS 记录：

```
类型    名称    值
A       @       你的服务器IP
A       www     你的服务器IP
CNAME   api     backend-production.railway.app  (如果后端单独部署)
```

### 推荐子域名结构

```
https://baustelle.你的域名.com         → 前端
https://api.baustelle.你的域名.com     → 后端 API
```

---

## 监控和维护

### 1. 设置监控

**UptimeRobot** (免费): https://uptimerobot.com
- 监控网站是否在线
- 宕机时发送邮件通知

### 2. 日志查看

**Railway:**
```bash
railway logs
```

**Docker:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 3. 数据备份

**Supabase 自动备份**（Pro 计划）
- 每日自动备份
- 或使用 Supabase CLI 手动导出

### 4. 更新部署

**Git 推送自动部署:**
```bash
git add .
git commit -m "Update feature"
git push origin main
```

Railway/Render 会自动重新部署。

**手动重新部署:**
```bash
# VPS
cd baustelle-system
git pull
docker-compose down
docker-compose --env-file .env.production up -d --build
```

---

## 故障排除

### 问题 1: CORS 错误

**症状**: 前端无法访问后端 API

**解决**:
1. 确认 Backend `CORS_ORIGINS` 包含前端域名
2. 确认前端 `VITE_API_URL` 指向正确的后端地址
3. 重新部署 Backend

### 问题 2: 502 Bad Gateway

**症状**: 访问时显示 502 错误

**解决**:
1. 检查 Backend 是否正常运行
2. 查看日志: `docker-compose logs backend`
3. 确认环境变量配置正确

### 问题 3: 前端白屏

**症状**: 访问前端显示空白页面

**解决**:
1. 打开浏览器控制台查看错误
2. 确认 `VITE_API_URL` 配置正确
3. 确认前端构建成功
4. 检查 nginx 配置

### 问题 4: 数据库连接失败

**症状**: 500 错误，日志显示数据库错误

**解决**:
1. 检查 `SUPABASE_URL` 和 `SUPABASE_KEY` 是否正确
2. 确认 Supabase 项目是否激活
3. 检查网络连接

---

## 成本估算

### 推荐配置（Railway + Cloudflare）

| 项目 | 服务 | 价格 |
|------|------|------|
| 后端托管 | Railway | $5/月 |
| 前端托管 | Railway | $5/月 |
| 数据库 | Supabase Free | $0 |
| CDN + HTTPS | Cloudflare | $0 |
| 域名 | Namecheap | $12/年 ≈ $1/月 |
| **总计** | | **$11/月** |

### 预算方案（Render Free）

| 项目 | 服务 | 价格 |
|------|------|------|
| 后端托管 | Render Free | $0 |
| 前端托管 | Render Free | $0 |
| 数据库 | Supabase Free | $0 |
| CDN + HTTPS | Cloudflare | $0 |
| 域名 | Namecheap | $12/年 |
| **总计** | | **$12/年** |

---

## 下一步

1. ✅ 选择部署方案
2. ✅ 配置环境变量
3. ✅ 部署到生产环境
4. ✅ 配置域名和 HTTPS
5. ✅ 测试所有功能
6. ✅ 邀请用户使用

---

## 需要帮助？

如果部署过程中遇到问题：

1. 查看日志文件
2. 检查环境变量配置
3. 参考错误信息搜索解决方案
4. 查看 Railway/Render 文档

---

**祝你部署成功！** 🎉

如果需要更详细的某个平台的部署指南，请告诉我！
