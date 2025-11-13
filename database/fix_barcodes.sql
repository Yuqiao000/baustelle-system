-- 修复条码格式，生成更短的条码
-- 新格式: BAR-{UUID前8位}-{随机3位数字}

-- 更新所有物料的条码为更短的格式
UPDATE items
SET barcode = 'BAR-' || SUBSTRING(id::text, 1, 8) || '-' || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0')
WHERE barcode IS NOT NULL;

-- 验证：查看所有物料的条码
SELECT
  id,
  name,
  barcode,
  current_stock,
  min_stock
FROM items
ORDER BY name;
