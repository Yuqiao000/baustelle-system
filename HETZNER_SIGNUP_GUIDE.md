# Hetzner 注册和登录详细指南

## 🎯 目标

注册 Hetzner Cloud 账号并创建第一台服务器（CX23: €3.56/月，4GB RAM）

---

## 📝 步骤 1：注册账号（5分钟）

### 1.1 访问 Hetzner Cloud 官网

在浏览器打开：
```
https://www.hetzner.com/cloud
```

### 1.2 点击注册

- 页面右上角找到 **"Login"** 按钮
- 点击后，再点击 **"Sign up"**（注册）

### 1.3 填写注册信息

```
Email:           您的邮箱（建议用 Gmail）
Password:        设置强密码（至少 8 位）
Confirm Password: 再次输入密码

First Name:      您的名字
Last Name:       您的姓氏
Company:         公司名（可选，个人用户可留空）

Country:         Germany（德国）
City:            您所在的城市
Postal Code:     邮编
Street:          街道地址
```

**⚠️ 重要提示：**
- 地址要真实，后续可能需要验证
- 建议填写德国地址（如果您在德国）

### 1.4 同意条款

- ✅ 勾选 "I have read and agree to the Terms and Conditions"
- ✅ 勾选 "I have read and agree to the Privacy Policy"

### 1.5 完成注册

- 点击 **"Sign up"** 按钮
- 等待验证邮件

### 1.6 验证邮箱

1. 打开您的邮箱
2. 找到来自 Hetzner 的邮件（主题：Verify your email address）
3. 点击邮件中的验证链接
4. 自动跳转到登录页面

---

## 🔐 步骤 2：登录 Cloud Console（2分钟）

### 2.1 访问 Cloud Console

⚠️ **重要：使用这个网址，不是其他的！**

```
https://console.hetzner.cloud
```

### 2.2 输入登录信息

```
Email:    您注册时用的邮箱
Password: 您设置的密码
```

### 2.3 点击 "Login"

---

## 💳 步骤 3：添加支付方式（3分钟）

首次登录会要求添加支付方式。

### 3.1 选择支付方式

**选项 1：信用卡/借记卡**（最简单）
```
Card Number:     卡号
Expiry Date:     有效期（MM/YY）
CVC:            安全码（卡背面 3 位数字）
Cardholder Name: 持卡人姓名
```

**选项 2：SEPA 银行转账**（欧洲用户）
```
Account Holder:  账户持有人
IBAN:           国际银行账号
BIC:            银行识别码
```

**选项 3：PayPal**
- 点击 PayPal 图标
- 登录 PayPal 授权

### 3.2 验证支付方式

- Hetzner 会尝试扣除 €1（用于验证）
- 验证成功后会立即退回
- 不用担心，这不是实际费用

### 3.3 完成验证

看到 ✅ "Payment method verified" 表示成功

---

## 🏗️ 步骤 4：创建项目（1分钟）

### 4.1 创建新项目

首次登录会自动提示创建项目：

```
Project Name: baustelle-prod
```

点击 **"Create Project"**

### 4.2 项目创建完成

现在您会看到空的项目面板：

```
┌─────────────────────────────────────┐
│ baustelle-prod                      │
├─────────────────────────────────────┤
│ Servers (0)                        │
│                                     │
│ No servers yet                     │
│                                     │
│ [+ Add Server]  ← 点这里创建服务器 │
│                                     │
└─────────────────────────────────────┘
```

---

## 🖥️ 步骤 5：创建服务器（5分钟）

### 5.1 点击 "Add Server"

### 5.2 选择机房位置

**Location（位置）：**
```
推荐：
├── Nuremberg (纽伦堡) ⭐
├── Falkenstein (法尔肯斯坦) ⭐
└── Helsinki (赫尔辛基)

不推荐：
├── Ashburn (美国)
├── Hillsboro (美国)
└── Singapore (新加坡)
```

**建议选择：Nuremberg（nbg1）** - 德国本土，速度最快

### 5.3 选择镜像

**Image（操作系统）：**
```
Ubuntu 22.04 ⭐ （推荐）
```

不要选择其他（如 Debian、CentOS），教程基于 Ubuntu。

### 5.4 选择服务器类型

**Type（类型）：**

点击 **"Shared vCPU"** 标签（不是 Dedicated）

选择：**CX23** ⭐ 2024 新套餐！
```
├── 2 vCPU (x86)
├── 4 GB RAM
├── 40 GB SSD Storage
├── 20 TB Traffic
└── €3.56/月 (含税约 €4.23/月)
```

**为什么选 CX23？**
- ✅ 最便宜：€3.56/月
- ✅ 4GB RAM（比 CPX11 多一倍）
- ✅ x86 架构（兼容性最好）

### 5.5 配置网络

**Networking:**
```
✅ Public IPv4 (必选)
✅ Public IPv6 (可选)
```

### 5.6 添加 SSH Key（推荐）

**方式 1：使用密码（简单）**
- 不选 SSH Key
- 服务器创建后会通过邮件发送 root 密码

**方式 2：使用 SSH Key（安全）**

