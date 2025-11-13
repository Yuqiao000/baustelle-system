-- 为WMS测试生成QR码数据
-- 这个脚本会返回所有物料的条码，可以用于生成QR码

-- 选择所有有条码的物料
SELECT
  id,
  name,
  barcode,
  category,
  unit,
  current_stock,
  min_stock,
  -- 生成可打印的QR码内容（JSON格式）
  jsonb_build_object(
    'barcode', barcode,
    'name', name,
    'id', id,
    'category', category
  ) as qr_data
FROM items
WHERE barcode IS NOT NULL
ORDER BY category, name;

-- 如果你想要简单格式的条码列表用于打印测试：
-- SELECT barcode, name FROM items WHERE barcode IS NOT NULL ORDER BY name;
