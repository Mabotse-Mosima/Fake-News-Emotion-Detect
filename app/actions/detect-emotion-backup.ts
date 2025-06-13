"use server"

import { HfInference } from "@huggingface/inference"

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGING_FACE_TOKEN)

// Alternative model for facial emotion recognition
const BACKUP_EMOTION_MODEL = "Rajaram1996/FacialEmoRecog"

export async function detectEmotionBackup(formData: FormData) {
  try {
    // Get image from form data
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      return {
        success: false,
        error: "No image provided",
      }
    }

    // Convert file to array buffer
    const arrayBuffer = await imageFile.arrayBuffer()
    const imageBuffer = new Uint8Array(arrayBuffer)

    // Call Hugging Face API for image classification with backup model
    const result = await hf.imageClassification({
      model: BACKUP_EMOTION_MODEL,
      data: imageBuffer,
    })

    // Check if we got valid results
    if (!result || !Array.isArray(result) || result.length === 0) {
      return {
        success: false,
        error: "No emotion detected in the response",
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
    console.error("Error in backup emotion detection:", error)

    return {
      success: false,
      error: `Backup detection failed: ${error.message || "Unknown error"}`,
    }
  }
}
