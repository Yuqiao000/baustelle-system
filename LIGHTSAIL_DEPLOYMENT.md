# AWS Lightsail 部署指南

## 为什么选择 Lightsail？

✅ **简单**：像 Railway 一样简单，但更强大
✅ **便宜**：$12-20/月，固定价格
✅ **够用**：2-4GB RAM，足够中型企业使用
✅ **可靠**：AWS 基础设施，稳定性好

---

## 方案架构

```
Lightsail 实例 ($12-20/月)
├── Docker Compose
│   ├── Frontend (React)
│   ├── Backend (FastAPI)
│   └── Redis (缓存)
├── Nginx (反向代理)
└── Let's Encrypt (免费 SSL)

外部服务：
├── Supabase (数据库，免费)
└── S3 + CloudFront (图片，~$5/月)
```

**总成本**：$17-25/月

---

## Lightsail 套餐选择

| 套餐 | CPU | RAM | 存储 | 流量 | 价格/月 | 推荐 |
|------|-----|-----|------|------|---------|------|
| 512MB | 1 vCPU | 512MB | 20GB | 1TB | $3.50 | ❌ 太小 |
| 1GB | 1 vCPU | 1GB | 40GB | 2TB | $5 | ❌ 勉强 |
| 2GB | 1 vCPU | 2GB | 60GB | 3TB | $10 | ✅ **推荐** |
| 4GB | 2 vCPU | 4GB | 80GB | 4TB | $20 | ✅ 高流量 |
| 8GB | 2 vCPU | 8GB | 160GB | 5TB | $40 | 不需要 |

**建议**：从 **$10/月 (2GB)** 开始，不够再升级。

---

## 快速部署（30 分钟）

### 步骤 1：创建 Lightsail 实例

1. **登录 AWS Lightsail**
   访问：https://lightsail.aws.amazon.com

2. **创建实例**
   - 点击 **Create instance**
   - 位置：选择 **Frankfurt, Germany** (eu-central-1)
   - 镜像：**OS Only** → **Ubuntu 22.04 LTS**
   - 套餐：选择 **$10/月 (2GB RAM)**
   - 实例名称：`baustelle-prod`
   - 点击 **Create instance**

3. **配置防火墙**
   - 在实例页面，点击 **Networking** 标签
   - 添加规则：
     - HTTP (80)
     - HTTPS (443)
     - Custom: 8000 (临时测试用)

---

### 步骤 2：连接到服务器

```bash
# 方式 1：使用浏览器 SSH（最简单）
# 在 Lightsail 控制台，点击实例右上角的 "Connect using SSH"

# 方式 2：使用本地 SSH（推荐）
# 1. 下载 SSH 密钥
# 2. 保存为 lightsail-key.pem
# 3. 连接：
ssh -i lightsail-key.pem ubuntu@你的实例IP
```

---

### 步骤 3：安装 Docker

```bash
# 连接到服务器后，运行：

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 添加当前用户到 docker 组
sudo usermod -aG docker ubuntu

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 重新登录使 docker 组生效
exit
# 重新 SSH 连接

# 验证安装
docker --version
docker-compose --version
```

---

### 步骤 4：上传项目文件

在你的 **Windows 电脑**上：

```bash
# 方式 1：使用 Git（推荐）
# 在服务器上：
git clone https://github.com/你的用户名/baustelle-system.git
cd baustelle-system

# 方式 2：使用 SCP 上传
# 在 Windows PowerShell：
scp -i lightsail-key.pem -r C:\Users\yhuan\baustelle-system ubuntu@你的实例IP:/home/ubuntu/

# 方式 3：使用 VS Code Remote SSH（最方便）
# 1. 安装 VS Code 插件 "Remote - SSH"
# 2. 连接到服务器
# 3. 直接在 VS Code 中编辑文件
```

---

### 步骤 5：配置环境变量

在服务器上创建 `.env` 文件：

```bash
cd /home/ubuntu/baustelle-system

# 创建后端环境变量
cat > backend/.env << 'EOF'
SUPABASE_URL=https://euxerhrjoqawcplejpjj.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eGVyaHJqb3Fhd2NwbGVqcGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTcyNjYsImV4cCI6MjA3NzU3MzI2Nn0.s7SAGwOYbTY0hsI0qX_2onVM0D1UuGjxAwcBAsUisak
SUPABASE_SERVICE_KEY=你的service_key
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost,https://你的域名.com
ENVIRONMENT=production

# 可选：如果使用 S3
AWS_ACCESS_KEY_ID=你的key
AWS_SECRET_ACCESS_KEY=你的secret
AWS_REGION=eu-central-1
S3_BUCKET_NAME=baustelle-images
EOF

# 创建 Docker Compose 环境变量
cat > .env << 'EOF'
SUPABASE_URL=https://euxerhrjoqawcplejpjj.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eGVyaHJqb3Fhd2NwbGVqcGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTcyNjYsImV4cCI6MjA3NzU3MzI2Nn0.s7SAGwOYbTY0hsI0qX_2onVM0D1UuGjxAwcBAsUisak
SUPABASE_SERVICE_KEY=你的service_key
VITE_API_URL=https://你的域名.com
CORS_ORIGINS=https://你的域名.com
EOF
```

---

### 步骤 6：启动应用

```bash
cd /home/ubuntu/baustelle-system

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 检查状态
docker-compose ps
```

