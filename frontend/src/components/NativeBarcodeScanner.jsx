import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { Camera, X, AlertCircle } from 'lucide-react'

export default function NativeBarcodeScanner({ onScan, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [manualCode, setManualCode] = useState('')
  const [error, setError] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const animationFrameRef = useRef(null)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // 使用后置摄像头
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', true) // iOS需要
        videoRef.current.play()
        setIsScanning(true)
        requestAnimationFrame(tick)
      }
    } catch (err) {
      console.error('Camera error:', err)
      setError(
        err.name === 'NotAllowedError'
          ? 'Kamerazugriff verweigert. Bitte erlauben Sie den Kamerazugriff in den Browsereinstellungen.'
          : 'Kamera konnte nicht gestartet werden. Bitte verwenden Sie die manuelle Eingabe.'
      )
    }
  }

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const tick = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current
      const video = videoRef.current

      canvas.height = video.videoHeight
      canvas.width = video.videoWidth

      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      })

      if (code) {
        setIsScanning(false)
        stopCamera()
        onScan(code.data)
        return
      }
    }

    animationFrameRef.current = requestAnimationFrame(tick)
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualCode.trim()) {
      onScan(manualCode.trim())
      setManualCode('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-100">
          <div className="flex items-center gap-3">
            <Camera className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">QR-Code scannen</h2>
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
          {/* 视频预览 */}
          <div className="relative mb-6 bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* 扫描框 */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-4 border-green-500 rounded-lg" style={{ width: '250px', height: '250px' }}>
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400"></div>
                </div>
              </div>
            )}

            {/* 扫描提示 */}
            {isScanning && (
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white text-sm bg-black/50 inline-block px-4 py-2 rounded-full">
                  Halten Sie den QR-Code in den Rahmen
                </p>
              </div>
            )}
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800">{error}</p>
            </div>
          )}

          {/* 手动输入 */}
          <div className="pt-6 border-t-2 border-gray-100">
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
              💡 Tipp: Halten Sie den QR-Code gerade vor die Kamera und stellen Sie sicher,
              dass er gut beleuchtet ist.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
