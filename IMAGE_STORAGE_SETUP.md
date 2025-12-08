# 图片存储配置指南 - Supabase Storage

## 📦 为什么选择 Supabase Storage？

✅ **免费 100GB** - 足够存储数万张图片
✅ **全球 CDN** - 自动加速，德国访问速度快
✅ **自动优化** - 图片压缩、格式转换
✅ **安全可靠** - RLS 权限控制
✅ **简单集成** - 已有 Supabase 账号，直接使用

---

## 💰 存储成本对比

假设您有 **10,000 张图片**：

### Supabase Storage (推荐) 🏆
```
10,000 张 × 500KB = 5GB
月存储: €0 (免费 100GB)
月流量: €0 (免费 200GB)
────────────────────
总成本: €0/月 ✨
```

### AWS S3
```
5GB 存储: $0.12/月
50GB 流量: $4.50/月
────────────────────
总成本: ~$5/月
```

### Hetzner Storage Box
```
1TB 存储: €3.81/月
无限流量: €0
────────────────────
总成本: €3.81/月
```

**结论：Supabase 最划算！**

---

## 🚀 快速配置（10分钟）

### 步骤 1：创建 Storage Buckets（2分钟）

1. **登录 Supabase**
   访问：https://supabase.com/dashboard

2. **进入您的项目**
   选择：`euxerhrjoqawcplejpjj`

3. **创建 Buckets**
   - 左侧菜单 → **Storage**
   - 点击 **"New bucket"**

创建 3 个 Buckets：

#### Bucket 1: 材料图片
```
Name:        material-images
Public:      ✅ Yes (公开访问)
File size:   10 MB
Allowed:     image/jpeg, image/png, image/webp
```

#### Bucket 2: 请求图片
```
Name:        request-images
Public:      ✅ Yes
File size:   10 MB
Allowed:     image/jpeg, image/png, image/webp
```

#### Bucket 3: 用户头像（可选）
```
Name:        avatars
Public:      ✅ Yes
File size:   5 MB
Allowed:     image/jpeg, image/png
```

---

### 步骤 2：配置 RLS 策略（3分钟）

在 Supabase SQL Editor 中运行：

```sql
-- 1. material-images: 所有人可读，Lager/Admin 可写
CREATE POLICY "Anyone can view material images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'material-images');

CREATE POLICY "Lager and Admin can upload material images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'material-images'
  AND (auth.jwt() ->> 'role' IN ('lager', 'admin'))
);

CREATE POLICY "Lager and Admin can delete material images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'material-images'
  AND (auth.jwt() ->> 'role' IN ('lager', 'admin'))
);

-- 2. request-images: 所有人可读，所有认证用户可写
CREATE POLICY "Anyone can view request images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'request-images');

CREATE POLICY "Authenticated users can upload request images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'request-images');

-- 3. avatars: 所有人可读，用户可上传自己的头像
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

### 步骤 3：更新后端代码（5分钟）

创建图片上传工具类：

```python
# backend/app/utils/storage.py
from supabase import create_client, Client
from fastapi import UploadFile, HTTPException
import os
from typing import Optional
import uuid

class StorageManager:
    def __init__(self):
        self.supabase: Client = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_KEY")
        )

    async def upload_image(
        self,
        file: UploadFile,
        bucket: str,
        folder: Optional[str] = None
    ) -> str:
        """上传图片到 Supabase Storage"""

        # 验证文件类型
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if file.content_type not in allowed_types:
            raise HTTPException(400, "只支持 JPG, PNG, WEBP 格式")

        # 验证文件大小（最大 10MB）
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(400, "图片大小不能超过 10MB")

        # 生成唯一文件名
        ext = file.filename.split('.')[-1]
        filename = f"{uuid.uuid4()}.{ext}"

        # 如果指定了文件夹
        if folder:
            path = f"{folder}/{filename}"
        else:
            path = filename

        # 上传到 Supabase
        try:
            res = self.supabase.storage.from_(bucket).upload(
                path,
                content,
                {
                    "content-type": file.content_type,
                    "cache-control": "3600",  # 缓存 1 小时
                }
            )

            # 返回公开 URL
            public_url = self.supabase.storage.from_(bucket).get_public_url(path)
            return public_url

        except Exception as e:
            raise HTTPException(500, f"上传失败: {str(e)}")

    async def delete_image(self, bucket: str, path: str) -> bool:
        """删除图片"""
        try:
            self.supabase.storage.from_(bucket).remove([path])
            return True
        except Exception as e:
            print(f"删除失败: {e}")
            return False

    def get_public_url(self, bucket: str, path: str) -> str:
        """获取公开 URL"""
        return self.supabase.storage.from_(bucket).get_public_url(path)

