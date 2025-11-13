-- 为所有没有条码的物料添加条码
-- 格式: BAR-{UUID前8位}-{随机3位数字}

-- 首先确保items表有barcode字段（如果之前已运行wms_setup.sql则已存在）
ALTER TABLE items
ADD COLUMN IF NOT EXISTS barcode TEXT UNIQUE;

-- 为所有没有条码的物料生成条码
UPDATE items
SET barcode = 'BAR-' || SUBSTRING(id::text, 1, 8) || '-' || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0')
WHERE barcode IS NULL OR barcode = '';

-- 验证：查看所有物料的条码
SELECT
  id,
  name,
  barcode,
  current_stock,
  min_stock
FROM items
ORDER BY name;
