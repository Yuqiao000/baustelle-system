# 图片上传功能实现指南

## 已完成的部分

### ✅ 1. 数据库设计
- 创建了 `add_image_upload.sql`
- 添加了 `request_images` 表存储图片信息
- 添加了视图 `requests_with_images`

### ✅ 2. 后端 API
- 创建了 `uploads.py` router
- 实现了图片上传端点 `/api/uploads/image`
- 实现了批量上传端点 `/api/uploads/images`
- 图片存储在 Supabase Storage

## 待实现的部分

### 📝 3. 前端 - CreateRequest 页面

需要在 `CreateRequest.jsx` 中添加：

```jsx
import { Camera, Image as ImageIcon } from 'lucide-react'

// 在 formData state 中添加
const [formData, setFormData] = useState({
  // ...existing fields
  images: [] // 新增
})

// 添加上传图片的函数
const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files)
  if (files.length === 0) return

  if (files.length > 5) {
    alert('最多上传5张图片')
    return
  }

  setSubmitting(true)
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/uploads/images`, {
      method: 'POST',
      body: formData
    })
    const data = await response.json()

    if (data.success) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...data.uploaded]
      }))
      alert(`成功上传 ${data.success_count} 张图片`)
    }
  } catch (error) {
    console.error('Upload error:', error)
    alert('上传失败')
  } finally {
    setSubmitting(false)
  }
}

// 添加到表单中（在 Notes 字段之前）
<div className="border-t-2 border-gray-100 pt-6">
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    <Camera className="inline h-5 w-5 mr-2" />
    Bilder hochladen (Optional)
  </label>
  <p className="text-xs text-gray-500 mb-3">
    Wenn Sie den Namen des Materials nicht wissen, laden Sie ein Bild hoch
  </p>

  <input
    type="file"
    accept="image/*"
    multiple
    onChange={handleImageUpload}
    className="hidden"
    id="image-upload"
  />

  <label
    htmlFor="image-upload"
    className="cursor-pointer inline-flex items-center px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition-all"
  >
    <ImageIcon className="h-5 w-5 text-blue-600 mr-2" />
    <span className="text-blue-600 font-medium">Bilder auswählen</span>
  </label>

  {/* 已上传图片预览 */}
  {formData.images.length > 0 && (
    <div className="mt-4 grid grid-cols-3 gap-3">
      {formData.images.map((img, index) => (
        <div key={index} className="relative">
          <img
            src={img.url}
            alt={img.filename}
            className="w-full h-24 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index)
              }))
            }}
            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )}
</div>
```

### 📝 4. 前端 - RequestDetails 页面

需要显示图片：

```jsx
{/* 在详情页面添加图片显示区域 */}
{request.images && request.images.length > 0 && (
  <div className="bg-white rounded-2xl shadow-md p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4">
      Hochgeladene Bilder
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {request.images.map((img, index) => (
        <a
          key={index}
          href={img.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src={img.url}
            alt={`Material ${index + 1}`}
            className="w-full h-32 object-cover rounded-lg hover:opacity-75 transition"
          />
        </a>
      ))}
    </div>
  </div>
)}
```

## 使用步骤

### 1. 设置 Supabase Storage

在 Supabase 控制台中：
1. 进入 Storage
2. 创建新 bucket 名为 "request-images"
3. 设置为 Public bucket
4. 配置上传策略

### 2. 运行数据库迁移

```bash
# 在 Supabase SQL Editor 中运行
/Users/yuqiao/baustelle-system/database/add_image_upload.sql
```

### 3. 测试功能

1. 工人创建申请时上传图片
2. Lager 查看申请时能看到图片
3. 点击图片可以放大查看

## 优势

✅ **工人不需要知道材料名称** - 直接拍照上传
✅ **Lager 一目了然** - 看图片就知道需要什么
✅ **避免错误** - 减少因名称不清导致的错误
✅ **移动友好** - 手机可以直接拍照上传

## 注意事项

- 图片最大 5MB
- 每次最多上传 5 张
- 支持格式: JPG, PNG, GIF, WebP
- 图片存储在 Supabase Storage
- 自动压缩和优化建议在前端实现