---

### 步骤 7：配置 Nginx 反向代理

```bash
# 安装 Nginx
sudo apt install nginx -y

# 创建 Nginx 配置
sudo nano /etc/nginx/sites-available/baustelle

# 粘贴以下配置：
```

```nginx
server {
    listen 80;
    server_name 你的域名.com;  # 或使用 Lightsail 的公共 IP

    # 前端
    location / {
        proxy_pass http://localhost:80;
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

        # CORS 头
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
    }

    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        proxy_pass http://localhost:80;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/baustelle /etc/nginx/sites-enabled/
sudo nginx -t  # 测试配置
sudo systemctl restart nginx

# 设置开机启动
sudo systemctl enable nginx
```

---

### 步骤 8：配置 SSL（免费 HTTPS）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取 SSL 证书（需要先配置域名解析）
sudo certbot --nginx -d 你的域名.com

# 选择：
# 2) Redirect - 强制 HTTPS（推荐）

# 自动续期（证书 90 天过期）
sudo certbot renew --dry-run
```

---

### 步骤 9：设置静态 IP（推荐）

1. 在 Lightsail 控制台，点击 **Networking** 标签
2. 点击 **Create static IP**
3. 选择你的实例
4. 命名：`baustelle-ip`
5. 点击 **Create**

**免费！** Lightsail 静态 IP 免费（只要连接到实例）

---

### 步骤 10：配置域名（可选）

如果你有域名：

1. **在 Lightsail DNS 区域**
   - Networking → DNS zones → Create DNS zone
   - 添加域名：`你的域名.com`
   - 添加 A 记录：`@` → 你的静态 IP
   - 添加 A 记录：`www` → 你的静态 IP

2. **在域名注册商**
   - 更新 Nameservers 为 Lightsail 提供的 NS 记录

---

## 维护和管理

### 查看日志
```bash
# 所有服务
docker-compose logs -f

# 只看后端
docker-compose logs -f backend

# 只看前端
docker-compose logs -f frontend
```

### 重启服务
```bash
# 重启所有
docker-compose restart

# 重启后端
docker-compose restart backend

# 重新构建并启动
docker-compose up -d --build
```

### 更新代码
```bash
cd /home/ubuntu/baustelle-system

# 如果用 Git
git pull

# 重新构建
docker-compose down
docker-compose up -d --build
```

### 备份
```bash
# 创建备份脚本
cat > /home/ubuntu/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份代码
tar -czf $BACKUP_DIR/code_$DATE.tar.gz /home/ubuntu/baustelle-system

# 保留最近 7 天的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/code_$DATE.tar.gz"
EOF

chmod +x /home/ubuntu/backup.sh

# 设置定时备份（每天凌晨 2 点）
crontab -e
# 添加：
0 2 * * * /home/ubuntu/backup.sh
```

---

## 监控和性能

### 查看资源使用
```bash
# CPU、内存
docker stats

# 磁盘空间
df -h

# 系统负载
htop  # 需要安装: sudo apt install htop
```

### Lightsail 监控
在控制台 → **Metrics** 标签可以看到：
- CPU 使用率
- 网络流量
- 磁盘 I/O

---

## 故障排查

### 容器无法启动
```bash
# 查看详细错误
docker-compose logs backend

# 检查端口占用
sudo netstat -tlnp | grep :8000

# 重新构建
docker-compose build --no-cache backend
docker-compose up -d
```

### 无法访问网站
```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 检查防火墙
sudo ufw status
```

### 性能慢
```bash
# 查看容器资源
docker stats

# 如果内存不够，升级 Lightsail 实例：
# 控制台 → Change plan → 选择更大套餐
```

---

## 成本优化

### 1. 图片存储使用 S3（推荐）
- Lightsail 存储有限（60GB）
- S3 便宜且无限：~$0.023/GB/月
- 配置见 [S3_IMAGE_UPLOAD.md](./aws/S3_IMAGE_UPLOAD.md)

### 2. 使用 Lightsail CDN（可选）
- 加速静态文件：$2.50/月 + 流量费
- 适合全球访问

### 3. 定期清理
```bash
# 清理 Docker 镜像
docker system prune -a

# 清理日志
sudo journalctl --vacuum-time=7d
```

---

## 升级路径

### 现在：Lightsail $10/月
- 2GB RAM
- 适合 50 人以内使用

### 6 个月后：Lightsail $20/月
- 4GB RAM
- 适合 100 人使用

### 1 年后：如果需要更高性能
- 迁移到 ECS Fargate
- 参考 [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)

---

## 快速参考

| 操作 | 命令 |
|------|------|
| 启动服务 | `docker-compose up -d` |
| 停止服务 | `docker-compose down` |
| 查看日志 | `docker-compose logs -f` |
| 重启服务 | `docker-compose restart` |
| 更新代码 | `git pull && docker-compose up -d --build` |
| 查看状态 | `docker-compose ps` |
| 查看资源 | `docker stats` |
| 重启 Nginx | `sudo systemctl restart nginx` |

---

## 下一步

✅ 完成部署后：
- [ ] 绑定自定义域名
- [ ] 配置 SSL 证书
- [ ] 设置自动备份
- [ ] 配置监控告警
- [ ] 测试应用功能

需要帮助？查看故障排查部分或创建 Issue。
