# Project Material Management System

## Overview

Materials are now associated with specific Baustellen (projects), allowing you to manage independent material inventories for different projects. The system also tracks detailed information including supplier, drum numbers, storage location, and remarks.

## Database Structure Changes

### New Fields in `items` Table

The following fields have been added to enhance material tracking:

```sql
-- Step 1: Add baustelle_id for project association
ALTER TABLE items
ADD COLUMN baustelle_id UUID REFERENCES baustellen(id) ON DELETE SET NULL;

-- Step 2: Add detailed tracking fields
ALTER TABLE items
ADD COLUMN supplier TEXT,
ADD COLUMN trommel_nummer TEXT,
ADD COLUMN total_length DECIMAL(10, 2),
ADD COLUMN lagerplatz TEXT,
ADD COLUMN bemerkung TEXT;
```

**Field Descriptions**:
- `baustelle_id`: UUID reference to baustellen table (NULL = central warehouse)
- `supplier`: Supplier or brand name (Lieferant/Marke)
- `trommel_nummer`: Drum or spool number for materials like Rohrverbund
- `total_length`: Original total length of the drum/spool (separate from stock_quantity which is remaining length)
- `lagerplatz`: Storage location (e.g., Hamm, Berlin)
- `bemerkung`: Additional remarks or notes
- `image_url`: Path to material photo (already exists)

## Execution Steps

### Step 1: Add baustelle_id Field

Execute in Supabase SQL Editor: [database/add_baustelle_to_items.sql](database/add_baustelle_to_items.sql)

This script will:
1. Add `baustelle_id` column to items table
2. Create index for faster queries
3. Update existing materials to belong to Projekt Bergkamen

### Step 2: Add New Tracking Fields

Execute in Supabase SQL Editor: [database/add_material_fields.sql](database/add_material_fields.sql)

This script adds:
- supplier (Lieferant/Marke)
- trommel_nummer (drum number)
- total_length (original length)
- lagerplatz (storage location)
- bemerkung (remarks)

### Step 3: Add Material Data

If you're setting up a new database, execute: [database/add_initial_data.sql](database/add_initial_data.sql)

This script adds:
- Rohrsysteme category structure
- Projekt Bergkamen project information
- All materials with complete details (supplier, location, photos, etc.)

## Current Data: Projekt Bergkamen Materials

### Rohrverbund (Pipe Compounds)

| Material Name | Supplier | Drum # | Total | Remaining | Location | Unit |
|--------------|----------|--------|-------|-----------|----------|------|
| Rohrverbund 12x10/6 - Orange | AfriPipes | T001 | 2000m | 979m | Hamm | m |
| Rohrverbund 7x16/12 - Orange | Ege-Com | T002 | 1000m | 298m | Hamm | m |
| Rohrverbund 12x10/6 - Rot | AEHAU | T003 | 950m | 325m | Hamm | m |

### Connection Elements (Verbindungselemente)

| Material Name | Supplier | Quantity | Unit | Photo |
|--------------|----------|----------|------|-------|
| Verbinder 10mm | Emtelle | 0 | Stück | Verbinder.jpg |
| Verbinder 16mm | Emtelle | 0 | Stück | Verbinder.jpg |
| Endekappe 10mm | Emtelle | 0 | Stück | EndKappe.jpg |
| Endekappe 16mm | Emtelle | 0 | Stück | EndKappe.jpg |

### Warning Materials (Warnmaterialien)

| Material Name | Supplier | Quantity | Unit | Photo |
|--------------|----------|----------|------|-------|
| Trassenwarnband | Unbekannt | 0 | m | Trassenwarnband.jpg |

### Marking Materials (Markierungsmaterial)

| Material Name | Supplier | Quantity | Unit | Photo |
|--------------|----------|----------|------|-------|
| Fähnchen Blau | Unbekannt | 15 | Beutel | Fähnchen.jpg |
| Fähnchen Rot | Unbekannt | 8 | Beutel | Fähnchen.jpg |
| Fähnchen Grün | Unbekannt | 22 | Beutel | Fähnchen.jpg |
| Fähnchen Gelb | Unbekannt | 12 | Beutel | Fähnchen.jpg |
| Fähnchen Orange | Unbekannt | 5 | Beutel | Fähnchen.jpg |
| Fähnchen Lila | Unbekannt | 18 | Beutel | Fähnchen.jpg |

