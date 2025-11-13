import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Download, Printer, QrCode } from 'lucide-react'

export default function BarcodeGenerator() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const canvasRefs = useRef({})

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/items?is_active=true`)
      const data = await response.json()
      setItems(data)

      // 为每个物料生成QR码
      setTimeout(() => {
        data.forEach(item => {
          if (item.barcode) {
            generateQRCode(item.id, item.barcode)
          }
        })
      }, 100)
    } catch (error) {
      console.error('Load items error:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async (itemId, barcode) => {
    const canvas = canvasRefs.current[itemId]
    if (!canvas) return

    try {
      await QRCode.toCanvas(canvas, barcode, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
    } catch (error) {
      console.error('QR code generation error:', error)
    }
  }

  const downloadQRCode = (itemId, itemName) => {
    const canvas = canvasRefs.current[itemId]
    if (!canvas) return

    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-${itemName.replace(/\s+/g, '_')}.png`
    a.click()
  }

  const printQRCode = (itemId) => {
    const canvas = canvasRefs.current[itemId]
    if (!canvas) return

    const printWindow = window.open('', '', 'width=600,height=600')
    const img = canvas.toDataURL('image/png')

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code Drucken</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              flex-direction: column;
            }
            img {
              max-width: 400px;
              border: 2px solid #333;
              padding: 20px;
            }
            .info {
              margin-top: 20px;
              text-align: center;
              font-family: Arial;
            }
          </style>
        </head>
        <body>
          <img src="${img}" />
          <div class="info">
            <h2>${items.find(i => i.id === itemId)?.name}</h2>
            <p>Barcode: ${items.find(i => i.id === itemId)?.barcode}</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Laden...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">QR-Code Generator</h1>
        <p className="mt-1 text-gray-600">
          Generieren und drucken Sie QR-Codes für alle Materialien
        </p>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <QrCode className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">
              So verwenden Sie die QR-Codes:
            </p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Klicken Sie auf "Herunterladen" um den QR-Code zu speichern</li>
              <li>Oder klicken Sie auf "Drucken" um direkt zu drucken</li>
              <li>Kleben Sie den ausgedruckten Code auf das Material</li>
              <li>Scannen Sie mit der "Scannen" Funktion in der App</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col items-center">
              <div className="mb-4">
                <canvas
                  ref={(el) => (canvasRefs.current[item.id] = el)}
                  className="border-2 border-gray-200 rounded-lg"
                />
              </div>

              <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
                {item.name}
              </h3>

              <div className="w-full space-y-2 mb-4">
                <div className={`text-sm rounded-lg p-2 ${item.barcode ? 'text-gray-600 bg-gray-50' : 'text-orange-600 bg-orange-50'}`}>
                  <span className="font-semibold">Barcode:</span>{' '}
                  {item.barcode ? (
                    <span className="font-mono text-xs break-all">{item.barcode}</span>
                  ) : (
                    <span className="font-medium">Nicht verfügbar - Bitte SQL ausführen</span>
                  )}
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                  <span className="font-semibold">Kategorie:</span> {item.category}
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                  <span className="font-semibold">Bestand:</span>{' '}
                  {item.current_stock || 0} {item.unit}
                </div>
              </div>

              <div className="flex gap-2 w-full">
                <button
                  onClick={() => downloadQRCode(item.id, item.name)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  disabled={!item.barcode}
                >
                  <Download className="h-4 w-4" />
                  Herunterladen
                </button>
                <button
                  onClick={() => printQRCode(item.id)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  disabled={!item.barcode}
                >
                  <Printer className="h-4 w-4" />
                  Drucken
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Keine Materialien gefunden
          </h3>
          <p className="text-gray-600">
            Fügen Sie zuerst Materialien hinzu, um QR-Codes zu generieren.
          </p>
        </div>
      )}
    </div>
  )
}
