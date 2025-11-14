// QR Code 解码 Web Worker
import jsQR from 'jsqr'

self.onmessage = function(e) {
  const { imageData, width, height } = e.data

  try {
    const code = jsQR(imageData, width, height, {
      inversionAttempts: 'dontInvert',
    })

    if (code) {
      self.postMessage({
        success: true,
        data: code.data
      })
    } else {
      self.postMessage({
        success: false
      })
    }
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message
    })
  }
}
