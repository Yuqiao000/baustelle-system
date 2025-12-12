import requests
import json
import sys

# Set UTF-8 encoding for Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

# Supabase configuration
SUPABASE_URL = "https://euxerhrjoqawcplejpjj.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eGVyaHJqb3Fhd2NwbGVqcGpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTk5NzI2NiwiZXhwIjoyMDc3NTczMjY2fQ.LTMkdQaQlsnFukd51KgbjjUcoqreRuhK2fS2UO2lNVo"

headers = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Step 1: Create Allgemein category
print("Creating Allgemein category...")
category_data = {
    "name": "Allgemein",
    "type": "material",
    "description": "General safety and work equipment"
}

cat_response = requests.post(
    f"{SUPABASE_URL}/rest/v1/categories",
    headers=headers,
    json=category_data
)

if cat_response.status_code in [200, 201]:
    category = cat_response.json()[0]
    category_id = category["id"]
    print(f"✓ Created Allgemein category: {category_id}")
elif cat_response.status_code == 409:
    # Category already exists, fetch it
    print("Category already exists, fetching...")
    fetch_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/categories?name=eq.Allgemein&type=eq.material",
        headers=headers
    )
    category = fetch_response.json()[0]
    category_id = category["id"]
    print(f"✓ Using existing Allgemein category: {category_id}")
else:
    print(f"✗ Error creating category: {cat_response.status_code}")
    print(cat_response.text)
    exit(1)

# Step 2: Prepare materials list
materials = [
    {
        "category_id": category_id,
        "name": "Warnweste",
        "type": "material",
        "unit": "Stück",
        "description": "High-visibility safety vest",
        "stock_quantity": "50",
        "min_stock_level": "10",
        "image_url": "Material_Fotos/Warnweste.jpg",
        "is_active": True
    },
    {
        "category_id": category_id,
        "name": "Zollstock",
        "type": "material",
        "unit": "Stück",
        "description": "Folding ruler / measuring stick 2m",
        "stock_quantity": "30",
        "min_stock_level": "5",
        "image_url": "Material_Fotos/Zollstock.jpg",
        "is_active": True
    }
]

# Add Warnschutzjacke sizes
sizes_jacket = [
    ("S", "8", "2"),
    ("M", "15", "3"),
    ("L", "20", "5"),
    ("XL", "15", "3"),
    ("XXL", "10", "2")
]

for size, qty, min_qty in sizes_jacket:
    materials.append({
        "category_id": category_id,
        "name": f"Warnschutzjacke - {size}",
        "type": "material",
        "unit": "Stück",
        "description": f"High-visibility jacket Size {size}",
        "stock_quantity": qty,
        "min_stock_level": min_qty,
        "image_url": "Material_Fotos/Warnschutzjacke.jpg",
        "is_active": True
    })

# Add Sicherheitsschuhe sizes
sizes_shoes = [
    ("39", "5", "1"),
    ("40", "8", "2"),
    ("41", "10", "2"),
    ("42", "12", "3"),
    ("43", "12", "3"),
    ("44", "10", "2"),
    ("45", "8", "2"),
    ("46", "5", "1"),
    ("47", "3", "1")
]

for size, qty, min_qty in sizes_shoes:
    materials.append({
        "category_id": category_id,
        "name": f"Sicherheitsschuhe - {size}",
        "type": "material",
        "unit": "Paar",
        "description": f"Safety shoes S3 Size {size}",
        "stock_quantity": qty,
        "min_stock_level": min_qty,
        "image_url": "Material_Fotos/Sicherheitsschuhe.jpg",
        "is_active": True
    })

# Step 3: Insert all materials
print(f"\nInserting {len(materials)} materials...")
success_count = 0

for material in materials:
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/items",
        headers=headers,
        json=material
    )

    if response.status_code in [200, 201]:
        item = response.json()[0]
        print(f"  ✓ {item['name']}: {item['stock_quantity']} {item['unit']}")
        success_count += 1
    else:
        print(f"  ✗ Failed to add {material['name']}: {response.status_code}")
        print(f"    {response.text}")

print(f"\n✓ Successfully added {success_count}/{len(materials)} materials!")