## Material Photos

Photos are stored in [Material_Fotos/](Material_Fotos/) directory:
- EndKappe.jpg - End cap photos
- Fähnchen.jpg - Marking flags photos
- Trassenwarnband.jpg - Warning tape photos
- Verbinder.jpg - Connector photos

## Adding Materials for a New Project

### Example: Add Materials for Projekt Hamburg

```sql
-- 1. Ensure project exists
INSERT INTO baustellen (name, address, city, postal_code, contact_person, contact_phone, is_active)
VALUES ('Projekt Hamburg', 'Reeperbahn 154', 'Hamburg', '20359', 'Peter Schmidt', '+49 40 87654321', true)
ON CONFLICT DO NOTHING;

-- 2. Add materials for this project
INSERT INTO items (
  category_id,
  baustelle_id,
  name,
  type,
  unit,
  description,
  stock_quantity,
  min_stock_level,
  supplier,
  trommel_nummer,
  total_length,
  lagerplatz,
  bemerkung,
  image_url,
  is_active
)
SELECT
  c.id,
  b.id,
  'Rohrverbund 12x10/6 - Orange',
  'material',
  'm',
  'Orange colored pipe compound 12x10/6',
  2000,  -- Current stock
  100,
  'AfriPipes',
  'T004',  -- New drum number
  2000,  -- Total length
  'Hamburg',
  'New drum for Hamburg project',
  NULL,
  true
FROM categories c, baustellen b
WHERE c.name = 'Rohrverbund' AND b.name = 'Projekt Hamburg';
```

## Query Examples

### Query All Materials for a Specific Project

```sql
SELECT
  i.name,
  i.stock_quantity,
  i.total_length,
  i.unit,
  i.supplier,
  i.trommel_nummer,
  i.lagerplatz,
  b.name as projekt_name
FROM items i
JOIN baustellen b ON i.baustelle_id = b.id
WHERE b.name = 'Projekt Bergkamen'
  AND i.is_active = true
ORDER BY i.name;
```

### Query Materials Summary by Project

```sql
SELECT
  b.name as projekt_name,
  COUNT(i.id) as total_materials,
  SUM(i.stock_quantity) as total_quantity
FROM items i
JOIN baustellen b ON i.baustelle_id = b.id
WHERE i.is_active = true
GROUP BY b.name
ORDER BY b.name;
```

### Query Central Warehouse Materials (No Project)

```sql
SELECT
  name,
  stock_quantity,
  unit,
  supplier,
  lagerplatz
FROM items
WHERE baustelle_id IS NULL
  AND is_active = true
ORDER BY name;
```

### Query Rohrverbund by Drum Number

```sql
SELECT
  name,
  supplier,
  trommel_nummer,
  total_length,
  stock_quantity,
  (stock_quantity / NULLIF(total_length, 0) * 100) as percentage_remaining,
  lagerplatz
FROM items
WHERE trommel_nummer IS NOT NULL
  AND is_active = true
ORDER BY trommel_nummer;
```

## Frontend Display

In [MaterialienNew.jsx](frontend/src/pages/lager/MaterialienNew.jsx), materials are displayed with collapsible grouping. Materials with multiple variants (like different colored Fähnchen) are automatically grouped and can be expanded/collapsed.

## Advantages

1. **Project Isolation**: Each project's materials are independently managed
2. **Detailed Tracking**: Track supplier, drum numbers, and storage locations
3. **Photo Support**: Link material photos for easy identification
4. **Flexibility**: Use same material types with independent inventory for different projects
5. **Traceability**: Always know which materials belong to which project
6. **Scalability**: Easy to add new projects and their materials

## Notes

- If `baustelle_id` is NULL, the material is in the central warehouse (shared by all projects)
- When a project is deleted, associated materials' `baustelle_id` is automatically set to NULL (ON DELETE SET NULL)
- For Rohrverbund materials, `total_length` represents the original drum length, while `stock_quantity` represents remaining length
- It's recommended to create independent material entries for each project, even for the same material types

---

**Created**: 2025-12-09
**Last Updated**: 2025-12-10
**Status**: ✅ Complete database structure with detailed tracking fields
