import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import BarcodeScanner from '../../components/BarcodeScanner'
import { Camera, Package, ArrowDownCircle, ArrowUpCircle, AlertCircle } from 'lucide-react'

export default function InventoryScan() {
  const { user } = useAuthStore()
  const [showScanner, setShowScanner] = useState(false)
  const [scannedItem, setScannedItem] = useState(null)
  const [locations, setLocations] = useState([])
  const [allLocations, setAllLocations] = useState([])
  const [operation, setOperation] = useState(null) // 'in' or 'out'
  const [quantity, setQuantity] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  // 加载所有库位
  useState(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wms/locations`)
      const data = await response.json()
      setAllLocations(data)
    } catch (error) {
      console.error('Load locations error:', error)
    }
  }

  const handleScan = async (barcode) => {
    setShowScanner(false)
    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wms/barcode/${barcode}`)
      const data = await response.json()

      if (data.found) {
        setScannedItem(data.item)
        setLocations(data.locations || [])
        if (data.locations && data.locations.length > 0) {
          setSelectedLocation(data.locations[0].location_id)
        }
      } else {
        alert('Barcode nicht gefunden!')
      }
    } catch (error) {
      console.error('Barcode search error:', error)
      alert('Fehler beim Scannen')
    } finally {
      setLoading(false)
    }
  }

  const handleTransaction = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      alert('Bitte geben Sie eine gültige Menge ein')
      return
    }

    if (!selectedLocation) {
      alert('Bitte wählen Sie eine Lagerposition aus')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wms/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: scannedItem.id,
          location_id: selectedLocation,
          transaction_type: operation,
          quantity: parseFloat(quantity),
          operator_id: user.id,
          notes,
        }),
      })

      if (response.ok) {
        alert(`${operation === 'in' ? 'Einlagerung' : 'Auslagerung'} erfolgreich!`)
        // Reset
        setScannedItem(null)
        setOperation(null)
        setQuantity('')
        setNotes('')
        setLocations([])
      } else {
        const error = await response.json()
        alert('Fehler: ' + (error.detail || 'Unbekannter Fehler'))
      }
    } catch (error) {
      console.error('Transaction error:', error)
      alert('Fehler bei der Transaktion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Inventar scannen</h1>
        <p className="mt-1 text-gray-600">Ein- und Auslagerung mit Barcode</p>
      </div>

      {/* Scan Button */}
      {!scannedItem && (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <Camera className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Barcode/QR-Code scannen
          </h3>
          <p className="text-gray-600 mb-6">
            Scannen Sie den Barcode des Materials, um mit der Ein- oder Auslagerung zu beginnen
          </p>
          <button
            onClick={() => setShowScanner(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-3"
          >
            <Camera className="h-6 w-6" />
            Scannen starten
          </button>
        </div>
      )}

      {/* Scanned Item Info */}
      {scannedItem && !operation && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-4 mb-6">
            <Package className="h-12 w-12 text-blue-600" />
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{scannedItem.name}</h3>
              <p className="text-sm text-gray-600">Barcode: {scannedItem.barcode}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm text-gray-600">Aktueller Bestand</p>
              <p className="text-2xl font-bold text-blue-600">
                {scannedItem.current_stock} {scannedItem.unit}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Mindestbestand</p>
              <p className="text-2xl font-bold text-orange-600">
                {scannedItem.min_stock} {scannedItem.unit}
              </p>
            </div>
          </div>

          {locations.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Lagerorte:</p>
              <div className="space-y-2">
                {locations.map((loc) => (
                  <div key={loc.location_id} className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <span className="font-bold text-blue-800">{loc.location_name}</span>
                    <span className="ml-2 text-blue-600">({loc.quantity} {scannedItem.unit})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => setOperation('in')}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ArrowDownCircle className="h-6 w-6" />
              Einlagerung
            </button>
            <button
              onClick={() => setOperation('out')}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ArrowUpCircle className="h-6 w-6" />
              Auslagerung
            </button>
          </div>

          <button
            onClick={() => setScannedItem(null)}
            className="w-full mt-4 px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-xl shadow-md hover:bg-gray-300 transition-all"
          >
            Abbrechen
          </button>
        </div>
      )}

      {/* Transaction Form */}
      {scannedItem && operation && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className={`flex items-center gap-4 mb-6 p-4 rounded-xl ${operation === 'in' ? 'bg-green-50 border-2 border-green-200' : 'bg-orange-50 border-2 border-orange-200'}`}>
            {operation === 'in' ? <ArrowDownCircle className="h-8 w-8 text-green-600" /> : <ArrowUpCircle className="h-8 w-8 text-orange-600" />}
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {operation === 'in' ? 'Einlagerung' : 'Auslagerung'}
              </h3>
              <p className="text-sm text-gray-600">{scannedItem.name}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lagerort
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 font-medium"
              >
                <option value="">Lagerort wählen...</option>
                {allLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.zone && `(${loc.zone})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Menge ({scannedItem.unit})
              </label>
              <input
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 font-medium"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bemerkung (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 font-medium"
                rows="2"
                placeholder="z.B. Baustelle, Grund..."
              ></textarea>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setOperation(null)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-xl shadow-md hover:bg-gray-300 transition-all"
            >
              Zurück
            </button>
            <button
              onClick={handleTransaction}
              disabled={loading}
              className={`flex-1 px-6 py-3 ${operation === 'in' ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-orange-600 to-orange-700'} text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50`}
            >
              {loading ? 'Wird verarbeitet...' : 'Bestätigen'}
            </button>
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}
