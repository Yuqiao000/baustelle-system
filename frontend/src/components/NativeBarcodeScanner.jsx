import { useEffect, useRef, useState } from 'react'
import { Camera, X, AlertCircle, Type } from 'lucide-react'

export default function NativeBarcodeScanner({ onScan, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const workerRef = useRef(null)
  const [manualCode, setManualCode] = useState('')
  const [error, setError] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [cameraSupported, setCameraSupported] = useState(true)
  const animationFrameRef = useRef(null)
  const isProcessingRef = useRef(false)

  useEffect(() => {
    // 检查浏览器是否支持摄像头
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraSupported(false)
      setError('Ihr Browser unterstützt keinen Kamerazugriff. Bitte verwenden Sie die manuelle Eingabe.')
      return
    }

    // 检查是否是 HTTPS 或 localhost 或局域网 IP（开发环境）
    const isSecure = window.location.protocol === 'https:' ||
                     window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.startsWith('192.168.') ||
                     window.location.hostname.startsWith('172.') ||
                     window.location.hostname.startsWith('10.')

    if (!isSecure) {
      setCameraSupported(false)
      setError('Kamerazugriff ist nur über HTTPS verfügbar. Bitte verwenden Sie die manuelle Eingabe oder öffnen Sie die App über die Produktions-URL.')
      return
    }

    // 初始化 Web Worker
    initWorker()
    startCamera()

    return () => {
      stopCamera()
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [])

  const initWorker = () => {
    try {
      // 创建 Web Worker
      workerRef.current = new Worker(
        new URL('../workers/qrWorker.js', import.meta.url),
        { type: 'module' }
      )

      // 监听 Worker 消息
      workerRef.current.onmessage = (e) => {
        isProcessingRef.current = false

        if (e.data.success && e.data.data) {
          setIsScanning(false)
          stopCamera()
          onScan(e.data.data)
        }
      }

      workerRef.current.onerror = (err) => {
        console.error('Worker error:', err)
        isProcessingRef.current = false
      }
    } catch (err) {
      console.error('Worker initialization failed:', err)
      // Worker 失败时回退到主线程处理
      workerRef.current = null
    }
  }

  const startCamera = async () => {
    try {
      setError(null)

      // 首先尝试后置摄像头
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        })
      } catch (err) {
        // 如果后置摄像头失败，尝试任何可用摄像头
        console.log('Rear camera failed, trying any camera:', err)
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        })
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', true)
        videoRef.current.setAttribute('autoplay', true)
        videoRef.current.setAttribute('muted', true)

        // 等待视频准备好
        await videoRef.current.play()
        setIsScanning(true)
        requestAnimationFrame(tick)
      }
    } catch (err) {
      console.error('Camera error:', err)
      setCameraSupported(false)

      let errorMessage = 'Kamera konnte nicht gestartet werden. Bitte verwenden Sie die manuelle Eingabe.'

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Kamerazugriff verweigert. Bitte erlauben Sie den Kamerazugriff in den Browsereinstellungen und laden Sie die Seite neu.'
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'Keine Kamera gefunden. Bitte verwenden Sie die manuelle Eingabe.'
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Kamera wird bereits von einer anderen Anwendung verwendet. Bitte schließen Sie andere Apps und versuchen Sie es erneut.'
      }

      setError(errorMessage)
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

      if (canvas.width > 0 && canvas.height > 0 && !isProcessingRef.current) {
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        // 使用 Web Worker 处理解码
        if (workerRef.current) {
          isProcessingRef.current = true
          workerRef.current.postMessage({
            imageData: imageData.data,
            width: imageData.width,
            height: imageData.height
          })
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(tick)
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualCode.trim()) {
      stopCamera()
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
            onClick={() => {
              stopCamera()
              onClose()
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* 扫描区域 */}
        <div className="p-6">
          {/* 视频预览 */}
          {cameraSupported && (
            <div className="relative mb-6 bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                autoPlay
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* 扫描框 */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative border-4 border-green-500 rounded-lg" style={{ width: '250px', height: '250px' }}>
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-green-400"></div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-green-400"></div>
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-green-400"></div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-green-400"></div>
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
          )}

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800">{error}</p>
            </div>
          )}

          {/* 手动输入 */}
          <div className={cameraSupported ? "pt-6 border-t-2 border-gray-100" : ""}>
            <div className="flex items-center gap-2 mb-3">
              <Type className="h-5 w-5 text-gray-600" />
              <p className="text-sm font-semibold text-gray-700">
                Manuelle Eingabe:
              </p>
            </div>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Barcode-Nummer eingeben..."
                autoFocus={!cameraSupported}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 font-medium"
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suchen
              </button>
            </form>
          </div>

          {/* 提示信息 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
            <p className="text-sm text-blue-800 font-medium">
              💡 Tipp: {cameraSupported
                ? 'Halten Sie den QR-Code gerade vor die Kamera und stellen Sie sicher, dass er gut beleuchtet ist.'
                : 'Geben Sie die Barcode-Nummer manuell ein, die auf dem Etikett steht.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
