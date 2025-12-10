-- ============================================
-- Reset ALL Materials - Complete cleanup
-- ============================================
-- This script will delete ALL materials in the database

-- Step 1: Delete all request items first (to avoid foreign key constraint)
DELETE FROM request_items;

-- Step 2: Delete all materials
DELETE FROM items;

-- Step 3: Verify deletion
SELECT COUNT(*) as remaining_items FROM items;

-- You can now run add_initial_data.sql to add the new materials