# 创建全局实例
storage = StorageManager()
```

---

### 步骤 4：更新材料图片 API

修改 `backend/app/routers/materials.py`：

```python
from fastapi import UploadFile, File
from app.utils.storage import storage

# 添加图片上传端点
@router.post("/{item_id}/images/upload")
async def upload_material_image(
    item_id: str,
    file: UploadFile = File(...),
    supabase: Client = Depends(get_supabase)
):
    """上传材料图片到 Supabase Storage"""

    # 上传到 Supabase Storage
    image_url = await storage.upload_image(
        file=file,
        bucket="material-images",
        folder=item_id  # 按材料 ID 分文件夹
    )

    # 保存 URL 到数据库
    result = supabase.table("item_images").insert({
        "item_id": item_id,
        "image_url": image_url,
        "is_primary": False
    }).execute()

    return {
        "message": "上传成功",
        "image_url": image_url,
        "image_id": result.data[0]["id"]
    }

# 删除图片
@router.delete("/{item_id}/images/{image_id}")
async def delete_material_image(
    item_id: str,
    image_id: str,
    supabase: Client = Depends(get_supabase)
):
    """删除材料图片"""

    # 从数据库获取图片信息
    image = supabase.table("item_images").select("*").eq("id", image_id).single().execute()

    if not image.data:
        raise HTTPException(404, "图片不存在")

    # 从 URL 提取路径
    image_url = image.data["image_url"]
    path = image_url.split("/storage/v1/object/public/material-images/")[1]

    # 从 Storage 删除
    await storage.delete_image("material-images", path)

    # 从数据库删除
    supabase.table("item_images").delete().eq("id", image_id).execute()

    return {"message": "删除成功"}
