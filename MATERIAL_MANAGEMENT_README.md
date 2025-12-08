# 材料管理系统 (Material Management System)

## ✨ 功能概览

完整的材料管理解决方案，支持：

### 1. 材料主数据 (Materialstamm)
- **主名称 (Hauptname)**: 材料的唯一标识名称（如 "A1.B"）
- **Barcode**: 使用材料名称作为 barcode，方便扫描和查找
- **分类 (Kategorie)**: 德语分类系统
- **单位 (Einheit)**: 支持 m, Stück, kg 等
- **库存管理**: 最低库存量 (Min-Stock) 和当前库存 (Current Stock)

### 2. 别名系统 (Material Alias System) 🏷️
- **无限别名**: 每个材料可以添加多个别名
- **模糊匹配**: 搜索时自动匹配所有别名
- **自动纠错**: 例如 "mufe" → "Muffe"
- **智能搜索**: 支持精确匹配和模糊匹配

### 3. 图片管理 (Material Images) 📸
- **多图片上传**: 每个材料可以上传多张图片
- **主图片标记**: 标记一张图片为主图片
- **工人识别**: 帮助工人快速识别材料
- **图片描述**: 可选的图片描述字段

### 4. 智能搜索功能 🔍
- **精确匹配**:
  - 材料名称
  - Barcode
  - 别名
- **模糊匹配**:
  - 部分名称匹配
  - 部分别名匹配
  - 相似度评分排序
- **搜索结果**: 显示匹配类型和相似度

### 5. 德语分类系统
预定义分类：
- 🔌 **Kabel** (电缆和线路)
- 🔗 **Muffen** (接头和连接件)
- 🦺 **Schutzkleidung** (个人防护装备)
- 🚜 **Baumaschinen** (建筑机械和设备)
- 🔧 **Werkzeuge** (手工具)
- 🧱 **Baustoffe** (建筑材料)

## 📦 数据库表结构

### items 表 (材料主表)
```sql
- id: UUID (主键)
- category_id: UUID (分类ID)
- name: TEXT (主名称 / Hauptname)
- barcode: TEXT (条形码，唯一)
- type: TEXT (类型: material/maschine)
- unit: TEXT (单位)
- description: TEXT (描述)
- current_stock: DECIMAL (当前库存)
- min_stock: DECIMAL (最低库存)
- image_url: TEXT (主图片URL)
- is_active: BOOLEAN (是否激活)
```

### item_aliases 表 (材料别名)
```sql
- id: UUID (主键)
- item_id: UUID (材料ID，外键)
- alias: TEXT (别名)
- created_at: TIMESTAMPTZ (创建时间)
```

### item_images 表 (材料图片)
```sql
- id: UUID (主键)
- item_id: UUID (材料ID，外键)
- image_url: TEXT (图片URL)
- is_primary: BOOLEAN (是否为主图片)
- description: TEXT (图片描述，可选)
- created_at: TIMESTAMPTZ (创建时间)
```

### categories 表 (分类)
```sql
- id: UUID (主键)
- name: TEXT (分类名称)
- type: TEXT (类型: material/maschine)
- description: TEXT (描述)
- parent_id: UUID (父分类ID，支持嵌套)
- sort_order: INTEGER (排序)
- icon: TEXT (图标emoji)
```

## 🚀 部署步骤

### 1. 运行数据库升级

在 Supabase SQL Editor 中按顺序运行：

#### 步骤 1: 生成 Barcode
```bash
database/generate_barcodes.sql
```
这会为所有材料生成 barcode（使用材料名称）。

#### 步骤 2: 系统升级
```bash
database/material_management_upgrade.sql
```
这会创建：
- item_aliases 表
- item_images 表
- 更新 categories 表
- 创建搜索视图和函数
- 设置权限策略

### 2. 后端 API

后端 API 已自动注册：
- 路径: `/materials`
- 文件: `backend/app/routers/materials.py`

#### API 端点

