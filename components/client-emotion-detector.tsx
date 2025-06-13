"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import EmotionDisplay from "./emotion-display"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import * as faceapi from "face-api.js"

export default function ClientEmotionDetector() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [emotion, setEmotion] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)

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

  // Auto-detect emotions every few seconds when streaming
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isStreaming && !isProcessing && modelsLoaded) {
      interval = setInterval(() => {
        detectEmotion()
      }, 2000) // Detect every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isStreaming, isProcessing, detectEmotion, modelsLoaded])

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Face Emotion Detection</CardTitle>
        <p className="text-sm text-muted-foreground">
          Using face-api.js for real-time emotion detection in your browser
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {isModelLoading && (
          <Alert>
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
              <AlertTitle>Loading AI models...</AlertTitle>
            </div>
            <AlertDescription>This may take a moment depending on your internet connection.</AlertDescription>
          </Alert>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="relative w-full max-w-lg aspect-video bg-black rounded-lg overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {emotion && <EmotionDisplay emotion={emotion} confidence={confidence || 0} />}
      </CardContent>
      <CardFooter className="flex justify-center space-x-4">
        {!isStreaming ? (
          <Button onClick={startWebcam} disabled={isModelLoading}>
            {isModelLoading ? "Loading Models..." : "Start Webcam"}
          </Button>
        ) : (
          <>
            <Button onClick={stopWebcam} variant="outline">
              Stop Webcam
            </Button>
            <Button onClick={detectEmotion} disabled={isProcessing || !modelsLoaded}>
              {isProcessing ? "Processing..." : "Detect Emotion"}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
