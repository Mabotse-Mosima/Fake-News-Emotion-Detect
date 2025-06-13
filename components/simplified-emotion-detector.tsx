"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SimplifiedEmotionDetector() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [emotion, setEmotion] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  // Take a snapshot from the webcam
  const takeSnapshot = useCallback(async () => {
    if (!videoRef.current || isProcessing) return

    setIsProcessing(true)
    setError(null)

    try {
      // Take a snapshot from the video
      if (canvasRef.current && videoRef.current) {
        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")

        if (context) {
          // Set canvas dimensions to match video
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight

          // Draw current video frame to canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height)

          // Display a message about the demo nature
          setEmotion("demo")
          setConfidence(1.0)
        }
      }
    } catch (err) {
      console.error("Error taking snapshot:", err)
      setError(`An error occurred: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing])

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Webcam Demo</CardTitle>
        <p className="text-sm text-muted-foreground">
          This is a demonstration of the webcam interface without actual emotion detection
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <Alert variant="warning" className="bg-amber-50 border-amber-200">
          <AlertTitle>Demo Version</AlertTitle>
          <AlertDescription>
            This is a demonstration version that doesn't actually detect emotions. For real emotion detection, a
            server-side implementation with a proper AI model would be required.
          </AlertDescription>
        </Alert>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="relative w-full max-w-lg aspect-video bg-black rounded-lg overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-0" />
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {emotion === "demo" && (
          <div className="w-full p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-medium mb-2">How Real Emotion Detection Would Work</h3>
            <p className="mb-2">In a production implementation, this app would:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Capture an image from your webcam</li>
              <li>Send the image to a server with an AI model for emotion detection</li>
              <li>Process the image to detect faces and analyze facial expressions</li>
              <li>Return the detected emotions with confidence scores</li>
              <li>Display the results in the UI</li>
            </ol>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center space-x-4">
        {!isStreaming ? (
          <Button onClick={startWebcam}>Start Webcam</Button>
        ) : (
          <>
            <Button onClick={stopWebcam} variant="outline">
              Stop Webcam
            </Button>
            <Button onClick={takeSnapshot} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Take Snapshot"}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
