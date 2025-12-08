# Hetzner 部署指南 - 德国用户专属

## 🇩🇪 为什么选择 Hetzner？

作为德国用户，Hetzner 是您的最佳选择：

✅ **本地服务器** - Falkenstein/Nuremberg 数据中心
✅ **超低延迟** - <5ms ping
✅ **极致性价比** - €3.56/月 = 4GB RAM + 40GB SSD（CX23 新套餐！）
✅ **欧洲合规** - GDPR 合规，数据在德国
✅ **德语支持** - 网站和客服都有德语
✅ **支付方便** - SEPA、PayPal、信用卡

---

## ⚡ 20分钟快速部署

### 步骤 1：注册 Hetzner（3分钟）

1. **访问 Hetzner Cloud**
   https://www.hetzner.com/cloud

2. **注册账号**
   - 点击右上角 "Login" → "Sign up"
   - 填写信息（德国地址更快通过）
   - 验证邮箱

3. **创建项目**
   - 登录后，点击 "New Project"
   - 项目名称：`baustelle-prod`

---

### 步骤 2：创建服务器（5分钟）

1. **添加服务器**
   - 在项目中，点击 "Add Server"

2. **选择配置**
   ```
   Location (位置):    Nuremberg (德国纽伦堡) ← 推荐
                     或 Falkenstein (德国法尔肯斯坦)

   Image (镜像):      Ubuntu 22.04

   Type (类型):       Shared vCPU → CX23 ⭐ 2024新套餐
                     ├── 2 vCPU (x86)
                     ├── 4 GB RAM
                     ├── 40 GB SSD
                     └── 20 TB 流量
                     价格: €3.56/月 ⭐⭐⭐

   Networking:       ✅ Public IPv4
                     ✅ Public IPv6

   SSH Keys:         【重要】添加或创建 SSH key
                     或选择 Password（不推荐）

   Volumes:          不需要
   Firewalls:        稍后配置
   Backups:          可选（+20%费用）

   Server name:      baustelle-prod
   ```

3. **点击 "Create & Buy now"**

4. **等待 1 分钟** - 服务器创建完成，记下 IP 地址

---

### 步骤 3：连接服务器（2分钟）

**Windows 用户：**

```powershell
# 使用 PowerShell 或 Windows Terminal
ssh root@你的服务器IP

# 首次连接输入: yes
```

**或使用 Hetzner Web Console：**
- 在服务器页面，点击右侧 "Console" 图标
- 直接在浏览器中使用终端

---

### 步骤 4：初始化服务器（5分钟）

连接后，运行以下命令：

```bash
# 1. 更新系统（德语或英语输出都正常）
apt update && apt upgrade -y

# 2. 安装 Docker（一键脚本）
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 4. 安装 Git
apt install git -y

# 5. 验证安装
docker --version
docker-compose --version
git --version

# 应该看到版本号
```

---

### 步骤 5：部署项目（5分钟）

#### 方式 A：从 GitHub 克隆（推荐）

```bash
# 克隆项目
git clone https://github.com/你的用户名/baustelle-system.git
cd baustelle-system
```

#### 方式 B：从本地上传

在 **Windows 电脑**上：

```powershell
# 使用 SCP 上传
scp -r C:\Users\yhuan\baustelle-system root@你的IP:/root/

# 然后在服务器上
cd /root/baustelle-system
```

---

### 步骤 6：配置环境变量（3分钟）

```bash
cd /root/baustelle-system

# 创建后端环境变量
cat > backend/.env << 'EOF'
SUPABASE_URL=https://euxerhrjoqawcplejpjj.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eGVyaHJqb3Fhd2NwbGVqcGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTcyNjYsImV4cCI6MjA3NzU3MzI2Nn0.s7SAGwOYbTY0hsI0qX_2onVM0D1UuGjxAwcBAsUisak
SUPABASE_SERVICE_KEY=你的service_key
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://你的服务器IP,https://你的域名.com
ENVIRONMENT=production
EOF

# 创建前端环境变量
cat > frontend/.env << 'EOF'
VITE_API_URL=http://你的服务器IP:8000
VITE_SUPABASE_URL=https://euxerhrjoqawcplejpjj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eGVyaHJqb3Fhd2NwbGVqcGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTcyNjYsImV4cCI6MjA3NzU3MzI2Nn0.s7SAGwOYbTY0hsI0qX_2onVM0D1UuGjxAwcBAsUisak
EOF
```

