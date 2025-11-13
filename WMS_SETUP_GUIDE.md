# WMS (仓库管理系统) 设置指南

## 📦 功能概述

你的系统现在已经具备完整的WMS功能：

### ✅ 已完成的功能

1. **条码/二维码扫描**
   - 手机摄像头扫描
   - 手动输入条码
   - 支持多种条码格式 (QR Code, EAN-13, Code128等)

2. **库位管理**
   - 货架位置管理 (如2A, 13B1)
   - 区域分类
   - 多库位库存

3. **出入库操作**
   - 扫码入库
   - 扫码出库
   - 实时库存更新
   - 完整操作历史

4. **低库存提醒**
   - 自动检测低库存
   - 一键生成采购申请

5. **数据库结构**
   - storage_locations (库位表)
   - inventory (库存表)
   - inventory_transactions (出入库记录)
   - purchase_requests (采购申请)

## 🚀 部署步骤

### 第一步：运行数据库SQL

1. 登录 Supabase (https://supabase.com/)
2. 选择你的项目
3. 点击左侧 "SQL Editor"
4. 打开文件 `/Users/yuqiao/baustelle-system/database/wms_setup.sql`
5. 复制全部内容
6. 粘贴到 Supabase SQL Editor
7. 点击 "Run" 按钮执行

**这将创建**：
- 4个新表
- 2个视图
- 自动触发器
- 示例库位数据

### 第二步：添加前端路由

需要在前端路由配置中添加WMS页面。

打开 `/Users/yuqiao/baustelle-system/frontend/src/App.jsx`，添加新路由：

```javascript
import InventoryScan from './pages/lager/InventoryScan'

// 在 Routes 中添加：
<Route path="/lager/scan" element={<PrivateRoute><Layout><InventoryScan /></Layout></PrivateRoute>} />
```

### 第三步：添加导航菜单

打开 `/Users/yuqiao/baustelle-system/frontend/src/components/Layout.jsx`

在 `lagerLinks` 数组中添加：

```javascript
import { Scan } from 'lucide-react'  // 在顶部导入

const lagerLinks = [
  { to: '/lager', icon: Home, label: 'Dashboard' },
  { to: '/lager/requests', icon: FileText, label: 'Alle Anfragen' },
  { to: '/lager/inventory', icon: Package, label: 'Lagerbestand' },
  { to: '/lager/scan', icon: Camera, label: 'Scannen' },  // 新增这一行
  { to: '/lager/statistics', icon: BarChart3, label: 'Statistiken' },
]
```

### 第四步：提交到Git并部署

```bash
cd /Users/yuqiao/baustelle-system

# 添加所有文件
git add .

# 提交
git commit -m "Add WMS (Warehouse Management System) features

- 添加条码/二维码扫描功能
- 实现出入库操作
- 库位管理
- 低库存提醒
- 采购申请自动生成"

# 推送到GitHub (Railway会自动部署)
git push origin main
```

## 📱 如何使用

### 场景1：首次盘点（初始化库存）

1. 准备物料和标签
2. 访问 `/lager/scan`
3. 扫描物料条码
4. 选择 "Einlagerung" (入库)
5. 选择库位 (如 "2A")
6. 输入数量 (如 30)
7. 点击 "Bestätigen"

### 场景2：日常出库（材料发放）

1. 访问 `/lager/scan`
2. 扫描物料条码
3. 看到当前库存信息
4. 选择 "Auslagerung" (出库)
5. 选择库位
6. 输入出库数量
7. 填写备注 (如 "GSW_Kamen工地使用")
8. 点击 "Bestätigen"

### 场景3：补货采购

1. 系统自动检测低库存
2. 在仓库Dashboard显示警告
3. 点击 "生成采购申请"
4. 系统自动创建采购单
5. 采购部门收到通知

## 🏷️ 条码管理

### 如果物料已有条码

直接使用现有的条码/二维码，扫描即可。

### 如果物料没有条码

**方案1：在线生成并打印**

```javascript
// 系统已安装 qrcode 库
// 可以在系统中为每个物料生成二维码
// 打印在标签纸上贴在物料上
```

**方案2：购买条码打印机**

- 热敏打印机 (~€100-200)
- 标签纸 (~€20/1000张)
- 可以批量打印

**方案3：使用在线服务**

- 访问 https://www.labelary.com/
- 生成条码图片
- 打印在A4纸上
- 剪下贴在物料上

## 📊 数据库表结构

### storage_locations (库位表)

```sql
id          UUID
name        TEXT        -- 例如: "2A", "13B1"
description TEXT        -- 描述
zone        TEXT        -- 区域
is_active   BOOLEAN
```

### inventory (库存表)

```sql
id          UUID
item_id     UUID        -- 物料ID
location_id UUID        -- 库位ID
quantity    DECIMAL     -- 数量
updated_at  TIMESTAMP
```

### inventory_transactions (出入库记录)

```sql
id               UUID
item_id          UUID
location_id      UUID
transaction_type TEXT   -- 'in', 'out', 'adjust', 'initial'
quantity         DECIMAL
before_quantity  DECIMAL
after_quantity   DECIMAL
operator_id      UUID   -- 操作人
notes            TEXT
created_at       TIMESTAMP
```

### purchase_requests (采购申请)

```sql
id             UUID
request_number TEXT    -- 例如: "PR-20250113-001"
item_id        UUID
quantity       DECIMAL
reason         TEXT    -- "低库存自动触发"
status         TEXT    -- 'pending', 'approved', 'ordered'
created_by     UUID
```

## 🔧 API端点

### WMS API (所有以 `/api/wms/` 开头)

```
GET    /api/wms/locations          # 获取所有库位
POST   /api/wms/locations          # 创建库位

GET    /api/wms/barcode/:barcode   # 通过条码搜索物料

GET    /api/wms/inventory          # 获取库存
GET    /api/wms/inventory/summary  # 库存摘要
GET    /api/wms/inventory/low-stock # 低库存物料

POST   /api/wms/transactions       # 创建出入库记录
GET    /api/wms/transactions       # 获取记录

POST   /api/wms/purchase-requests  # 创建采购申请
GET    /api/wms/purchase-requests  # 获取采购申请
```

## 🎯 下一步开发（可选）

如果需要更多功能，我可以帮你添加：

1. **库存盘点页面** - 批量盘点和调整
2. **库位管理页面** - 可视化管理货架
3. **统计报表** - 出入库统计图表
4. **移动端优化** - PWA全屏模式
5. **打印功能** - 二维码标签打印
6. **低库存Dashboard** - 实时监控面板

## 📞 需要帮助？

如果遇到问题，检查：

1. ✅ Supabase SQL是否成功执行？
2. ✅ 前端路由是否正确添加？
3. ✅ 导航菜单是否显示 "Scannen"？
4. ✅ Railway是否已重新部署？

## 🎉 完成！

现在你的系统已经具备完整的仓库管理功能！

- ✅ 扫码出入库
- ✅ 实时库存管理
- ✅ 低库存提醒
- ✅ 采购申请自动生成
- ✅ 完整操作历史
