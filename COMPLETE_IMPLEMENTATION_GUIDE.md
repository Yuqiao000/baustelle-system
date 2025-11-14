# 完整实现指南：图片上传 + 采购端

## 🎯 目标
1. 工人端添加图片上传功能
2. 完整实现采购端（Einkaufs）系统

---

## Part 1: 图片上传功能

### 步骤 1: 设置 Supabase Storage

**在 Supabase 控制台操作：**
1. 登录 https://supabase.com
2. 选择你的项目
3. 左侧菜单选择 **Storage**
4. 点击 **New bucket**
5. 名称输入: `request-images`
6. 选择 **Public bucket**
7. 点击 **Create bucket**
8. 进入 bucket 设置 **Policies**，添加上传策略

### 步骤 2: 运行数据库迁移

在 Supabase SQL Editor 中执行：
```bash
/Users/yuqiao/baustelle-system/database/add_image_upload.sql
```

### 步骤 3: 更新 CreateRequest.jsx

在文件顶部添加新的 icon 导入：
```jsx
import { Camera, X, Image as ImageIcon } from 'lucide-react'
```

在 formData state 中添加 images 数组：
```jsx
const [formData, setFormData] = useState({
  // ...existing fields
  images: [], // 新增
})

const [uploading, setUploading] = useState(false) // 新增
```

添加图片上传处理函数：
```jsx
const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files)
  if (files.length === 0) return

  if (files.length + formData.images.length > 5) {
    alert('最多上传5张图片')
    return
  }

  setUploading(true)
  const uploadFormData = new FormData()
  files.forEach(file => uploadFormData.append('files', file))

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/uploads/images`, {
      method: 'POST',
      body: uploadFormData
    })
    const data = await response.json()

    if (data.success && data.uploaded.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...data.uploaded]
      }))
      alert(`Erfolgreich ${data.success_count} Bild(er) hochgeladen`)
    }
  } catch (error) {
    console.error('Upload error:', error)
    alert('Fehler beim Hochladen der Bilder')
  } finally {
    setUploading(false)
    e.target.value = ''
  }
}

const handleRemoveImage = (index) => {
  setFormData(prev => ({
    ...prev,
    images: prev.images.filter((_, i) => i !== index)
  }))
}
```

在表单中添加图片上传UI（在 Notes 字段之前）：
```jsx
{/* Image Upload Section */}
<div className="border-t-2 border-gray-100 pt-6">
  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
    <Camera className="h-5 w-5 text-blue-600" />
    Bilder hochladen (Optional)
  </label>
  <p className="text-xs text-gray-500 mb-3">
    📸 Wenn Sie den Namen des Materials nicht kennen, laden Sie einfach ein Foto hoch
  </p>

  <input
    type="file"
    accept="image/*"
    multiple
    onChange={handleImageUpload}
    className="hidden"
    id="image-upload"
    disabled={uploading || formData.images.length >= 5}
  />

  <label
    htmlFor="image-upload"
    className={`cursor-pointer inline-flex items-center px-6 py-3 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition-all ${
      uploading || formData.images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
    }`}
  >
    <ImageIcon className="h-5 w-5 text-blue-600 mr-2" />
    <span className="text-blue-600 font-medium">
      {uploading ? 'Hochladen...' : `Bilder auswählen (${formData.images.length}/5)`}
    </span>
  </label>

  {/* Image Preview */}
  {formData.images.length > 0 && (
    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
      {formData.images.map((img, index) => (
        <div key={index} className="relative group">
          <img
            src={img.url}
            alt={img.filename}
            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={() => handleRemoveImage(index)}
            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg truncate">
            {img.filename}
          </div>
        </div>
      ))}
    </div>
  )}
