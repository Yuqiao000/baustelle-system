# DigitalOcean 部署指南 - 30分钟完成

## 🎁 新用户福利

**立即获得 $200 免费额度（60天）！**

1. 访问：https://try.digitalocean.com/freetrialoffer/
2. 注册账号（支持支付宝）
3. 验证邮箱，完成！

---

## 📍 推荐机房位置

**最佳选择：新加坡（sgp1）**
- ✅ 离中国最近
- ✅ 延迟低（~50ms）
- ✅ 速度快

**备选：旧金山（sfo3）**
- ✅ 延迟中等（~150ms）
- ✅ 也不错

---

## ⚡ 快速部署（30分钟）

### 步骤 1：创建 Droplet（5分钟）

1. **登录 DigitalOcean**
   访问：https://cloud.digitalocean.com

2. **创建 Droplet**
   - 点击右上角绿色按钮 **"Create" → Droplets**

3. **选择配置**
   ```
   镜像(Image)：       Ubuntu 22.04 LTS x64
   套餐(Plan)：        Premium AMD - $12/月
                      └── 2GB RAM / 60GB SSD
   数据中心(Region)：  Singapore - sgp1 ⭐ 推荐
   认证(Authentication): SSH Key（更安全）或 Password
   主机名(Hostname)：  baustelle-prod
   ```

4. **点击 "Create Droplet"**

5. **等待 1 分钟** - Droplet 创建完成，记下 IP 地址

---

### 步骤 2：连接到服务器（2分钟）

**Windows 用户：**

```powershell
# 使用 PowerShell 或 Windows Terminal
ssh root@你的IP地址

# 首次连接会提示：
# Are you sure you want to continue connecting (yes/no)?
# 输入：yes
```

**或者使用浏览器 SSH：**
- 在 Droplet 页面，点击右上角 **"Console"** 按钮
- 直接在浏览器中使用命令行

---

### 步骤 3：安装 Docker（5分钟）

连接到服务器后，复制粘贴运行：

```bash
# 1. 更新系统
apt update && apt upgrade -y

# 2. 安装 Docker（官方一键脚本）
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 4. 验证安装
docker --version
docker-compose --version

# 应该看到版本号，例如：
# Docker version 24.0.7
# docker-compose version 2.23.3
```

---

### 步骤 4：准备项目文件（5分钟）

#### 方式 A：使用 Git（推荐）

```bash
# 1. 安装 Git
apt install git -y

# 2. 克隆项目（如果已推送到 GitHub）
git clone https://github.com/你的用户名/baustelle-system.git
cd baustelle-system
```

#### 方式 B：从本地上传

在 **Windows 电脑**上：

```powershell
# 使用 SCP 上传整个项目
scp -r C:\Users\yhuan\baustelle-system root@你的IP地址:/root/

# 然后在服务器上：
cd /root/baustelle-system
```

---

### 步骤 5：配置环境变量（3分钟）

在服务器上：

```bash
cd /root/baustelle-system

# 创建后端环境变量
cat > backend/.env << 'EOF'
SUPABASE_URL=https://euxerhrjoqawcplejpjj.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eGVyaHJqb3Fhd2NwbGVqcGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTcyNjYsImV4cCI6MjA3NzU3MzI2Nn0.s7SAGwOYbTY0hsI0qX_2onVM0D1UuGjxAwcBAsUisak
SUPABASE_SERVICE_KEY=你的service_key
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://你的IP地址,https://你的域名.com
ENVIRONMENT=production
EOF

# 创建前端环境变量
cat > frontend/.env << 'EOF'
VITE_API_URL=http://你的IP地址:8000
VITE_SUPABASE_URL=https://euxerhrjoqawcplejpjj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eGVyaHJqb3Fhd2NwbGVqcGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTcyNjYsImV4cCI6MjA3NzU3MzI2Nn0.s7SAGwOYbTY0hsI0qX_2onVM0D1UuGjxAwcBAsUisak
EOF
```

**⚠️ 重要：替换 "你的IP地址" 为实际的 Droplet IP！**

---

### 步骤 6：启动应用（5分钟）

```bash
cd /root/baustelle-system

# 启动所有服务
docker-compose up -d

# 查看日志（确认启动成功）
docker-compose logs -f

# 看到类似输出表示成功：
# backend_1   | INFO:     Uvicorn running on http://0.0.0.0:8000
# frontend_1  | ready - started server on 0.0.0.0:3000
```

按 `Ctrl + C` 退出日志查看

---

### 步骤 7：配置防火墙（2分钟）

```bash
# 安装防火墙
apt install ufw -y

# 允许 SSH（重要！否则会断连）
ufw allow 22/tcp

# 允许 HTTP 和 HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# 临时允许端口 3000 和 8000（测试用）
ufw allow 3000/tcp
ufw allow 8000/tcp

# 启用防火墙
ufw --force enable

# 查看状态
ufw status
```

---

### 步骤 8：访问您的应用！🎉

在浏览器中打开：

```
前端：http://你的IP地址:3000
后端：http://你的IP地址:8000/docs
```

**测试登录：**
- 使用您的 Supabase 账号登录
- 应该能看到完整的界面

---

## 🌐 配置域名（可选，10分钟）

如果您有域名（例如：baustelle.com）：

### 1. 添加 DNS 解析

