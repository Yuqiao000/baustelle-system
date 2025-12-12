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

# Create Allgemein project/baustelle
print("Creating Allgemein project...")
project_data = {
    "name": "Allgemein",
    "address": None,
    "city": None,
    "postal_code": None,
    "contact_person": None,
    "contact_phone": None,
    "is_active": True
}

response = requests.post(
    f"{SUPABASE_URL}/rest/v1/baustellen",
    headers=headers,
    json=project_data
)

if response.status_code in [200, 201]:
    project = response.json()[0]
    print(f"✓ Created Allgemein project: {project['id']}")
    print(f"  Name: {project['name']}")
elif response.status_code == 409:
    print("✓ Allgemein project already exists")
    # Fetch existing project
    fetch_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/baustellen?name=eq.Allgemein",
        headers=headers
    )
    if fetch_response.status_code == 200 and fetch_response.json():
        project = fetch_response.json()[0]
        print(f"  ID: {project['id']}")
        print(f"  Name: {project['name']}")
else:
    print(f"✗ Error creating project: {response.status_code}")
    print(response.text)
