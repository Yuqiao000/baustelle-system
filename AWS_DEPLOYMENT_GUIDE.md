# AWS 企业级部署指南

## 架构概览

```
用户
 ↓
CloudFront (全球 CDN)
 ├─→ S3 静态网站 (前端 React 应用)
 └─→ Application Load Balancer
      ↓
   ECS Fargate 集群 (自动扩展 1-10 容器)
      ├─→ Backend API (FastAPI)
      ├─→ Redis (缓存)
      └─→ S3 (图片存储) → CloudFront CDN
           ↓
        Supabase (数据库)
```

## 成本估算（企业使用）

| 服务 | 配置 | 月成本 (EUR) |
|------|------|--------------|
| ECS Fargate | 1 vCPU, 2GB RAM, 2个任务 | €30-50 |
| Application Load Balancer | 标准配置 | €20-25 |
| ElastiCache Redis | cache.t3.micro | €15 |
| S3 + CloudFront | 100GB 存储 + 500GB 流量 | €15-30 |
| NAT Gateway (可选) | 数据传输 | €30-40 |
| **总计** | | **€110-175/月** |

**流量大时自动扩展**：可能增加 €50-150/月

---

## 部署步骤

### 第 1 步：准备 AWS 账户

1. **注册 AWS 账户**
   - 访问 https://aws.amazon.com
   - 注册企业账户（推荐）

2. **安装 AWS CLI**
   ```bash
   # Windows (使用 MSI 安装器)
   https://aws.amazon.com/cli/

   # 配置 AWS CLI
   aws configure
   # 输入:
   # - AWS Access Key ID
   # - AWS Secret Access Key
   # - Default region: eu-central-1 (法兰克福，德国)
   # - Default output format: json
   ```

3. **安装其他工具**
   ```bash
   # Docker Desktop (Windows)
   https://www.docker.com/products/docker-desktop

   # AWS CDK (可选，用于基础设施即代码)
   npm install -g aws-cdk
   ```

---

### 第 2 步：创建 S3 存储桶和 CloudFront

#### 2.1 图片存储桶
```bash
# 创建 S3 存储桶（图片）
aws s3 mb s3://baustelle-images-$(aws sts get-caller-identity --query Account --output text) --region eu-central-1

# 配置 CORS
aws s3api put-bucket-cors --bucket baustelle-images-YOUR_ACCOUNT_ID --cors-configuration file://aws/s3-cors.json
```

创建 `aws/s3-cors.json`:
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

#### 2.2 前端存储桶
```bash
# 创建前端存储桶
aws s3 mb s3://baustelle-frontend-$(aws sts get-caller-identity --query Account --output text) --region eu-central-1

# 启用静态网站托管
aws s3 website s3://baustelle-frontend-YOUR_ACCOUNT_ID --index-document index.html --error-document index.html
```

#### 2.3 部署 CloudFormation 栈
```bash
# 使用 CloudFormation 一键部署基础设施
cd aws
aws cloudformation create-stack \
  --stack-name baustelle-infrastructure \
  --template-body file://cloudformation-template.yml \
  --parameters ParameterKey=Environment,ParameterValue=production \
  --capabilities CAPABILITY_IAM \
  --region eu-central-1

# 查看部署进度
aws cloudformation describe-stacks --stack-name baustelle-infrastructure
```

---

### 第 3 步：配置 ECR (Docker 镜像仓库)

```bash
# 创建 ECR 仓库
aws ecr create-repository \
  --repository-name baustelle-backend \
  --region eu-central-1

# 获取登录命令
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.eu-central-1.amazonaws.com

# 构建并推送 Docker 镜像
cd backend
docker build -t baustelle-backend .
docker tag baustelle-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.eu-central-1.amazonaws.com/baustelle-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.eu-central-1.amazonaws.com/baustelle-backend:latest
```

---

### 第 4 步：配置 Secrets Manager

```bash
# 存储敏感配置
aws secretsmanager create-secret \
  --name baustelle/supabase-url \
  --secret-string "https://euxerhrjoqawcplejpjj.supabase.co" \
  --region eu-central-1

aws secretsmanager create-secret \
  --name baustelle/supabase-key \
  --secret-string "YOUR_SUPABASE_ANON_KEY" \
  --region eu-central-1

aws secretsmanager create-secret \
  --name baustelle/supabase-service-key \
  --secret-string "YOUR_SUPABASE_SERVICE_KEY" \
  --region eu-central-1

aws secretsmanager create-secret \
  --name baustelle/s3-bucket \
  --secret-string "baustelle-images-YOUR_ACCOUNT_ID" \
  --region eu-central-1
```

---

### 第 5 步：部署 ECS 服务

#### 5.1 创建 IAM 角色

创建 `ecsTaskExecutionRole` (如果不存在):
```bash
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file://aws/ecs-trust-policy.json

aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
```

#### 5.2 注册 ECS 任务定义

更新 `aws/ecs-task-definition.json` 中的占位符，然后：
```bash
aws ecs register-task-definition \
  --cli-input-json file://aws/ecs-task-definition.json \
  --region eu-central-1
```

#### 5.3 创建 ECS 服务

