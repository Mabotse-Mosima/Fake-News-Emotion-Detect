import { type NextRequest, NextResponse } from "next/server"

// This is a proxy to the Python backend
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // In a real implementation, this would call the Python backend
    // For now, we'll simulate a response

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Extract some basic features for the simulation
    const text = body.text
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

    // Create additional features
    const additional_features = {
      text_length: words,
      exclamation_count: exclamationCount,
      question_count: questionCount,
      all_caps_count: allCapsWords,
      sensationalist_word_count: sensationalistCount,
      avg_word_length: text.length / Math.max(words, 1),
    }

    return NextResponse.json({
      prediction: fakeScore > 0.5 ? "fake" : "real",
      confidence: Math.abs(fakeScore - 0.5) * 2,
      probability: fakeScore,
      features,
      additional_features,
    })
  } catch (error) {
    console.error("Error in analyze API:", error)
    return NextResponse.json({ error: "An error occurred during analysis" }, { status: 500 })
  }
}
