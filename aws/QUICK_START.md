# AWS 快速部署 - 30 分钟上线

## 前提条件
- ✅ AWS 账户
- ✅ AWS CLI 已安装并配置
- ✅ Docker Desktop 运行中
- ✅ Node.js 18+ 和 npm

## 快速部署（5 个步骤）

### 1️⃣ 一键部署基础设施（~10 分钟）

```bash
# 克隆并进入项目
cd c:\Users\yhuan\baustelle-system

# 部署 CloudFormation 栈
aws cloudformation create-stack \
  --stack-name baustelle-prod \
  --template-body file://aws/cloudformation-template.yml \
  --capabilities CAPABILITY_IAM \
  --region eu-central-1

# 等待部署完成（约 8-10 分钟）
aws cloudformation wait stack-create-complete --stack-name baustelle-prod

# 获取输出信息
aws cloudformation describe-stacks --stack-name baustelle-prod --query 'Stacks[0].Outputs'
```

**记录以下输出**：
- `ImageBucketName` - 图片存储桶名
- `CloudFrontDomain` - 图片 CDN 域名
- `FrontendCloudFrontDomain` - 前端 CDN 域名
- `ALBDNSName` - API 负载均衡器地址
- `RedisEndpoint` - Redis 缓存地址

---

### 2️⃣ 存储敏感配置（~2 分钟）

```bash
# 替换下面的值为你的实际配置
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
IMAGE_BUCKET="baustelle-images-$ACCOUNT_ID"

# Supabase 配置
aws secretsmanager create-secret --name baustelle/supabase-url \
  --secret-string "https://euxerhrjoqawcplejpjj.supabase.co" --region eu-central-1

aws secretsmanager create-secret --name baustelle/supabase-key \
  --secret-string "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eGVyaHJqb3Fhd2NwbGVqcGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTcyNjYsImV4cCI6MjA3NzU3MzI2Nn0.s7SAGwOYbTY0hsI0qX_2onVM0D1UuGjxAwcBAsUisak" \
  --region eu-central-1

# 从 Supabase 获取 service key 并替换下面的值
aws secretsmanager create-secret --name baustelle/supabase-service-key \
  --secret-string "YOUR_SUPABASE_SERVICE_KEY_HERE" --region eu-central-1

# S3 存储桶
aws secretsmanager create-secret --name baustelle/s3-bucket \
  --secret-string "$IMAGE_BUCKET" --region eu-central-1
```

---

### 3️⃣ 部署后端 API（~10 分钟）

```bash
# 创建 ECR 仓库
aws ecr create-repository --repository-name baustelle-backend --region eu-central-1

# 登录 ECR
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.eu-central-1.amazonaws.com

# 构建并推送 Docker 镜像
cd backend
docker build -t baustelle-backend .
docker tag baustelle-backend:latest $ACCOUNT_ID.dkr.ecr.eu-central-1.amazonaws.com/baustelle-backend:latest
docker push $ACCOUNT_ID.dkr.ecr.eu-central-1.amazonaws.com/baustelle-backend:latest
cd ..

# 更新 ECS 任务定义文件
# 编辑 aws/ecs-task-definition.json，替换所有 YOUR_ACCOUNT_ID 为你的账户 ID

# 注册任务定义
aws ecs register-task-definition --cli-input-json file://aws/ecs-task-definition.json --region eu-central-1

# 创建 ECS 服务（需要手动获取子网和安全组 ID）
# 从 CloudFormation 输出中获取这些值
```

**⚠️ 注意**：你需要手动创建 Target Group 并配置 ALB，或使用 AWS Console 完成 ECS 服务创建。

---

### 4️⃣ 部署前端（~5 分钟）

```bash
cd frontend

# 创建生产环境配置
cat > .env.production << EOF
VITE_SUPABASE_URL=https://euxerhrjoqawcplejpjj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eGVyaHJqb3Fhd2NwbGVqcGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTcyNjYsImV4cCI6MjA3NzU3MzI2Nn0.s7SAGwOYbTY0hsI0qX_2onVM0D1UuGjxAwcBAsUisak
VITE_API_URL=https://你的ALB地址.eu-central-1.elb.amazonaws.com
EOF

# 安装依赖并构建
npm ci
npm run build

# 部署到 S3
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws s3 sync dist/ s3://baustelle-frontend-$ACCOUNT_ID --delete

# 获取 CloudFront Distribution ID
DIST_ID=$(aws cloudformation describe-stacks --stack-name baustelle-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendCloudFrontDomain`].OutputValue' \
  --output text)

# 创建失效（清除缓存）
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

---

### 5️⃣ 验证部署

```bash
# 检查后端 API
curl https://你的ALB地址/health

# 访问前端
echo "前端地址: https://$(aws cloudformation describe-stacks --stack-name baustelle-prod --query 'Stacks[0].Outputs[?OutputKey==`FrontendCloudFrontDomain`].OutputValue' --output text)"
```

---

## 成本估算

| 配置 | 月成本 |
|------|--------|
| 小型（开发/测试）| €30-50 |
| 中型（企业使用）| €110-175 |
| 大型（高流量）| €200-350 |

---

## 常见问题

### Q: 部署失败怎么办？
```bash
# 查看 CloudFormation 错误
aws cloudformation describe-stack-events --stack-name baustelle-prod

# 删除并重新部署
aws cloudformation delete-stack --stack-name baustelle-prod
```

### Q: 如何查看日志？
```bash
# 后端日志
aws logs tail /ecs/baustelle-backend --follow

# CloudFormation 日志
aws cloudformation describe-stack-events --stack-name baustelle-prod
```

### Q: 如何更新代码？
```bash
# 后端：重新构建并推送镜像，然后
aws ecs update-service --cluster baustelle-cluster \
  --service baustelle-backend-service --force-new-deployment

# 前端：重新构建并同步到 S3
npm run build
aws s3 sync dist/ s3://baustelle-frontend-$ACCOUNT_ID --delete
```

---

## 下一步

✅ 部署完成后：
1. 配置自定义域名（可选）
2. 申请 SSL 证书（推荐）
3. 设置监控告警
4. 配置 CI/CD 自动部署

详细文档：查看 [AWS_DEPLOYMENT_GUIDE.md](../AWS_DEPLOYMENT_GUIDE.md)
