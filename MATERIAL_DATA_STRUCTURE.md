# 材料数据结构说明

## ✅ 已完成的更改

### 1. 清理工作
- ❌ 删除所有中文内容
- ❌ 删除所有示例材料（Winkelschleifer, Zement, Schrauben M8, Sand, Kabel NYM, Bagger, Bohrmaschine）
- ✅ 所有通知消息改为德语

### 2. 新的类别结构

#### 顶级类别：Rohrsysteme（管道系统）
包含以下子类别：

| 子类别 | 类型 | 说明 |
|--------|------|------|
| Rohrverbund | material | 主体管道 |
| Verbindungselemente | material | 连接件（Verbinder, Endekappe） |
| Warnmaterialien | material | 警示材料（Trassenwarnband） |
| Markierungsmaterial | material | 标识材料（Fähnchen） |

### 3. 项目信息

**Projekt Bergkamen**
- 地址：Bergkamen Straße 1
- 城市：Bergkamen
- 邮编：59192
- 联系人：Max Mustermann
- 电话：+49 231 12345678

### 4. 材料清单

#### Rohrverbund（主体管道）

##### A. Rohrverbund 12x10/6 - Trommel 1
- **Gesamtlänge (卷筒总长)**：2000m
- **Rest (剩余)**：979m
- **已使用**：1021m
- **单位**：m (米)
- **最低库存**：100m

##### B. Rohrverbund 7x16/12 - Trommel 1
- **Gesamtlänge (卷筒总长)**：1000m
- **Rest (剩余)**：298m
- **已使用**：702m
- **单位**：m (米)
- **最低库存**：100m
- ⚠️ **状态**：接近最低库存值

#### Zubehör（配件）

##### C. Verbinder für Rohrverbund（连接件）
- **类别**：Verbindungselemente
- **当前库存**：0 Stück
- **最低库存**：10 Stück
- **说明**：用于管道连接

##### D. Endekappe für Rohrverbund（封头）
- **类别**：Verbindungselemente
- **当前库存**：0 Stück
- **最低库存**：10 Stück
- **说明**：用于封闭管道末端

##### E. Trassenwarnband（管沟警示带）
- **类别**：Warnmaterialien
- **当前库存**：0m
- **最低库存**：50m
- **说明**：用于标识管道沟

##### F. Fähnchen zur Rohrkennzeichnung（标识旗）
- **类别**：Markierungsmaterial
- **当前库存**：0 Stück
- **最低库存**：20 Stück
- **说明**：用于管道标识

---

## 📊 数据录入规则

### Trommel 录入规则
- ✅ **每个 Trommel 单独录入**为一个条目
- ✅ 名称格式：`Rohrverbund 规格 - Trommel 编号`
- ✅ Description 字段：`Gesamtlänge: XXXXm`
- ✅ stock_quantity 字段：当前剩余长度（Rest）

### 字段说明
| 数据库字段 | 德语术语 | 说明 | 示例 |
|-----------|---------|------|------|
| name | Material Name | 材料名称 | Rohrverbund 12x10/6 - Trommel 1 |
| description | Gesamtlänge | 卷筒总长度 | Gesamtlänge: 2000m |
| stock_quantity | Rest | 当前剩余长度 | 979 |
| unit | Einheit | 计量单位 | m |
| min_stock_level | Mindestbestand | 最低库存 | 100 |

---

## 🗂️ 类别层级结构

```
Rohrsysteme (管道系统)
├── Rohrverbund (主体管道)
│   ├── Rohrverbund 12x10/6 - Trommel 1
│   └── Rohrverbund 7x16/12 - Trommel 1
│
├── Verbindungselemente (连接件)
│   ├── Verbinder für Rohrverbund
│   └── Endekappe für Rohrverbund
│
├── Warnmaterialien (警示材料)
│   └── Trassenwarnband
│
└── Markierungsmaterial (标识材料)
    └── Fähnchen zur Rohrkennzeichnung
```

---

## 📝 如何添加新的 Trommel

当您需要添加新的卷筒时，按以下格式录入：

```sql
INSERT INTO items (
  category_id,
  name,
  type,
  unit,
  description,
  stock_quantity,
  min_stock_level,
  is_active
)
SELECT
  c.id,
  'Rohrverbund 12x10/6 - Trommel 2',  -- 新卷筒编号
  'material',
  'm',
  'Gesamtlänge: 2000m',                -- 卷筒总长度
  2000,                                 -- 初始剩余长度 = 总长度
  100
FROM categories c WHERE c.name = 'Rohrverbund';
```

---

## 🎯 使用场景

### 场景 1：查看某个规格的所有卷筒
- 在 Materialien 页面搜索：`Rohrverbund 12x10/6`
- 将显示所有该规格的卷筒及其剩余长度

### 场景 2：检查低库存卷筒
- 使用 Filter：Lagerstand = "Niedrig"
- 将显示所有剩余长度低于最低库存的卷筒

### 场景 3：记录材料使用
- 工人申请材料时，指定卷筒编号
- 系统自动更新该卷筒的 stock_quantity（剩余长度）

---

## 📂 相关文件

- `database/schema.sql` - 主数据库结构（已清理，无示例材料）
- `database/add_initial_data.sql` - 初始化数据脚本
- `frontend/src/pages/lager/MaterialienNew.jsx` - 材料管理页面（纯德语）

---

## ⚙️ 执行初始化

要将这些数据添加到数据库，需要执行：

```bash
# 连接到 Supabase 数据库后执行
psql -h your-db-host -U postgres -d your-db-name -f database/add_initial_data.sql
```

或通过 Supabase Dashboard 的 SQL Editor 执行 `add_initial_data.sql` 文件内容。

---

**创建日期**：2025-12-09
**状态**：✅ 准备就绪，等待数据库执行
