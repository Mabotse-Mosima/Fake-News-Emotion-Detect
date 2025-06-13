// This is a frontend simulation of what would normally be a backend API call to a Python Flask service

import { extractFeatures } from "./text-features"

// Simulated model weights (in a real app, these would come from a trained model)
const MODEL_WEIGHTS = {
  sensationalism_score: 0.35,
  emotional_words: 0.25,
  clickbait_score: 0.3,
  political_bias: 0.2,
  source_citations: -0.4, // Negative weight means more citations reduce fake news probability
  exclamation_count: 0.15,
  capitalization_ratio: 0.2,
  spelling_errors: 0.1,
  passive_voice: -0.05,
  sentence_complexity: -0.15,
}

// Bias term in the model
const BIAS = -0.1

/**
 * Analyzes an article text and returns a prediction of whether it's fake or real
 */
export async function analyzeArticle(text: string) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Extract features from the text
  const features = extractFeatures(text)

  // Calculate prediction score using a simple linear model
  let score = BIAS
  for (const [feature, weight] of Object.entries(MODEL_WEIGHTS)) {
    if (feature in features) {
      score += features[feature] * weight
    }
  }

  // Apply sigmoid function to get probability
  const probability = 1 / (1 + Math.exp(-score))

  // Determine prediction based on threshold
  const prediction = probability > 0.5 ? "fake" : "real"

  // Calculate confidence (how far from 0.5 the probability is)
  const confidence = Math.abs(probability - 0.5) * 2

  return {
    prediction,
    confidence,
    features,
  }
}