```bash
aws ecs create-service \
  --cluster baustelle-cluster \
  --service-name baustelle-backend-service \
  --task-definition baustelle-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=baustelle-backend,containerPort=8000" \
  --region eu-central-1
```

---

### 第 6 步：部署前端

```bash
cd frontend

# 构建生产版本
npm run build

# 部署到 S3
aws s3 sync dist/ s3://baustelle-frontend-YOUR_ACCOUNT_ID --delete

# 创建 CloudFront 失效
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

---

### 第 7 步：配置自动扩展

创建 `aws/autoscaling-config.json`:
```json
{
  "ServiceName": "baustelle-backend-service",
  "ScalableDimension": "ecs:service:DesiredCount",
  "MinCapacity": 2,
  "MaxCapacity": 10,
  "TargetValue": 70.0,
  "ScaleOutCooldown": 60,
  "ScaleInCooldown": 180
}
```

```bash
# 注册可扩展目标
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/baustelle-cluster/baustelle-backend-service \
  --min-capacity 2 \
  --max-capacity 10 \
  --region eu-central-1

# 创建扩展策略 (基于 CPU)
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/baustelle-cluster/baustelle-backend-service \
  --policy-name cpu-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://aws/autoscaling-config.json
```

---

## 环境变量配置

### 后端环境变量 (存储在 Secrets Manager)

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase anon key | `eyJhbG...` |
| `SUPABASE_SERVICE_KEY` | Supabase service key | `eyJhbG...` |
| `AWS_ACCESS_KEY_ID` | AWS 访问密钥 | 自动从 IAM 角色获取 |
| `AWS_SECRET_ACCESS_KEY` | AWS 密钥 | 自动从 IAM 角色获取 |
| `S3_BUCKET_NAME` | S3 存储桶名 | `baustelle-images-xxx` |
| `CLOUDFRONT_DOMAIN` | CloudFront 域名 | `d111111abcdef8.cloudfront.net` |

### 前端环境变量 (构建时)

在 `frontend/.env.production` 创建：
```env
VITE_SUPABASE_URL=https://euxerhrjoqawcplejpjj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=https://api.你的域名.com
```

---

## 域名配置（可选）

### 1. 在 Route 53 配置域名

```bash
# 为 ALB 创建记录
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch file://aws/route53-api.json

# 为 CloudFront 创建记录
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch file://aws/route53-frontend.json
```

### 2. 申请 SSL 证书

```bash
# 使用 ACM 申请免费 SSL 证书
aws acm request-certificate \
  --domain-name app.你的域名.com \
  --domain-name api.你的域名.com \
  --validation-method DNS \
  --region eu-central-1
```

---

## 监控和日志

### CloudWatch 日志

```bash
# 查看后端日志
aws logs tail /ecs/baustelle-backend --follow

# 查看 Redis 日志
aws logs tail /ecs/baustelle-redis --follow
```

### CloudWatch 指标

在 AWS Console 查看：
- ECS → Clusters → baustelle-cluster → Metrics
- Application Load Balancer → Monitoring
- S3 → Metrics
- CloudFront → Monitoring

---

## CI/CD 自动部署 (GitHub Actions)

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-central-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: baustelle-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster baustelle-cluster \
            --service baustelle-backend-service \
            --force-new-deployment

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Build frontend
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
        run: |
          cd frontend
          npm ci
          npm run build

      - name: Deploy to S3
        run: |
          aws s3 sync frontend/dist/ s3://baustelle-frontend-${{ secrets.AWS_ACCOUNT_ID }} --delete

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

---

## 安全最佳实践

1. **使用 VPC 隔离**：ECS 任务运行在私有子网中
2. **Secrets Manager**：所有敏感信息存储在 Secrets Manager
3. **IAM 角色**：使用最小权限原则
4. **HTTPS Only**：强制使用 HTTPS（CloudFront + ACM）
5. **WAF**：为 CloudFront 配置 AWS WAF 防火墙
6. **定期备份**：S3 启用版本控制

---

## 故障排查

### 后端无法启动
```bash
# 查看 ECS 任务日志
aws ecs describe-tasks --cluster baustelle-cluster --tasks TASK_ID

# 查看 CloudWatch 日志
aws logs tail /ecs/baustelle-backend --follow
```

### 图片上传失败
- 检查 S3 存储桶权限
- 检查 IAM 角色是否有 S3 写入权限
- 查看后端日志中的错误

### 前端空白页面
- 检查环境变量是否正确
- 查看浏览器控制台错误
- 检查 API URL 是否可访问

---

## 成本优化建议

1. **使用 Savings Plans**：ECS Fargate 节省 20-30%
2. **S3 Intelligent-Tiering**：自动将旧图片移到低成本存储
3. **CloudFront 缓存优化**：减少源站请求
4. **定时任务关闭开发环境**：非工作时间关闭测试环境
5. **监控告警**：设置预算告警避免意外费用

---

## 下一步

- [ ] 配置自定义域名和 SSL 证书
- [ ] 设置 CloudWatch 告警（CPU、内存、错误率）
- [ ] 配置 AWS WAF 防火墙
- [ ] 启用 AWS Backup 自动备份
- [ ] 配置多区域灾备（如需要）

需要帮助？创建 GitHub Issue 或联系技术支持。