**⚠️ 重要：把 "你的服务器IP" 替换为实际 IP！**

---

### 步骤 7：启动应用（2分钟）

```bash
cd /root/baustelle-system

# 启动所有服务
docker-compose up -d

# 查看日志确认启动成功
docker-compose logs -f

# 看到类似输出表示成功：
# backend_1   | INFO:     Uvicorn running on http://0.0.0.0:8000
# frontend_1  | ready - started server on 0.0.0.0:3000

# 按 Ctrl+C 退出日志
```

---

### 步骤 8：配置防火墙（2分钟）

**在 Hetzner 控制台（推荐）：**

1. 在服务器页面，点击 **"Firewalls"** 标签
2. 点击 **"Create Firewall"**
3. 添加规则：

```
Inbound Rules (入站规则):
├── SSH     (22)   → Source: 0.0.0.0/0
├── HTTP    (80)   → Source: 0.0.0.0/0
├── HTTPS   (443)  → Source: 0.0.0.0/0
├── Custom  (3000) → Source: 0.0.0.0/0 (临时测试)
└── Custom  (8000) → Source: 0.0.0.0/0 (临时测试)

Outbound Rules (出站规则):
└── All traffic → Allow
```

4. 应用到您的服务器

**或者在服务器上配置：**

```bash
# 安装防火墙
apt install ufw -y

# 配置规则
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 3000/tcp # Frontend (临时)
ufw allow 8000/tcp # Backend (临时)

# 启用
ufw --force enable

# 查看状态
ufw status
```

---

### 步骤 9：访问您的应用！🎉

在浏览器中打开：

```
前端: http://你的服务器IP:3000
后端: http://你的服务器IP:8000/docs
```

**测试功能：**
- 登录系统
- 创建材料申请
- 扫描二维码

---

## 🌐 配置域名和 SSL（推荐，15分钟）

### 1. 准备域名

如果您有域名（例如：baustelle.de），在域名注册商添加 DNS 记录：

```
类型: A
名称: @
值: 你的Hetzner服务器IP
TTL: 3600
```

等待 DNS 生效（通常 5-30 分钟）

### 2. 安装 Nginx

```bash
apt install nginx -y

# 创建配置文件
nano /etc/nginx/sites-available/baustelle
```

粘贴以下配置（**替换域名**）：

```nginx
server {
    listen 80;
    server_name baustelle.de www.baustelle.de;

    # 前端
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API 文档
    location /docs {
        proxy_pass http://localhost:8000/docs;
        proxy_set_header Host $host;
    }

    location /openapi.json {
        proxy_pass http://localhost:8000/openapi.json;
        proxy_set_header Host $host;
    }
}
```

保存（`Ctrl+X` → `Y` → `Enter`）

```bash
# 启用配置
ln -s /etc/nginx/sites-available/baustelle /etc/nginx/sites-enabled/
nginx -t  # 测试配置
systemctl restart nginx
systemctl enable nginx
```

### 3. 安装免费 SSL 证书

```bash
# 安装 Certbot
apt install certbot python3-certbot-nginx -y

# 获取免费 SSL 证书
certbot --nginx -d baustelle.de -d www.baustelle.de

# 选择选项 2: Redirect (强制 HTTPS)

# 测试自动续期
certbot renew --dry-run
```

现在访问：**https://baustelle.de** 🎉

---

## 💰 成本明细

```
Hetzner CX23:       €3.56/月 (4GB RAM, 40GB SSD) ⭐ 2024新套餐
Supabase:           €0 (免费套餐)
域名 (可选):         ~€10/年
SSL证书:            €0 (Let's Encrypt 免费)
────────────────────────────────────────────
总计:               €3.56/月 = €42.72/年
```

**比其他云服务商便宜 60-80%！**

---

## 🔧 日常维护

### 查看服务状态
```bash
cd /root/baustelle-system
docker-compose ps
docker-compose logs -f
```

