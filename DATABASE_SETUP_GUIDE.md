# Datenbank Setup Guide

## 📋 Reihenfolge der SQL-Skripte (Order of Execution)

Führen Sie die folgenden SQL-Skripte **in dieser Reihenfolge** in Supabase SQL Editor aus:

### 1. Barcode Generation
```
database/generate_barcodes.sql
```
**Was es macht:**
- Generiert Barcodes für alle Materialien
- Verwendet Materialname als Barcode (z.B. "A1.B")
- Aktualisiert nur Materialien ohne Barcode

**Erwartetes Ergebnis:**
```
Alle items erhalten barcode = name
Zeigt Liste aller Materialien mit Namen und Barcodes
```

---

### 2. Material Management Upgrade
```
database/material_management_upgrade.sql
```
**Was es macht:**
- Erstellt `item_aliases` Tabelle für Material-Aliase
- Erstellt `item_images` Tabelle für Material-Bilder
- Fügt Kategorien hinzu (Kabel, Muffen, Schutzkleidung, etc.)
- Erstellt `search_items()` Funktion für intelligente Suche
- Erstellt `items_with_aliases` View
- Setzt RLS Policies für Berechtigungen

**Erwartetes Ergebnis:**
```
✅ Tabellen erstellt: item_aliases, item_images
✅ Kategorien hinzugefügt
✅ Suchfunktion verfügbar
✅ Policies aktiviert
```

---

### 3. Complete Warehouse Management
```
database/warehouse_management_full.sql
```
**Was es macht:**
- Erstellt `storage_locations` (Regal-Verwaltung mit QR-Codes)
- Erstellt `inventory` (Material pro Lagerort)
- Erstellt `projects` (Projekt-Verwaltung)
- Erstellt `subcontractors` (Sub-Verwaltung)
- Erweitert `requests` Tabelle (Projekt, Unterschrift, etc.)
- Erstellt `inventory_transactions` (Ein-/Ausgang)
- Erstellt `return_requests` + `return_items` (Rückgabe)
- Erstellt `material_transfers` + `transfer_items` (Projekt-Transfer)
- Erstellt Views für Statistiken
- Erstellt Funktionen für Nummerngenerierung
- Fügt Beispiel-Lagerorte ein (A1, A2, B1, B2, C1)

**Erwartetes Ergebnis:**
```
✅ Alle Warehouse-Tabellen erstellt
✅ Views für Statistiken verfügbar
✅ Beispiel-Lagerorte eingefügt
✅ Policies aktiviert
```

---

## ✅ Verification (Überprüfung)

Nach der Ausführung aller Skripte, prüfen Sie:

### 1. Tabellen Check
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'storage_locations',
  'inventory',
  'projects',
  'subcontractors',
  'return_requests',
  'return_items',
  'material_transfers',
  'transfer_items',
  'inventory_transactions',
  'item_aliases',
  'item_images'
);
```
**Erwartete Anzahl:** 11 Tabellen

### 2. Barcode Check
```sql
SELECT name, barcode
FROM items
WHERE barcode IS NOT NULL
LIMIT 10;
```
**Erwartung:** Alle items haben barcode = name

### 3. Alias-Funktion Check
```sql
SELECT * FROM search_items('A1.B');
```
**Erwartung:** Findet Material "A1.B"

### 4. Storage Locations Check
```sql
SELECT name, qr_code, zone
FROM storage_locations
ORDER BY name;
```
**Erwartung:** 5 Lagerorte (A1, A2, B1, B2, C1)

---

## 🔧 Troubleshooting

### Fehler: "policy already exists"
**Lösung:** Die Skripte verwenden bereits `DROP POLICY IF EXISTS`. Falls der Fehler weiterhin auftritt:
```sql
-- Manuelle Policy-Löschung
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

### Fehler: "column does not exist"
**Lösung:** Überprüfen Sie, ob alle vorherigen Skripte erfolgreich ausgeführt wurden.

### Fehler: "function search_items does not exist"
**Lösung:** Stellen Sie sicher, dass `material_management_upgrade.sql` erfolgreich ausgeführt wurde.

---

## 🎯 Nächste Schritte

Nach erfolgreicher Ausführung:

1. **Backend testen:**
   ```bash
   # API ist bereits registriert in backend/app/main.py
   # Testen Sie die Endpunkte:
   GET http://172.20.10.9:8000/materials/search?q=A1.B
   ```

2. **Frontend aufrufen:**
   ```
   http://172.20.10.9:3000/lager/materials
   ```

3. **Materialien mit Aliasen testen:**
   - Material öffnen
   - Alias hinzufügen (z.B. "mufe" für "Muffe")
   - Suche testen mit Alias

4. **Bilder hinzufügen:**
   - Material öffnen
   - Bild-URL einfügen
   - Als Hauptbild markieren

---

## 📊 System Features nach Setup

### Material Management:
- ✅ Barcode-System (Name als Barcode)
- ✅ Alias-System (unbegrenzte Aliase pro Material)
- ✅ Bild-Verwaltung (mehrere Bilder pro Material)
- ✅ Intelligente Suche (fuzzy matching)
- ✅ Deutsche Kategorien

### Warehouse Management:
- ✅ Lagerort-Verwaltung (QR-Codes)
- ✅ Inventar pro Lagerort
- ✅ Projekt-Verwaltung
- ✅ Sub-Verwaltung
- ✅ Erweiterte Anträge (mit Unterschrift)
- ✅ Rückgabe-Prozess
- ✅ Material-Transfer zwischen Projekten
- ✅ Statistiken und Reports

---

## 🚀 Ready to Go!

Nach der Ausführung aller Skripte ist Ihr System vollständig einsatzbereit!
