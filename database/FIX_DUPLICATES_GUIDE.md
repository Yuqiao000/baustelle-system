# Fix Duplicate Materials - Step by Step Guide

## Problem
The `add_initial_data.sql` script was executed multiple times, creating 50 duplicate entries for each material because there's no unique constraint on the `items` table.

## Solution - Execute these SQL scripts IN ORDER:

### Step 1: Clean up ALL duplicates
In Supabase SQL Editor, run `complete_reset.sql`:

```sql
-- This will delete all materials and related data
DELETE FROM request_items;
DELETE FROM items;
DELETE FROM request_history;
DELETE FROM requests;

-- Verify all counts are 0
SELECT 'request_items' as table_name, COUNT(*) as count FROM request_items
UNION ALL
SELECT 'items' as table_name, COUNT(*) as count FROM items
UNION ALL
SELECT 'requests' as table_name, COUNT(*) as count FROM requests
UNION ALL
SELECT 'request_history' as table_name, COUNT(*) as count FROM request_history;
```

**Expected result:** All counts should be `0`

---

### Step 2: Add unique constraint to prevent future duplicates
Run `add_unique_constraint.sql`:

```sql
ALTER TABLE items
ADD CONSTRAINT items_name_baustelle_unique
UNIQUE (name, baustelle_id);
```

**Expected result:** Should say "Success. No rows returned"

**Important:** This ensures that if you accidentally run `add_initial_data.sql` multiple times, it will NOT create duplicates. The `ON CONFLICT DO NOTHING` will actually work now.

---

### Step 3: Add materials with proper naming (ONLY ONCE!)
Run `add_initial_data.sql` **ONE TIME ONLY**

This will add:
- 3 Rohrverbund items (with " - " separator for colors)
- 2 Verbinder items (with " - " separator: 10mm, 16mm)
- 2 Endekappe items (with " - " separator: 10mm, 16mm)
- 1 Trassenwarnband item
- 6 Fähnchen items (different colors: Blau, Rot, Grün, Gelb, Orange, Lila)

**Total:** 14 items

---

## Verification

After Step 3, run this query to verify:

```sql
-- Check total count
SELECT COUNT(*) as total_items FROM items WHERE is_active = true;

-- Should return: 14

-- Check for duplicates (should return no rows)
SELECT name, COUNT(*) as count
FROM items
WHERE is_active = true
GROUP BY name
HAVING COUNT(*) > 1;

-- Should return: 0 rows

-- View all materials by category
SELECT
  c.name as category,
  i.name as material_name,
  i.stock_quantity,
  i.unit
FROM items i
JOIN categories c ON i.category_id = c.id
WHERE i.is_active = true
ORDER BY c.name, i.name;
```

---

## How the collapsible grouping works

Materials with names containing " - " will be grouped:
- **Verbinder** group will contain:
  - Verbinder - 10mm (500)
  - Verbinder - 16mm (500)
- **Endekappe** group will contain:
  - Endekappe - 10mm (500)
  - Endekappe - 16mm (500)
- **Rohrverbund** group will contain:
  - Rohrverbund 12x10/6 - Orange (979)
  - Rohrverbund 7x16/12 - Orange (298)
  - Rohrverbund 12x10/6 - Rot (325)
- **Fähnchen** group will contain all 6 color variants

---

## What to do if you accidentally run add_initial_data.sql multiple times again

Don't worry! With the unique constraint in place, it will simply ignore duplicate inserts. You won't get 50 copies anymore.

But to be safe, always check first:
```sql
SELECT COUNT(*) FROM items WHERE name = 'Endekappe - 10mm';
```

If it returns more than 1, something went wrong. Contact support.
