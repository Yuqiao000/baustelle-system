-- 为物资申请添加图片上传功能
-- Add image upload capability to material requests

-- ====================================
-- 1. 添加图片字段到 requests 表
-- ====================================
ALTER TABLE requests
ADD COLUMN IF NOT EXISTS images TEXT[]; -- 存储图片URL数组

-- ====================================
-- 2. 创建 request_images 表（可选，更结构化的方案）
-- ====================================
CREATE TABLE IF NOT EXISTS request_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER, -- 文件大小（字节）
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  notes TEXT -- 图片说明
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_request_images_request ON request_images(request_id);

-- ====================================
-- 3. 视图：包含图片的申请详情
-- ====================================
CREATE OR REPLACE VIEW requests_with_images AS
SELECT
  r.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', ri.id,
        'image_url', ri.image_url,
        'file_name', ri.file_name,
        'file_size', ri.file_size,
        'uploaded_at', ri.uploaded_at,
        'notes', ri.notes
      )
    ) FILTER (WHERE ri.id IS NOT NULL),
    '[]'
  ) AS images
FROM requests r
LEFT JOIN request_images ri ON r.id = ri.request_id
GROUP BY r.id;

COMMENT ON TABLE request_images IS '物资申请的附件图片';
COMMENT ON COLUMN requests.images IS '图片URL数组（简单方案）';
