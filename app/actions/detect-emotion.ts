"use server"

import { HfInference } from "@huggingface/inference"

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGING_FACE_TOKEN)

// Using a model specifically designed for facial emotion recognition from images
const EMOTION_MODEL = "trpakov/vit-face-expression"

export async function detectEmotion(formData: FormData) {
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

    // Log image size for debugging
    console.log(`Processing image of size: ${imageBuffer.length} bytes`)

    // Call Hugging Face API for image classification
    const result = await hf.imageClassification({
      model: EMOTION_MODEL,
      data: imageBuffer,
    })

    console.log("API Response:", JSON.stringify(result))

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
    console.error("Error in emotion detection:", error)

    // Provide more detailed error information
    let errorMessage = "Failed to process image"

    if (error.message) {
      errorMessage += `: ${error.message}`
    }

    if (error.response) {
      try {
        const responseText = await error.response.text()
        console.error("API error response:", responseText)
        errorMessage += ` (API error: ${responseText})`
      } catch (e) {
        console.error("Could not parse error response:", e)
      }
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}
