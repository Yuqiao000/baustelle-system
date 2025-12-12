import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('backend/.env')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

# Demo accounts to create
demo_accounts = [
    # MAFC Workers
    {
        "email": "worker.mafc1@demo.de",
        "password": "demo123",
        "full_name": "Max Müller",
        "role": "worker",
        "company": "MAFC"
    },
    {
        "email": "worker.mafc2@demo.de",
        "password": "demo123",
        "full_name": "Anna Schmidt",
        "role": "worker",
        "company": "MAFC"
    },
    # BBR Workers
    {
        "email": "worker.bbr1@demo.de",
        "password": "demo123",
        "full_name": "Tom Wagner",
        "role": "worker",
        "company": "BBR"
    },
    {
        "email": "worker.bbr2@demo.de",
        "password": "demo123",
        "full_name": "Lisa Hoffmann",
        "role": "worker",
        "company": "BBR"
    },
    # STG Lager
    {
        "email": "lager@demo.de",
        "password": "demo123",
        "full_name": "Lager Verwaltung",
        "role": "lager",
        "company": "STG"
    }
]

print("🔐 Creating demo accounts...\n")

for account in demo_accounts:
    print(f"Creating: {account['full_name']} ({account['email']}) - {account['company']}")

    # Note: This script prepares the data structure
    # Actual account creation should be done through the signup API endpoint
    # or Supabase Auth Dashboard to ensure proper password hashing

    print(f"  ✓ Email: {account['email']}")
    print(f"  ✓ Password: {account['password']}")
    print(f"  ✓ Role: {account['role']}")
    print(f"  ✓ Company: {account['company']}")
    print()

print("\n" + "="*60)
print("WICHTIG / IMPORTANT:")
print("="*60)
print("\nDiese Accounts müssen über die Registrierungsfunktion erstellt werden:")
print("These accounts must be created through the registration function:")
print("\n1. Öffnen Sie: https://sl-logistics.com")
print("2. Klicken Sie auf 'Registrieren'")
print("3. Geben Sie die oben genannten Daten ein")
print("\nOder nutzen Sie das Supabase Auth Dashboard für bulk creation.")
print("Or use the Supabase Auth Dashboard for bulk creation.")
