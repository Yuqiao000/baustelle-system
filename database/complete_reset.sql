-- ============================================
-- Complete Reset - Delete ALL data and verify
-- ============================================

-- Step 1: Delete all request_items first
DELETE FROM request_items;

-- Step 2: Delete all items
DELETE FROM items;

-- Step 3: Delete all request history
DELETE FROM request_history;

-- Step 4: Delete all requests
DELETE FROM requests;

-- Step 5: Verify everything is deleted
SELECT 'request_items' as table_name, COUNT(*) as count FROM request_items
UNION ALL
SELECT 'items' as table_name, COUNT(*) as count FROM items
UNION ALL
SELECT 'requests' as table_name, COUNT(*) as count FROM requests
UNION ALL
SELECT 'request_history' as table_name, COUNT(*) as count FROM request_history;

-- All counts should be 0
