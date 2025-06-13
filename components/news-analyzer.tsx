"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import ResultDisplay from "./result-display"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function NewsAnalyzer() {
  const [articleText, setArticleText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<null | {
    prediction: "real" | "fake"
    confidence: number
    probability: number
    features: Record<string, number>
    additional_features?: Record<string, number>
  }>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiMode, setApiMode] = useState<"live" | "demo">("demo")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (articleText.trim().length < 100) {
      setError("Please enter a longer article (at least 100 characters) for more accurate analysis.")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      if (apiMode === "live") {
        // Call the actual backend API
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: articleText }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        setResult(data)
      } else {
        // Use the demo mode with simulated response
        await simulateAnalysis(articleText)
      }
    } catch (err) {
      console.error("Analysis error:", err)
      setError(`An error occurred during analysis: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const simulateAnalysis = async (text: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Extract some basic features for the simulation
    const features: Record<string, number> = {}

    // Count some basic patterns
    const exclamationCount = (text.match(/!/g) || []).length
    const questionCount = (text.match(/\?/g) || []).length
    const allCapsWords = (text.match(/\b[A-Z]{2,}\b/g) || []).length
    const words = text.split(/\s+/).length

    // Check for sensationalist words
    const sensationalistWords = [
      "shocking",
      "bombshell",
      "explosive",
      "stunning",
      "unbelievable",
      "outrageous",
      "scandal",
      "secret",
      "breaking",
      "exclusive",
      "urgent",
    ]
    const sensationalistCount = sensationalistWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi")
      return count + (text.match(regex) || []).length
    }, 0)

    // Determine if it's likely fake based on simple heuristics
    // This is a very simplified version of what a real model would do
    let fakeScore = 0

    // More exclamation marks suggest sensationalism
    fakeScore += exclamationCount * 0.05

    // All caps words suggest sensationalism
    fakeScore += allCapsWords * 0.1

    // Sensationalist words are strong indicators
    fakeScore += sensationalistCount * 0.2

    // Normalize by text length
    fakeScore = fakeScore / (words / 100)

    // Add random variation
    fakeScore += (Math.random() - 0.5) * 0.3

    // Clamp between 0 and 1
    fakeScore = Math.max(0, Math.min(1, fakeScore))

    // Create feature importance
    features["exclamation_marks"] = exclamationCount > 0 ? 0.7 : -0.3
    features["all_caps_usage"] = allCapsWords > 2 ? 0.8 : -0.2
    features["sensationalist_language"] = sensationalistCount > 0 ? 0.9 : -0.4
    features["question_marks"] = questionCount > 3 ? 0.5 : -0.1
    features["text_length"] = words < 200 ? 0.3 : -0.3

    // Sort features by importance and take top 5
    const sortedFeatures = Object.entries(features)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 5)
      .reduce(
        (obj, [key, value]) => {
          obj[key] = value
          return obj
        },
        {} as Record<string, number>,
      )

    // Create additional features
    const additional_features = {
      text_length: words,
      exclamation_count: exclamationCount,
      question_count: questionCount,
      all_caps_count: allCapsWords,
      sensationalist_word_count: sensationalistCount,
      avg_word_length: text.length / Math.max(words, 1),
    }

    setResult({
      prediction: fakeScore > 0.5 ? "fake" : "real",
      confidence: Math.abs(fakeScore - 0.5) * 2,
      probability: fakeScore,
      features: sortedFeatures,
      additional_features,
    })
  }

  const handleReset = () => {
    setArticleText("")
    setResult(null)
    setError(null)
  }

  const toggleApiMode = () => {
    setApiMode(apiMode === "live" ? "demo" : "live")
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">News Article Analysis</h2>
        <div className="flex items-center">
          <span className="text-sm text-slate-500 mr-2">Mode:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleApiMode}
            className={`${apiMode === "demo" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-green-50 text-green-700 border-green-200"}`}
          >
            {apiMode === "demo" ? "Demo Mode" : "Live API"}
          </Button>
        </div>
      </div>

      {apiMode === "demo" && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <AlertTitle>Demo Mode Active</AlertTitle>
          <AlertDescription>
            Running in demonstration mode with simulated analysis. Results are for illustration purposes only.
          </AlertDescription>
        </Alert>
      )}

      {!result ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="article" className="block text-sm font-medium text-slate-700 mb-1">
              Paste a news article to analyze
            </label>
            <Textarea
              id="article"
              value={articleText}
              onChange={(e) => setArticleText(e.target.value)}
              placeholder="Paste the full text of a news article here..."
              className="min-h-[200px]"
            />
            <p className="mt-1 text-xs text-slate-500">
              For best results, paste at least 100 words of text from the article.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">{error}</div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isAnalyzing || articleText.trim().length < 10}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                "Analyze Article"
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div>
          <ResultDisplay result={result} apiMode={apiMode} />
          <div className="mt-6">
            <Button onClick={handleReset} variant="outline">
              Analyze Another Article
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
