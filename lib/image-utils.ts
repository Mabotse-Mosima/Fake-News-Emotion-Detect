/**
 * Resizes an image to the specified dimensions while maintaining aspect ratio
 */
export async function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      // Create canvas and draw resized image
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Failed to create blob from canvas"))
          }
        },
        file.type,
        0.9, // Quality
      )
    }

    img.onerror = () => {
      reject(new Error("Failed to load image"))
    }

    // Set crossOrigin to avoid CORS issues
    img.crossOrigin = "anonymous"
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Converts a base64 data URL to a File object
 */
export function dataURLtoFile(dataURL: string, filename: string): File {
  const arr = dataURL.split(",")
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], filename, { type: mime })
}