在您的域名服务商（阿里云、腾讯云等）：

```
添加 A 记录：
名称(Name)：    @
类型(Type)：    A
值(Value)：     你的DigitalOcean IP
TTL：          600
```

### 2. 安装 Nginx

```bash
# 安装 Nginx
apt install nginx -y

# 创建配置文件
nano /etc/nginx/sites-available/baustelle
```

粘贴以下配置：

```nginx
server {
    listen 80;
    server_name baustelle.com www.baustelle.com;

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

    # 后端文档
    location /docs {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

保存并退出（`Ctrl + X`，然后 `Y`，然后 `Enter`）

```bash
# 启用配置
ln -s /etc/nginx/sites-available/baustelle /etc/nginx/sites-enabled/
nginx -t  # 测试配置
systemctl restart nginx
systemctl enable nginx
```

### 3. 配置 SSL（免费 HTTPS）

```bash
# 安装 Certbot
apt install certbot python3-certbot-nginx -y

# 获取免费 SSL 证书
certbot --nginx -d baustelle.com -d www.baustelle.com

# 选择：
# 2) Redirect - 强制 HTTPS（推荐）

# 测试自动续期
certbot renew --dry-run
```

现在访问：**https://baustelle.com** 🎉

---

## 🔧 日常维护

### 查看日志
```bash
cd /root/baustelle-system
docker-compose logs -f          # 所有服务
docker-compose logs -f backend  # 只看后端
docker-compose logs -f frontend # 只看前端
```

### 重启服务
```bash
docker-compose restart          # 重启所有
docker-compose restart backend  # 重启后端
```

### 更新代码
```bash
cd /root/baustelle-system
git pull                        # 拉取最新代码
docker-compose down             # 停止服务
docker-compose up -d --build    # 重新构建并启动
```

### 查看资源使用
```bash
docker stats                    # 实时资源监控
df -h                          # 磁盘空间
free -h                        # 内存使用
```

---

## 📊 性能监控（可选）

### 安装 htop（更好的进程监控）
```bash
apt install htop -y
htop
```

### 使用 DigitalOcean 监控
在 Droplet 页面 → **Graphs** 标签：
- CPU 使用率
- 内存使用
- 网络流量
- 磁盘 I/O

---

## 🛡️ 安全加固（重要！）

### 1. 修改 SSH 端口（防止暴力破解）

```bash
# 编辑 SSH 配置
nano /etc/ssh/sshd_config

# 找到这行：
# #Port 22
# 改为：
Port 2222

# 保存后重启 SSH
systemctl restart sshd

# 更新防火墙
ufw allow 2222/tcp
ufw delete allow 22/tcp

# 以后连接用：
ssh -p 2222 root@你的IP地址
```

### 2. 创建非 root 用户

```bash
# 创建新用户
adduser baustelle
usermod -aG sudo baustelle
usermod -aG docker baustelle

# 以后用这个用户登录更安全
```

### 3. 设置自动备份

```bash
# 创建备份脚本
cat > /root/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份项目代码
cd /root/baustelle-system
tar -czf $BACKUP_DIR/baustelle_$DATE.tar.gz .

# 只保留最近 7 天的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/baustelle_$DATE.tar.gz"
EOF

chmod +x /root/backup.sh

# 设置每天凌晨 3 点自动备份
crontab -e
# 添加这行：
0 3 * * * /root/backup.sh
```

---

## 💰 成本计算

```
DigitalOcean Droplet:    $12/月 (2GB RAM)
Supabase 数据库:         $0 (免费套餐)
域名（可选）:             ~$10/年
SSL 证书:               $0 (Let's Encrypt 免费)
────────────────────────────────────────
总计:                   $12/月 + $10/年
                       ≈ $13/月
```

**新用户福利：** 前 60 天完全免费（$200 额度）！

---

## 🚨 故障排查

### 问题 1：无法访问网站

```bash
# 检查服务是否运行
docker-compose ps

# 检查防火墙
ufw status

# 查看日志
docker-compose logs
```

### 问题 2：内存不足

```bash
# 查看内存使用
free -h

# 如果不够，升级 Droplet：
# 在控制台 → Resize → 选择更大套餐
```

### 问题 3：磁盘空间满

```bash
# 查看磁盘使用
df -h

# 清理 Docker
docker system prune -a

# 清理日志
journalctl --vacuum-time=7d
```

---

## 📞 获取帮助

- **DigitalOcean 文档**：https://docs.digitalocean.com
- **社区教程**：https://www.digitalocean.com/community/tutorials
- **支持工单**：在控制台右上角 "Get Help" → "Submit a Ticket"

---

## ✅ 完成检查清单

部署完成后，确认：

- [ ] 能访问前端：http://你的IP:3000
- [ ] 能访问后端：http://你的IP:8000/docs
- [ ] 能登录系统
- [ ] 能创建材料申请
- [ ] 防火墙已配置
- [ ] 已设置自动备份
- [ ] （可选）域名已绑定
- [ ] （可选）SSL 已配置

---

## 🎉 恭喜！

您的 Baustelle 系统已成功部署到 DigitalOcean！

**系统访问地址：**
- 前端：http://你的IP:3000
- 后端 API：http://你的IP:8000
- API 文档：http://你的IP:8000/docs

如有问题，随时联系我！🚀
