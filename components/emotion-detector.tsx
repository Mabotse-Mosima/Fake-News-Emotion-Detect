"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Camera, AlertTriangle } from "lucide-react"

export default function EmotionDetector() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [emotion, setEmotion] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDemoMode] = useState(true)

  // Start webcam stream
  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
        setError(null)
      }
    } catch (err) {
      console.error("Error accessing webcam:", err)
      setError("Could not access webcam. Please ensure you have granted permission.")
    }
  }, [])

  // Stop webcam stream
  const stopWebcam = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
      setEmotion(null)
      setConfidence(null)
    }
  }, [])

  // Capture frame and detect emotion
  const captureAndDetect = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return

    setIsProcessing(true)
    setError(null)

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (!context) {
        setError("Could not get canvas context")
        return
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (blob) => {
            resolve(blob)
          },
          "image/jpeg",
          0.9,
        )
      })

      if (!blob) {
        setError("Failed to create image from canvas")
        return
      }

      // Create a FormData object to send the image
      const formData = new FormData()
      formData.append("image", blob, "emotion-detection.jpg")
      formData.append("demo", "true") // Always use demo mode

      // Send to backend API for processing
      const response = await fetch("/api/detect-emotion", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setEmotion(result.emotion)
        setConfidence(result.confidence)
      } else {
        console.error("Error detecting emotion:", result.error)
        setError(result.error || "Failed to detect emotion")
      }
    } catch (err) {
      console.error("Error in capture and detect:", err)
      setError(`An error occurred while processing the image: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing])

  const getEmotionEmoji = (emotion: string) => {
    const emotionMap: Record<string, string> = {
      happy: "😊",
      sad: "😢",
      angry: "😠",
      surprised: "😲",
      fearful: "😨",
      disgusted: "🤢",
      neutral: "😐",
    }
    return emotionMap[emotion.toLowerCase()] || "❓"
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Face Emotion Detection</CardTitle>
            <p className="text-sm text-muted-foreground">Detect emotions from facial expressions using your webcam</p>
          </div>
          {isDemoMode && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Demo Mode
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {isDemoMode && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-700" />
            <AlertTitle>Demo Mode Active</AlertTitle>
            <AlertDescription>
              This is a demonstration with simulated emotions. In a real implementation, this would use a machine
              learning model for facial emotion recognition.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative w-full max-w-lg aspect-video bg-black rounded-lg overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-0" />

          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
          )}
        </div>

        {emotion && (
          <div className="w-full p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="text-4xl mr-3">{getEmotionEmoji(emotion)}</span>
                <h3 className="text-xl font-medium capitalize">{emotion}</h3>
              </div>
              <Badge variant="outline" className="text-slate-700">
                {Math.round((confidence || 0) * 100)}% confidence
              </Badge>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${Math.round((confidence || 0) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center space-x-4">
        {!isStreaming ? (
          <Button onClick={startWebcam}>
            <Camera className="mr-2 h-4 w-4" />
            Start Webcam
          </Button>
        ) : (
          <>
            <Button onClick={stopWebcam} variant="outline">
              Stop Webcam
            </Button>
            <Button onClick={captureAndDetect} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Detect Emotion"
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
