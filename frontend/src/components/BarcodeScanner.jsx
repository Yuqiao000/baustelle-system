import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Camera, X } from 'lucide-react'

export default function BarcodeScanner({ onScan, onClose }) {
  const scannerRef = useRef(null)
  const [isScanning, setIsScanning] = useState(false)
  const [manualCode, setManualCode] = useState('')

  useEffect(() => {
    if (!scannerRef.current) return

    const scanner = new Html5QrcodeScanner(
      'barcode-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [
          // 支持多种条码格式
          0, // QR_CODE
          1, // EAN_13
          2, // EAN_8
          3, // CODE_128
          4, // CODE_39
          5, // UPC_A
          6, // UPC_E
        ],
      },
      false
    )

    scanner.render(
      (decodedText) => {
        // 扫描成功
        setIsScanning(false)
        scanner.clear()
        onScan(decodedText)
      },
      (error) => {
        // 扫描错误（可以忽略）
        console.debug('Scan error:', error)
      }
    )

    setIsScanning(true)
    scannerRef.current = scanner

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.debug('Scanner cleanup error:', err))
      }
    }
  }, [onScan])

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualCode.trim()) {
      onScan(manualCode.trim())
      setManualCode('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-100">
          <div className="flex items-center gap-3">
            <Camera className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Barcode scannen</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* 扫描区域 */}
        <div className="p-6">
          <div id="barcode-reader" className="mb-6"></div>

          {/* 或者手动输入 */}
          <div className="mt-6 pt-6 border-t-2 border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Oder manuell eingeben:
            </p>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Barcode-Nummer eingeben..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 font-medium"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Suchen
              </button>
            </form>
          </div>

          {/* 提示信息 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
            <p className="text-sm text-blue-800 font-medium">
              💡 Tipp: Halten Sie den Barcode/QR-Code vor die Kamera oder geben Sie die
              Nummer manuell ein.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