**别名管理:**
- `GET /materials/{item_id}/aliases` - 获取别名列表
- `POST /materials/{item_id}/aliases` - 添加别名
- `DELETE /materials/{item_id}/aliases/{alias_id}` - 删除别名

**图片管理:**
- `GET /materials/{item_id}/images` - 获取图片列表
- `POST /materials/{item_id}/images` - 添加图片
- `DELETE /materials/{item_id}/images/{image_id}` - 删除图片
- `PATCH /materials/{item_id}/images/{image_id}/primary` - 设为主图片

**材料详情:**
- `GET /materials/{item_id}/detail` - 获取完整详情（含别名和图片）

**智能搜索:**
- `GET /materials/search?q={keyword}` - 搜索材料

### 3. 前端页面

访问材料管理页面：
```
http://172.20.10.9:3000/lager/materials
```

或在 Lager 端导航菜单中添加链接。

## 🎯 使用示例

### 1. 添加别名

```javascript
// 为 "Muffe" 添加常见拼写错误作为别名
POST /materials/{muffe_id}/aliases
{
  "alias": "mufe"
}

POST /materials/{muffe_id}/aliases
{
  "alias": "Kabelmuffe"
}
```

### 2. 智能搜索

```javascript
// 搜索 "mufe"，会匹配到 "Muffe"
GET /materials/search?q=mufe

// 返回结果
[
  {
    "id": "uuid",
    "name": "Muffe",
    "barcode": "Muffe",
    "category_name": "Muffen",
    "current_stock": 100,
    "unit": "Stück",
    "match_type": "exact_alias",  // 精确匹配别名
    "similarity_score": 1.0
  }
]
```

### 3. 添加图片

```javascript
POST /materials/{item_id}/images
{
  "image_url": "https://example.com/image.jpg",
  "is_primary": true,
  "description": "产品图片"
}
```

## 🔐 权限控制

所有材料管理功能：
- **查看**: 所有认证用户
- **添加/编辑/删除**: 仅 `lager` 和 `admin` 角色

## 📊 数据库函数

### search_items(search_term TEXT)

智能搜索函数，返回：
- 精确匹配（名称、barcode、别名）
- 模糊匹配（部分匹配）
- 相似度评分排序
- 限制返回 20 条结果

## 🎨 前端功能

1. **材料列表**:
   - 显示所有材料
   - 实时搜索
   - 点击查看详情

2. **材料详情模态框**:
   - 基本信息展示
   - 别名管理
   - 图片管理
   - 添加/删除功能

3. **智能搜索栏**:
   - 实时搜索
   - 显示匹配类型
   - 相似度提示

## 📝 示例数据

```sql
-- 添加材料别名示例
INSERT INTO item_aliases (item_id, alias) VALUES
  ((SELECT id FROM items WHERE name = 'Muffe' LIMIT 1), 'mufe'),
  ((SELECT id FROM items WHERE name = 'Muffe' LIMIT 1), 'muff'),
  ((SELECT id FROM items WHERE name = 'Muffe' LIMIT 1), 'Kabelmuffe');

-- 添加材料图片示例
INSERT INTO item_images (item_id, image_url, is_primary) VALUES
  ((SELECT id FROM items WHERE name = 'Muffe' LIMIT 1),
   'https://example.com/muffe.jpg',
   true);
```

## 🔧 维护建议

1. **定期清理**: 删除未使用的别名和图片
2. **别名管理**: 添加常见拼写错误作为别名
3. **图片优化**: 使用压缩后的图片以提高加载速度
4. **搜索监控**: 监控常见搜索词，添加为别名

## 🎉 完成！

你现在拥有一个功能完整的材料管理系统，支持：
- ✅ 德语分类系统
- ✅ 别名和自动纠错
- ✅ 多图片管理
- ✅ 智能模糊搜索
- ✅ Barcode 扫描集成
- ✅ 库存管理

立即在 Supabase 中运行升级脚本开始使用！🚀
