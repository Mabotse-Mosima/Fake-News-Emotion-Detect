"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { detectEmotionFromText } from "@/app/actions/detect-emotion-fallback"
import EmotionDisplay from "./emotion-display"

export default function TextEmotionInput() {
  const [text, setText] = useState("")
  const [emotion, setEmotion] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!text.trim()) {
      setError("Please enter some text")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const result = await detectEmotionFromText(text)

      if (result.success) {
        setEmotion(result.emotion)
        setConfidence(result.confidence)
      } else {
        setError(result.error || "Failed to detect emotion")
      }
    } catch (err) {
      setError(`An error occurred: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="w-full space-y-4">
      <h3 className="text-lg font-medium">Text-based Emotion Detection</h3>
      <p className="text-sm text-muted-foreground">
        If webcam detection isn't working, try describing your emotion in text.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe how you're feeling..."
          className="min-h-[100px]"
        />

        <Button type="submit" disabled={isProcessing || !text.trim()}>
          {isProcessing ? "Analyzing..." : "Detect Emotion"}
        </Button>
      </form>

      {emotion && <EmotionDisplay emotion={emotion} confidence={confidence || 0} />}
    </div>
  )
}
