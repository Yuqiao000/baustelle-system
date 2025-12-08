-- ============================================
-- 为物料生成条形码 (Barcode)
-- ============================================
-- 此脚本为所有没有条形码的物料生成唯一的条形码
-- 格式: 使用物料名称作为 barcode (例如: A1.B)

UPDATE items
SET barcode = name
WHERE barcode IS NULL;

-- 验证结果
SELECT
  id,
  name,
  barcode,
  category_id
FROM items
ORDER BY name;