如果您有 SSH Key：
- 点击 **"Add SSH key"**
- 粘贴您的公钥
- 命名：`my-laptop`

如何生成 SSH Key（Windows）：
```powershell
# 在 PowerShell 中运行
ssh-keygen -t rsa -b 4096

# 查看公钥
cat ~/.ssh/id_rsa.pub

# 复制显示的内容
```

### 5.7 防火墙（稍后配置）

**Firewalls:**
- 暂时跳过
- 后续通过控制台配置

### 5.8 备份（可选）

**Backups:**
```
❌ 不勾选（额外收费 +20%）
```

手动备份就够了，不需要自动备份。

### 5.9 卷（不需要）

**Volumes:**
```
❌ 不添加（额外收费）
```

40GB 存储完全够用。

### 5.10 命名服务器

**Server name:**
```
baustelle-prod
```

### 5.11 创建！

点击右下角 **"Create & Buy now"** 按钮

---

## ⏱️ 步骤 6：等待服务器创建（1分钟）

### 6.1 创建进度

您会看到进度条：
```
Creating server... 10%
Installing Ubuntu... 50%
Configuring network... 80%
Server ready! ✅ 100%
```

### 6.2 获取服务器信息

创建完成后，记下以下信息：

```
Server Name:    baustelle-prod
IP Address:     123.45.67.89 (示例)
Status:         ✅ Running
Location:       Nuremberg (nbg1)
Type:           CX23
Cost:           €3.56/月
```

### 6.3 获取 Root 密码

**如果您没有添加 SSH Key：**
- 检查您的邮箱
- 找到主题为 "Hetzner Cloud: Your new server" 的邮件
- 邮件中包含：
  ```
  IP Address: 123.45.67.89
  Root Password: xxxxxxxx
  ```

**如果您添加了 SSH Key：**
- 直接用 SSH Key 连接，不需要密码

---

## 🔌 步骤 7：连接到服务器（2分钟）

### 方式 1：使用浏览器 SSH（最简单）

1. 在 Hetzner Cloud Console
2. 点击您的服务器名称 `baustelle-prod`
3. 点击右上角 **"Console"** 按钮
4. 在浏览器中打开终端
5. 输入：`root`（用户名）
6. 输入邮件中的密码

### 方式 2：使用 Windows Terminal（推荐）

**使用密码连接：**
```powershell
ssh root@123.45.67.89

# 首次连接提示：
Are you sure you want to continue connecting (yes/no)?
# 输入：yes

# 输入邮件中的 root 密码
```

**使用 SSH Key 连接：**
```powershell
ssh -i ~/.ssh/id_rsa root@123.45.67.89
```

### 连接成功！

看到这样的提示表示成功：
```
Welcome to Ubuntu 22.04.3 LTS
root@baustelle-prod:~#
```

---

## ✅ 检查清单

确认以下步骤都完成：

- [ ] ✅ 注册了 Hetzner 账号
- [ ] ✅ 验证了邮箱
- [ ] ✅ 添加了支付方式（验证成功）
- [ ] ✅ 登录了 Cloud Console
- [ ] ✅ 创建了项目 `baustelle-prod`
- [ ] ✅ 创建了服务器（CX23, €3.56/月）
- [ ] ✅ 服务器状态为 Running
- [ ] ✅ 记下了 IP 地址
- [ ] ✅ 能通过 SSH 连接到服务器

---

## 🎉 完成！

现在您已经成功创建了 Hetzner 服务器！

**下一步：**
按照 [HETZNER_DEPLOYMENT.md](./HETZNER_DEPLOYMENT.md) 部署您的 Baustelle 系统。

---

## 🚨 常见问题

### Q1: 支付验证失败？

**答：** 可能原因：
- 信用卡信息填写错误
- 银行拒绝了 €1 验证扣款
- 卡片没有开通国际支付

**解决：**
- 检查卡号、有效期、CVC
- 联系银行开通国际支付
- 尝试使用 PayPal

---

### Q2: 无法 SSH 连接？

**答：** 检查：
```bash
# 1. 检查服务器状态（应该是 Running）
# 2. 检查 IP 地址是否正确
# 3. 检查网络连接

# 测试连通性
ping 123.45.67.89

# 如果 ping 不通，检查防火墙
```

---

### Q3: 忘记 Root 密码？

**答：**
1. 在 Cloud Console
2. 点击服务器
3. 点击右上角 **"···"** → **"Reset root password"**
4. 新密码会发送到邮箱

---

### Q4: 服务器创建失败？

**答：** 可能原因：
- 支付方式未验证
- 账户余额不足
- 所选机房资源不足

**解决：**
- 重新验证支付方式
- 尝试选择其他机房（Falkenstein）

---

### Q5: 我不在 Cloud Console 页面？

**答：** 确认您的网址是：
```
✅ https://console.hetzner.cloud  （正确）
❌ https://robot.hetzner.com      （错误，这是物理服务器）
❌ https://konsoleh.hetzner.com   （错误，旧版）
```

---

## 📞 需要帮助？

如果遇到问题：
1. 截图发给我
2. 告诉我在哪一步卡住了
3. 我会帮您解决！

现在可以继续部署您的系统了！🚀