```

---

### 步骤 5：更新前端上传组件

修改 `frontend/src/pages/lager/MaterialManagement.jsx`：

```jsx
// 添加图片上传函数
const handleImageUpload = async (itemId, file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post(
      `/materials/${itemId}/images/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    alert('图片上传成功！')
    // 刷新材料详情
    fetchMaterialDetails(itemId)
  } catch (error) {
    console.error('上传失败:', error)
    alert('上传失败: ' + error.response?.data?.detail)
  }
}

// 添加文件选择器
<input
  type="file"
  accept="image/jpeg,image/png,image/webp"
  onChange={(e) => {
    const file = e.target.files[0]
    if (file) {
      handleImageUpload(selectedMaterial.id, file)
    }
  }}
  className="hidden"
  id="image-upload"
/>

<label
  htmlFor="image-upload"
  className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  上传图片
</label>
```

---

## 🎨 图片优化功能

Supabase Storage 支持自动优化！

### 自动压缩和调整大小

在获取图片 URL 时，添加参数：

```javascript
// 原图
const imageUrl = `https://euxerhrjoqawcplejpjj.supabase.co/storage/v1/object/public/material-images/image.jpg`

// 缩略图（宽度 300px）
const thumbnail = `${imageUrl}?width=300&height=300`

// 压缩质量 80%
const compressed = `${imageUrl}?quality=80`

// 转换为 WebP（更小）
const webp = `${imageUrl}?format=webp`

// 组合使用
const optimized = `${imageUrl}?width=800&quality=80&format=webp`
```

### 在前端使用

```jsx
// 材料卡片中显示缩略图
<img
  src={`${material.image_url}?width=300&quality=80&format=webp`}
  alt={material.name}
  className="w-full h-48 object-cover"
/>

// 详情页显示大图
<img
  src={`${material.image_url}?width=1200&quality=90&format=webp`}
  alt={material.name}
  className="w-full"
/>
```

**优势：**
- ✅ 自动压缩，减少流量
- ✅ WebP 格式，体积更小
- ✅ 响应式大小
- ✅ 不需要手动处理

---

## 🌍 配置 CDN 加速（可选）

如果需要更快的访问速度，可以配置 Cloudflare CDN：

### 步骤 1：添加自定义域名

在 Supabase Project Settings → Storage：

```
Custom Domain: storage.baustelle.de
```

### 步骤 2：在 Cloudflare 添加 DNS

```
类型: CNAME
名称: storage
值: [Supabase 提供的地址]
```

### 步骤 3：更新图片 URL

```javascript
// 原 URL
const oldUrl = `https://euxerhrjoqawcplejpjj.supabase.co/storage/v1/object/public/...`

// 新 URL（通过 CDN）
const newUrl = `https://storage.baustelle.de/...`
```

**优势：**
- ⚡ 更快的加载速度
- 🌍 全球 CDN 节点
- 📉 减少 Supabase 流量消耗

---

## 📊 存储监控

在 Supabase Dashboard → Storage → Usage：

可以看到：
- 📦 已用存储空间
- 📈 本月流量使用
- 📊 请求次数统计

---

## 💡 最佳实践

### 1. 图片命名规范
```
材料图片: {item_id}/{uuid}.jpg
请求图片: {request_id}/{uuid}.jpg
头像:    {user_id}/avatar.jpg
```

### 2. 图片尺寸建议
```
材料图片:    最大 1920×1080, 质量 85%
缩略图:      300×300, 质量 80%
请求图片:    最大 1280×720, 质量 80%
```

### 3. 文件格式
```
✅ 推荐: WebP (最小体积)
✅ 支持: JPG, PNG
❌ 避免: BMP, TIFF (体积大)
```

### 4. 上传前压缩

使用 JavaScript 在上传前压缩：

```javascript
// 安装: npm install browser-image-compression
import imageCompression from 'browser-image-compression'

const handleImageUpload = async (file) => {
  const options = {
    maxSizeMB: 1,          // 最大 1MB
    maxWidthOrHeight: 1920, // 最大 1920px
    useWebWorker: true
  }

  try {
    const compressed = await imageCompression(file, options)
    // 上传 compressed 而不是原文件
    uploadToSupabase(compressed)
  } catch (error) {
    console.error('压缩失败:', error)
  }
}
```

---

## 🔄 迁移现有图片

如果您已有图片需要迁移：

### 批量上传脚本

```python
# scripts/migrate_images.py
import os
from supabase import create_client
from pathlib import Path

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

def upload_images(local_dir: str, bucket: str):
    """批量上传本地图片到 Supabase"""

    for image_path in Path(local_dir).glob("**/*.jpg"):
        with open(image_path, "rb") as f:
            content = f.read()

            # 上传
            path = str(image_path.relative_to(local_dir))
            supabase.storage.from_(bucket).upload(
                path,
                content,
                {"content-type": "image/jpeg"}
            )
            print(f"已上传: {path}")

# 运行迁移
upload_images("./local_images", "material-images")
```

---

## 💰 成本估算工具

根据您的使用情况估算：

```python
# 您的数据
images_count = 10000      # 图片数量
avg_size_kb = 500         # 平均大小 KB
monthly_views = 100000    # 月访问次数

# 计算
total_storage_gb = (images_count * avg_size_kb) / (1024 * 1024)
monthly_bandwidth_gb = (monthly_views * avg_size_kb) / (1024 * 1024)

print(f"存储需求: {total_storage_gb:.2f} GB")
print(f"月流量: {monthly_bandwidth_gb:.2f} GB")

# Supabase 免费额度
if total_storage_gb < 100 and monthly_bandwidth_gb < 200:
    print("✅ 完全在免费额度内！")
else:
    print("⚠️ 需要付费套餐")
```

**示例输出：**
```
存储需求: 4.77 GB
月流量: 47.68 GB
✅ 完全在免费额度内！
```

---

## 🚨 故障排查

### 问题 1：上传失败 "Policy violation"

```bash
# 检查 RLS 策略
# 在 Supabase SQL Editor:
SELECT * FROM storage.policies WHERE bucket_id = 'material-images';
```

### 问题 2：图片无法访问

```bash
# 检查 Bucket 是否公开
# Supabase Dashboard → Storage → Bucket Settings
# 确保 "Public" 设为 ON
```

### 问题 3：上传太慢

```javascript
// 使用压缩（前端）
import imageCompression from 'browser-image-compression'

const compressed = await imageCompression(file, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920
})
```

---

## ✅ 完成检查清单

- [ ] 已创建 3 个 Storage Buckets
- [ ] RLS 策略已配置
- [ ] 后端上传 API 已实现
- [ ] 前端上传组件已集成
- [ ] 测试上传材料图片
- [ ] 测试上传请求图片
- [ ] 图片优化参数已配置
- [ ] (可选) CDN 已配置

---

## 🎉 总结

使用 Supabase Storage 的优势：

✅ **完全免费** - 100GB 存储 + 200GB 流量
✅ **已有账号** - 无需额外注册
✅ **全球 CDN** - 自动加速
✅ **图片优化** - 自动压缩转换
✅ **安全可靠** - RLS 权限控制

**月成本：€0** 🎊

有问题随时问我！🚀
