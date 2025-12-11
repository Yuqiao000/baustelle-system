import qrcode
import sys

# Set UTF-8 encoding for Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

# Production URL
url = "http://46.224.89.155"

# Create QR code
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=4,
)

qr.add_data(url)
qr.make(fit=True)

# Create image
img = qr.make_image(fill_color="black", back_color="white")

# Save to file
img.save("smart_logistics_qr_code.png")

print(f"✓ QR Code generated successfully!")
print(f"  URL: {url}")
print(f"  File: smart_logistics_qr_code.png")
print(f"\n扫描此二维码即可访问 Smart-Logistics 系统")
