"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Camera, AlertTriangle, RefreshCw } from "lucide-react"
import * as faceapi from "face-api.js"

export default function FaceEmotionDetection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [emotion, setEmotion] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [detectionHistory, setDetectionHistory] = useState<
    Array<{ emotion: string; confidence: number; timestamp: Date }>
  >([])
  const [autoDetect, setAutoDetect] = useState(false)

  // Load face-api.js models
  const loadModels = useCallback(async () => {
    try {
      setIsModelLoading(true)
      setError(null)

      // Set the models path
      const MODEL_URL = "/models"

      // Load all required models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ])

      console.log("All models loaded successfully")
      setModelsLoaded(true)
      setIsModelLoading(false)
    } catch (err) {
      console.error("Error loading models:", err)
      setError(`Failed to load models: ${err instanceof Error ? err.message : String(err)}`)
      setIsModelLoading(false)
    }
  }, [])

  // Start webcam stream
  const startWebcam = useCallback(async () => {
    try {
      // Load models if not already loaded
      if (!modelsLoaded) {
        await loadModels()
      }

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
  }, [modelsLoaded, loadModels])

  // Stop webcam stream
  const stopWebcam = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
      setEmotion(null)
      setConfidence(null)
      setAutoDetect(false)
    }
  }, [])

  // Detect emotion
  const detectEmotion = useCallback(async () => {
    if (!videoRef.current || !modelsLoaded || isProcessing) return

    setIsProcessing(true)
    setError(null)

    try {
      const video = videoRef.current

      // Detect all faces with expressions
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()

      if (detections.length === 0) {
        setError("No face detected. Please make sure your face is visible.")
        setIsProcessing(false)
        return
      }

      // Get the first face
      const face = detections[0]
      const expressions = face.expressions

      // Find the expression with highest probability
      let maxProbability = 0
      let dominantExpression = ""

      for (const [expression, probability] of Object.entries(expressions)) {
        if (probability > maxProbability) {
          maxProbability = probability
          dominantExpression = expression
        }
      }

      // Update state with detected emotion
      setEmotion(dominantExpression)
      setConfidence(maxProbability)

      // Add to history
      setDetectionHistory((prev) => [
        {
          emotion: dominantExpression,
          confidence: maxProbability,
          timestamp: new Date(),
        },
        ...prev.slice(0, 9), // Keep only the last 10 entries
      ])

      // Draw face detection results on canvas if needed
      if (canvasRef.current) {
        const displaySize = { width: video.videoWidth, height: video.videoHeight }
        faceapi.matchDimensions(canvasRef.current, displaySize)

        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        const ctx = canvasRef.current.getContext("2d")
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections)
          faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections)
        }
      }
    } catch (err) {
      console.error("Error in emotion detection:", err)
      setError(`Error detecting emotion: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsProcessing(false)
    }
  }, [modelsLoaded, isProcessing])

  // Toggle auto-detect
  const toggleAutoDetect = useCallback(() => {
    setAutoDetect((prev) => !prev)
  }, [])

  // Auto-detect emotions every few seconds when streaming
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isStreaming && autoDetect && modelsLoaded) {
      interval = setInterval(() => {
        if (!isProcessing) {
          detectEmotion()
        }
      }, 2000) // Detect every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isStreaming, autoDetect, detectEmotion, modelsLoaded, isProcessing])

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

  const formatEmotionName = (emotion: string) => {
    return emotion.charAt(0).toUpperCase() + emotion.slice(1)
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Face Emotion Detection</CardTitle>
            <p className="text-sm text-muted-foreground">Detect emotions from facial expressions using your webcam</p>
          </div>
          {modelsLoaded && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Models Loaded
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {isModelLoading && (
          <Alert>
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle>Loading AI models...</AlertTitle>
            </div>
            <AlertDescription>This may take a moment depending on your internet connection.</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative w-full max-w-lg aspect-video bg-black rounded-lg overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

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
                <h3 className="text-xl font-medium">{formatEmotionName(emotion)}</h3>
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

        {detectionHistory.length > 0 && (
          <div className="w-full mt-4">
            <h3 className="text-lg font-medium mb-2">Recent Detections</h3>
            <div className="bg-slate-50 rounded-lg p-2 max-h-40 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Time</th>
                    <th className="text-left py-2">Emotion</th>
                    <th className="text-right py-2">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {detectionHistory.map((entry, index) => (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="py-2">{entry.timestamp.toLocaleTimeString()}</td>
                      <td className="py-2 flex items-center">
                        <span className="mr-2">{getEmotionEmoji(entry.emotion)}</span>
                        {formatEmotionName(entry.emotion)}
                      </td>
                      <td className="py-2 text-right">{Math.round(entry.confidence * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap justify-center gap-4">
        {!isStreaming ? (
          <Button onClick={startWebcam} disabled={isModelLoading}>
            <Camera className="mr-2 h-4 w-4" />
            {isModelLoading ? "Loading Models..." : "Start Webcam"}
          </Button>
        ) : (
          <>
            <Button onClick={stopWebcam} variant="outline">
              Stop Webcam
            </Button>
            <Button onClick={detectEmotion} disabled={isProcessing || !modelsLoaded}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Detect Emotion"
              )}
            </Button>
            <Button
              onClick={toggleAutoDetect}
              variant={autoDetect ? "default" : "outline"}
              className={autoDetect ? "bg-blue-600" : ""}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${autoDetect ? "animate-spin" : ""}`} />
              {autoDetect ? "Auto-Detecting" : "Auto-Detect"}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
