-- 修复 requests 表中重复的 images 列
-- Fix duplicate images column in requests table

-- 1. 首先检查 requests 表的结构
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'requests'
ORDER BY ordinal_position;

-- 2. 如果有重复的 images 列，我们需要先删除它们
-- 注意：这个操作要小心，确保数据库中没有重要数据

-- 方式 1: 如果 requests 表中已经有 images 列，不需要再添加
-- 只需要确保 request_images 表存在即可

-- 3. 创建 request_images 表（如果不存在）
CREATE TABLE IF NOT EXISTS request_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  notes TEXT
);

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_request_images_request ON request_images(request_id);

-- 5. 删除旧视图（如果存在）并重新创建
DROP VIEW IF EXISTS requests_with_images;

-- 创建新视图
CREATE VIEW requests_with_images AS
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

-- 6. 验证表结构
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('requests', 'request_images')
ORDER BY table_name, ordinal_position;

COMMENT ON TABLE request_images IS '物资申请的附件图片';