</div>
```

更新 handleSubmit 中的 requestData：
```jsx
const requestData = {
  // ...existing fields
  images: formData.images.map(img => ({
    url: img.url,
    filename: img.filename,
    size: img.size
  }))
}
```

### 步骤 4: 更新 RequestDetails 显示图片

在 RequestDetails.jsx 中添加图片显示区域（在合适的位置）：
```jsx
{/* Images Section */}
{request.images && request.images.length > 0 && (
  <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
      <ImageIcon className="h-5 w-5 text-blue-600" />
      Hochgeladene Bilder
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {request.images.map((img, index) => (
        <a
          key={index}
          href={img.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <img
            src={img.url}
            alt={`Material ${index + 1}`}
            className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition group-hover:shadow-lg"
          />
          <p className="text-xs text-gray-500 mt-1 truncate">{img.filename}</p>
        </a>
      ))}
    </div>
  </div>
)}
```

---

## Part 2: 采购端 (Einkaufs) 系统

### 步骤 1: 运行采购数据库脚本

在 Supabase SQL Editor 中执行：
```bash
/Users/yuqiao/baustelle-system/database/einkaufs_setup.sql
```

### 步骤 2: 添加 Einkaufs 后端 API

创建文件：`backend/app/routers/einkaufs.py`

```python
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from ..database import get_supabase
from pydantic import BaseModel
from datetime import date

router = APIRouter(prefix="/api/einkaufs", tags=["einkaufs"])

# ========== Models ==========

class SupplierBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    rating: Optional[float] = 0
    notes: Optional[str] = None

class PurchaseOrderCreate(BaseModel):
    supplier_id: str
    expected_delivery_date: Optional[date] = None
    notes: Optional[str] = None
    items: List[dict]  # [{item_id, quantity, unit_price}]

# ========== Endpoints ==========

@router.get("/suppliers")
async def get_suppliers(
    is_active: bool = True,
    db=Depends(get_supabase)
):
    """获取供应商列表"""
    query = db.table("suppliers").select("*")
    if is_active:
        query = query.eq("is_active", True)
    result = query.order("name").execute()
    return result.data

@router.post("/suppliers")
async def create_supplier(
    supplier: SupplierBase,
    db=Depends(get_supabase)
):
    """创建供应商"""
    result = db.table("suppliers").insert(supplier.dict()).execute()
    return result.data[0]

@router.get("/low-stock-items")
async def get_low_stock_items(db=Depends(get_supabase)):
    """获取低库存物料"""
    result = db.table("low_stock_items").select("*").execute()
    return result.data

@router.post("/purchase-orders")
async def create_purchase_order(
    order: PurchaseOrderCreate,
    purchaser_id: str,
    db=Depends(get_supabase)
):
    """创建采购订单"""
    # 生成订单号
    po_number_result = db.rpc("generate_po_number").execute()
    po_number = po_number_result.data

    # 计算总金额
    total_amount = sum(item['quantity'] * item['unit_price'] for item in order.items)

    # 创建订单
    order_data = {
        "order_number": po_number,
        "supplier_id": order.supplier_id,
        "purchaser_id": purchaser_id,
        "status": "ordered",
        "total_amount": total_amount,
        "expected_delivery_date": order.expected_delivery_date.isoformat() if order.expected_delivery_date else None,
        "notes": order.notes
    }

    po_result = db.table("purchase_orders").insert(order_data).execute()
    purchase_order = po_result.data[0]

    # 创建订单明细
    order_items = []
    for item in order.items:
        order_items.append({
            "purchase_order_id": purchase_order["id"],
            "item_id": item["item_id"],
            "quantity": item["quantity"],
            "unit_price": item["unit_price"]
        })

    db.table("purchase_order_items").insert(order_items).execute()

    return purchase_order

@router.get("/purchase-orders")
async def get_purchase_orders(
    status: Optional[str] = None,
    db=Depends(get_supabase)
):
    """获取采购订单列表"""
    query = db.table("purchase_order_details").select("*")
    if status:
        query = query.eq("status", status)
    result = query.order("order_date", desc=True).execute()
    return result.data

@router.get("/purchase-orders/{order_id}/items")
async def get_purchase_order_items(
    order_id: str,
    db=Depends(get_supabase)
):
    """获取采购订单明细"""
    result = db.table("purchase_order_items").select(
        "*, items(*)"
    ).eq("purchase_order_id", order_id).execute()
    return result.data
```

### 步骤 3: 注册 Einkaufs 路由

在 `backend/app/main.py` 中：
```python
from app.routers import einkaufs  # 添加导入

app.include_router(einkaufs.router)  # 添加路由
```

### 步骤 4: 添加 Einkaufs 角色

在 Supabase 中更新 profiles 表，允许 role = 'einkaufs'

### 步骤 5: 创建前端页面

**创建文件夹结构：**
```
frontend/src/pages/einkaufs/
  - EinkaufsDashboard.jsx
  - Suppliers.jsx
  - PurchaseOrders.jsx
  - CreatePurchaseOrder.jsx
```

**EinkaufsDashboard.jsx 示例：**
```jsx
import { useState, useEffect } from 'react'
import { ShoppingCart, Package, AlertTriangle, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function EinkaufsDashboard() {
  const [lowStockItems, setLowStockItems] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [stats, setStats] = useState({
    pending_orders: 0,
    low_stock_count: 0,
    total_spent_month: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [lowStock, orders] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/einkaufs/low-stock-items`).then(r => r.json()),
        fetch(`${import.meta.env.VITE_API_URL}/api/einkaufs/purchase-orders?status=ordered`).then(r => r.json())
      ])

      setLowStockItems(lowStock.slice(0, 5))
      setRecentOrders(orders.slice(0, 5))
      setStats({
        pending_orders: orders.length,
        low_stock_count: lowStock.length,
        total_spent_month: 0 // TODO: 计算本月支出
      })
    } catch (error) {
      console.error('Load error:', error)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Einkaufs Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ausstehende Bestellungen</p>
              <p className="text-3xl font-bold text-blue-600">{stats.pending_orders}</p>
            </div>
            <ShoppingCart className="h-12 w-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Niedriger Lagerbestand</p>
              <p className="text-3xl font-bold text-orange-600">{stats.low_stock_count}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-orange-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ausgaben diesen Monat</p>
              <p className="text-3xl font-bold text-green-600">€{stats.total_spent_month.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            Niedriger Lagerbestand - Aktion erforderlich!
          </h2>
          <div className="space-y-2">
            {lowStockItems.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Aktuell: {item.current_stock} {item.unit} / Minimum: {item.min_stock} {item.unit}
                  </p>
                </div>
                <Link
                  to={`/einkaufs/purchase-orders/new?item_id=${item.id}`}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Bestellen
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Neueste Bestellungen</h2>
        {recentOrders.length > 0 ? (
          <div className="space-y-2">
            {recentOrders.map(order => (
              <div key={order.order_id} className="border-2 border-gray-100 p-4 rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{order.order_number}</p>
                    <p className="text-sm text-gray-600">{order.supplier_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">€{order.total_amount}</p>
                    <p className="text-sm text-gray-600">{order.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Keine Bestellungen</p>
        )}
      </div>
    </div>
  )
}
```

### 步骤 6: 更新 App.jsx 添加路由

```jsx
import EinkaufsDashboard from './pages/einkaufs/EinkaufsDashboard'
import Suppliers from './pages/einkaufs/Suppliers'
import PurchaseOrders from './pages/einkaufs/PurchaseOrders'

// 在 Routes 中添加
<Route path="/einkaufs" element={<EinkaufsDashboard />} />
<Route path="/einkaufs/suppliers" element={<Suppliers />} />
<Route path="/einkaufs/purchase-orders" element={<PurchaseOrders />} />
```

### 步骤 7: 更新 Layout.jsx 添加导航

```jsx
const einkaufsLinks = [
  { to: '/einkaufs', icon: Home, label: 'Dashboard' },
  { to: '/einkaufs/suppliers', icon: Users, label: 'Lieferanten' },
  { to: '/einkaufs/purchase-orders', icon: ShoppingCart, label: 'Bestellungen' },
]

// 在 links 判断中添加
const links = isWorker ? workerLinks :
              isEinkaufs ? einkaufsLinks :
              lagerLinks
```

---

## 测试清单

### 图片上传功能
- [ ] 工人可以上传图片
- [ ] 最多5张限制有效
- [ ] 图片预览正常显示
- [ ] 可以删除已上传图片
- [ ] Lager 可以在详情页看到图片
- [ ] 点击图片可以放大查看

### 采购端功能
- [ ] Einkaufs 可以登录
- [ ] 看到低库存警告
- [ ] 可以创建采购订单
- [ ] 可以管理供应商
- [ ] Lager 收到采购通知

---

## 部署步骤

1. **提交代码**
```bash
git add -A
git commit -m "Add image upload and Einkaufs system"
git push
```

2. **等待 Railway 部署**

3. **配置 Supabase**
   - 创建 request-images bucket
   - 运行数据库迁移

4. **测试功能**

---

## 技术架构

```
Frontend:
- React + React Router
- Tailwind CSS
- Lucide Icons

Backend:
- FastAPI
- Supabase (PostgreSQL + Storage)

Storage:
- Supabase Storage (images)

Database:
- PostgreSQL (Supabase)
- 6个新表用于采购系统
```

---

需要任何帮助随时告诉我！
