import requests

# Use the FastAPI backend API
BASE_URL = "http://localhost:8000"

# First, check if Allgemein category exists
print("Checking for Allgemein category...")
cat_response = requests.get(f"{BASE_URL}/items/categories/?type=material")

if cat_response.status_code == 200:
    categories = cat_response.json()
    allgemein_cat = [c for c in categories if c["name"] == "Allgemein"]

    if allgemein_cat:
        category_id = allgemein_cat[0]["id"]
        print(f"✓ Found existing Allgemein category: {category_id}")
    else:
        print("✗ Allgemein category not found. Please create it manually in Supabase.")
        print("   INSERT INTO categories (name, type, description, is_active)")
        print("   VALUES ('Allgemein', 'material', 'General safety and work equipment', TRUE);")
        exit(1)
else:
    print(f"Error getting categories: {cat_response.status_code}")
    print(cat_response.text)
    exit(1)

# Prepare materials list
materials = [
    {
        "category_id": category_id,
        "name": "Warnweste",
        "type": "material",
        "unit": "Stück",
        "description": "High-visibility safety vest",
        "stock_quantity": 50,
        "min_stock_level": 10,
        "image_url": "Material_Fotos/Warnweste.jpg",
        "is_active": True
    },
    {
        "category_id": category_id,
        "name": "Zollstock",
        "type": "material",
        "unit": "Stück",
        "description": "Folding ruler / measuring stick 2m",
        "stock_quantity": 30,
        "min_stock_level": 5,
        "image_url": "Material_Fotos/Zollstock.jpg",
        "is_active": True
    }
]

# Add Warnschutzjacke sizes
sizes_jacket = [
    ("S", 8, 2),
    ("M", 15, 3),
    ("L", 20, 5),
    ("XL", 15, 3),
    ("XXL", 10, 2)
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
    (39, 5, 1),
    (40, 8, 2),
    (41, 10, 2),
    (42, 12, 3),
    (43, 12, 3),
    (44, 10, 2),
    (45, 8, 2),
    (46, 5, 1),
    (47, 3, 1)
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

# Insert all materials one by one
print(f"\nInserting {len(materials)} materials...")
success_count = 0
for material in materials:
    response = requests.post(f"{BASE_URL}/items/", json=material)
    if response.status_code in [200, 201]:
        item = response.json()
        print(f"  ✓ {item['name']}: {item['stock_quantity']} {item['unit']}")
        success_count += 1
    else:
        print(f"  ✗ Failed to add {material['name']}: {response.status_code}")
        print(f"    {response.text}")

print(f"\n✓ Successfully added {success_count}/{len(materials)} materials!")
