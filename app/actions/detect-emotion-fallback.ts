"use server"

// This is a fallback approach using text-based emotion detection
// We'll use this if the image-based detection fails

import { HfInference } from "@huggingface/inference"

const hf = new HfInference(process.env.HUGGING_FACE_TOKEN)

// Text-based emotion classification model
const TEXT_EMOTION_MODEL = "SamLowe/roberta-base-go_emotions"

export async function detectEmotionFromText(text: string) {
  try {
    const result = await hf.textClassification({
      model: TEXT_EMOTION_MODEL,
      inputs: text,
    })

    if (!result || !Array.isArray(result) || result.length === 0) {
      return {
        success: false,
        error: "No emotion detected in text",
      }
    }

    // Get the top prediction
    const topPrediction = result[0]

    return {
      success: true,
      emotion: topPrediction.label,
      confidence: topPrediction.score,
    }
  } catch (error: any) {
    console.error("Error in text emotion detection:", error)

    return {
      success: false,
      error: `Failed to process text: ${error.message || "Unknown error"}`,
    }
  }
}