### 重启服务
```bash
docker-compose restart           # 全部重启
docker-compose restart backend   # 只重启后端
```

### 更新代码
```bash
cd /root/baustelle-system
git pull
docker-compose down
docker-compose up -d --build
```

### 查看资源使用
```bash
docker stats    # 容器资源
htop           # 系统资源 (需安装: apt install htop)
df -h          # 磁盘空间
```

---

## 📊 Hetzner 控制台功能

在 Hetzner Cloud 控制台：

### Graphs（监控图表）
- CPU 使用率
- 网络流量（入站/出站）
- 磁盘 I/O

### Snapshots（快照备份）
```bash
# 创建快照
1. 在服务器页面，点击右侧 "•••"
2. 选择 "Create snapshot"
3. 输入名称：backup-2024-12-08
4. 创建！

费用: €0.01 per GB/月 (40GB ≈ €0.40/月)
```

### Volumes（额外存储）
如果 40GB 不够：
- 创建 Volume（额外存储卷）
- €0.04 per GB/月
- 例如：100GB = €4/月

---

## 🛡️ 安全建议

### 1. 修改 SSH 端口（防暴力破解）

```bash
nano /etc/ssh/sshd_config

# 找到并修改：
Port 2222  # 改为 2222 或其他端口

# 重启 SSH
systemctl restart sshd

# 更新防火墙
ufw allow 2222/tcp
ufw delete allow 22/tcp

# 以后连接用：
ssh -p 2222 root@你的IP
```

### 2. 设置自动备份

```bash
# 创建备份脚本
cat > /root/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# 备份项目
cd /root/baustelle-system
tar -czf $BACKUP_DIR/baustelle_$DATE.tar.gz .

# 保留最近 7 天
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /root/backup.sh

# 每天凌晨 3 点自动备份
crontab -e
# 添加：
0 3 * * * /root/backup.sh
```

### 3. 启用 Fail2ban（防止暴力破解）

```bash
apt install fail2ban -y
systemctl enable fail2ban
systemctl start fail2ban
```

---

## 🚀 性能优化

### 如果需要更多性能

**方案 1：升级服务器**
- 在控制台点击服务器 → "Resize"
- 升级到 CX33 (8GB RAM) - €7.12/月
- 或升级到 CPX21 (4GB RAM) - €8.46/月
- 无需迁移，点击即升级！

**方案 2：添加 CDN**
- 使用 Cloudflare（免费）
- 加速静态文件
- 提供 DDoS 防护

---

## 🌍 Hetzner vs 其他服务商

| 功能 | Hetzner CX23 | AWS | DigitalOcean | Railway |
|------|---------|-----|--------------|---------|
| 4GB RAM 价格 | **€3.56** ⭐ | ~$15 | $12 | $20 |
| 德国本地 | ✅ | ✅ | ❌ | ❌ |
| 延迟 (德国) | <5ms | ~10ms | ~30ms | ~50ms |
| GDPR 合规 | ✅ | ✅ | ⚠️ | ⚠️ |
| 性价比 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

---

## 📞 获取帮助

- **Hetzner 文档**: https://docs.hetzner.com
- **社区论坛**: https://community.hetzner.com
- **支持**: support@hetzner.com (德语/英语)
- **紧急热线**: +49 (0)9831 505-0

---

## ✅ 部署完成检查清单

- [ ] 服务器已创建 (CX23, €3.56/月)
- [ ] Docker 已安装
- [ ] 项目已部署
- [ ] 能访问 http://你的IP:3000
- [ ] 能访问 http://你的IP:8000/docs
- [ ] 防火墙已配置
- [ ] (可选) 域名已绑定
- [ ] (可选) SSL 已配置
- [ ] 自动备份已设置

---

## 🎉 完成！

您的 Baustelle 系统已成功部署到 Hetzner！

**访问地址：**
- 前端：http://你的IP:3000
- 后端：http://你的IP:8000
- API 文档：http://你的IP:8000/docs

**月成本：仅 €3.56！= €42.72/年** 🎊

**比其他云服务商便宜 60-80%！**

有问题随时问我！🚀
