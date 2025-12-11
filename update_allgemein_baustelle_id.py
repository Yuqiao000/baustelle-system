import requests
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

# Step 1: Get Allgemein baustelle ID
print("Fetching Allgemein baustelle...")
baustelle_response = requests.get(
    f"{SUPABASE_URL}/rest/v1/baustellen?name=eq.Allgemein",
    headers=headers
)

if baustelle_response.status_code == 200 and baustelle_response.json():
    allgemein_baustelle = baustelle_response.json()[0]
    baustelle_id = allgemein_baustelle["id"]
    print(f"✓ Found Allgemein baustelle: {baustelle_id}")
else:
    print("✗ Could not find Allgemein baustelle")
    exit(1)

# Step 2: Get Allgemein category ID
print("\nFetching Allgemein category...")
category_response = requests.get(
    f"{SUPABASE_URL}/rest/v1/categories?name=eq.Allgemein&type=eq.material",
    headers=headers
)

if category_response.status_code == 200 and category_response.json():
    allgemein_category = category_response.json()[0]
    category_id = allgemein_category["id"]
    print(f"✓ Found Allgemein category: {category_id}")
else:
    print("✗ Could not find Allgemein category")
    exit(1)

# Step 3: Get all items in Allgemein category
print("\nFetching items in Allgemein category...")
items_response = requests.get(
    f"{SUPABASE_URL}/rest/v1/items?category_id=eq.{category_id}",
    headers=headers
)

if items_response.status_code == 200:
    items = items_response.json()
    print(f"✓ Found {len(items)} items in Allgemein category")
else:
    print(f"✗ Error fetching items: {items_response.status_code}")
    exit(1)

# Step 4: Update each item to have baustelle_id
print(f"\nUpdating items with baustelle_id {baustelle_id}...")
success_count = 0

for item in items:
    update_response = requests.patch(
        f"{SUPABASE_URL}/rest/v1/items?id=eq.{item['id']}",
        headers=headers,
        json={"baustelle_id": baustelle_id}
    )

    if update_response.status_code in [200, 204]:
        print(f"  ✓ Updated: {item['name']}")
        success_count += 1
    else:
        print(f"  ✗ Failed to update {item['name']}: {update_response.status_code}")
        print(f"    {update_response.text}")

print(f"\n✓ Successfully updated {success_count}/{len(items)} items!")
