# 🚀 Quick Start Guide

## ⚡ Schnellstart in 3 Schritten

### Schritt 1: Datenbank Setup (Supabase SQL Editor)

Führen Sie diese 3 SQL-Dateien **in dieser Reihenfolge** aus:

```sql
1. database/generate_barcodes.sql
2. database/material_management_upgrade.sql
3. database/warehouse_management_full.sql
```

**Hinweis**: Alle SQL-Fehler sollten behoben sein. Falls "policy already exists" erscheint, sind die Policies bereits vorhanden - das ist OK!

---

### Schritt 2: System ist bereits gestartet ✅

- ✅ Backend läuft auf: `http://172.20.10.9:8000`
- ✅ Frontend läuft auf: `http://172.20.10.9:3000`
- ✅ API registriert: `/materials` Endpunkte verfügbar
- ✅ Navigation aktualisiert: "Materialien" Link im Lager-Menü

---

### Schritt 3: Material Management testen

1. **Öffnen Sie**: `http://172.20.10.9:3000/lager/materials`
2. **Suchen Sie nach**: "A1.B"
3. **Material öffnen** → Details anzeigen
4. **Alias hinzufügen**: z.B. "test-alias"
5. **Suchen mit Alias**: Sollte Material finden

---

## 📱 Zugriff vom Handy

```
http://172.20.10.9:3000
```

Stellen Sie sicher, dass:
- Handy im gleichen WLAN (172.20.10.x)
- Windows Firewall erlaubt Port 3000 und 8000

---

## 🔍 Wichtige URLs

| Funktion | URL |
|----------|-----|
| Frontend | http://172.20.10.9:3000 |
| Backend API | http://172.20.10.9:8000 |
| API Docs | http://172.20.10.9:8000/docs |
| Material Management | http://172.20.10.9:3000/lager/materials |
| Material Search | http://172.20.10.9:8000/materials/search?q=A1.B |

---

## 📚 Dokumentation

- [DATABASE_SETUP_GUIDE.md](DATABASE_SETUP_GUIDE.md) - Detaillierte Datenbank-Setup-Anleitung
- [MATERIAL_MANAGEMENT_README.md](MATERIAL_MANAGEMENT_README.md) - Material-Management Funktionen
- [WAREHOUSE_SYSTEM_COMPLETE.md](WAREHOUSE_SYSTEM_COMPLETE.md) - Komplettes Warehouse-System
- [SETUP_COMPLETE_SUMMARY.md](SETUP_COMPLETE_SUMMARY.md) - Vollständige Zusammenfassung

---

## 🎯 Test-Checkliste

Nach Datenbank-Setup:

- [ ] Material suchen: "A1.B" → Sollte gefunden werden
- [ ] Material öffnen → Details anzeigen
- [ ] Alias hinzufügen → "test-alias" für "A1.B"
- [ ] Mit Alias suchen → "test-alias" sollte "A1.B" finden
- [ ] Bild-URL hinzufügen → Sollte angezeigt werden
- [ ] API testen: `curl http://172.20.10.9:8000/materials/search?q=A1.B`

---

## 🔧 Wenn etwas nicht funktioniert

### Frontend-Fehler:
```bash
cd frontend
npm install
npm run dev
```

### Backend-Fehler:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Datenbank-Fehler:
- Überprüfen Sie Supabase-Verbindung
- Stellen Sie sicher, dass alle SQL-Skripte ausgeführt wurden
- Konsultieren Sie [DATABASE_SETUP_GUIDE.md](DATABASE_SETUP_GUIDE.md)

---

## ✅ System bereit!

Ihr Baustelle-System ist jetzt vollständig konfiguriert mit:

- ✅ Material Management (Aliase, Bilder, Intelligente Suche)
- ✅ Warehouse System (Lagerorte, Inventar, Projekte)
- ✅ Backend API läuft
- ✅ Frontend UI verfügbar
- ✅ Navigation eingerichtet

**Viel Erfolg!** 🎉
