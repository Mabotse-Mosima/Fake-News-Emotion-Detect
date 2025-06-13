import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Info } from "lucide-react"

interface ResultDisplayProps {
  result: {
    prediction: "real" | "fake"
    confidence: number
    probability: number
    features: Record<string, number>
    additional_features?: Record<string, number>
  }
  apiMode: "live" | "demo"
}

export default function ResultDisplay({ result, apiMode }: ResultDisplayProps) {
  const { prediction, confidence, probability, features, additional_features } = result
  const confidencePercent = Math.round(confidence * 100)
  const probabilityPercent = Math.round(probability * 100)

  // Sort features by importance (absolute value)
  const sortedFeatures = Object.entries(features)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 5) // Show top 5 features

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Analysis Result</h3>
        <div className="flex items-center">
          <span className="text-sm text-slate-500 mr-2">Confidence:</span>
          <Badge variant={confidencePercent > 75 ? "default" : confidencePercent > 50 ? "outline" : "secondary"}>
            {confidencePercent}%
          </Badge>
        </div>
      </div>

      <div
        className={`p-4 rounded-md ${prediction === "fake" ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}
      >
        <div className="flex items-center">
          {prediction === "fake" ? (
            <>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-red-800">Potentially Fake News</h4>
                <p className="text-red-700">
                  This article shows characteristics commonly found in fake or misleading news.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-green-800">Likely Legitimate News</h4>
                <p className="text-green-700">
                  This article appears to have characteristics of legitimate news reporting.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium mb-3">Prediction Confidence</h4>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Legitimate News</span>
            <span>Fake News</span>
          </div>
          <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 bottom-0 left-0 ${prediction === "fake" ? "bg-red-400" : "bg-green-400"}`}
              style={{ width: `${probabilityPercent}%`, right: prediction === "fake" ? "0" : "auto" }}
            ></div>
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-300"></div>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium mb-3">Key Factors in Analysis</h4>
        <div className="space-y-3">
          {sortedFeatures.map(([feature, value]) => {
            const absValue = Math.abs(value)
            const isPositive = value > 0
            const barWidth = Math.min(Math.round(absValue * 100), 100)

            return (
              <div key={feature} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{formatFeatureName(feature)}</span>
                  <span className={isPositive ? "text-red-600" : "text-green-600"}>
                    {isPositive ? "More likely fake" : "More likely legitimate"}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isPositive ? "bg-red-400" : "bg-green-400"}`}
                    style={{ width: `${barWidth}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {additional_features && (
        <div>
          <h4 className="text-md font-medium mb-3">Additional Text Statistics</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(additional_features)
              .filter(([key]) => !key.includes("ratio") && typeof additional_features[key] === "number")
              .slice(0, 6)
              .map(([key, value]) => (
                <div key={key} className="bg-slate-50 p-3 rounded-md">
                  <div className="text-xs text-slate-500">{formatFeatureName(key)}</div>
                  <div className="text-lg font-medium">{formatValue(key, value)}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-md border border-blue-200 text-sm text-blue-800 flex">
        <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Important Note</p>
          <p className="mt-1">
            {apiMode === "demo"
              ? "This is a demonstration with simulated results. In a real implementation, the analysis would use a trained machine learning model."
              : "This analysis is based on textual patterns only and should not be the sole determinant of an article's credibility. Always verify information through multiple reputable sources."}
          </p>
        </div>
      </div>
    </div>
  )
}

function formatFeatureName(feature: string): string {
  // Convert feature names to more readable format
  const featureMap: Record<string, string> = {
    sensationalism_score: "Sensationalist Language",
    emotional_words: "Emotional Content",
    clickbait_score: "Clickbait Patterns",
    political_bias: "Political Bias",
    source_citations: "Source Citations",
    exclamation_count: "Exclamation Marks",
    capitalization_ratio: "ALL CAPS Usage",
    spelling_errors: "Spelling Errors",
    passive_voice: "Passive Voice",
    sentence_complexity: "Sentence Complexity",
    text_length: "Text Length",
    sensationalist_language: "Sensationalist Language",
    all_caps_usage: "ALL CAPS Usage",
    question_count: "Question Marks",
    avg_word_length: "Average Word Length",
    sensationalist_word_count: "Sensationalist Words",
    all_caps_count: "ALL CAPS Words",
    exclamation_marks: "Exclamation Marks",
  }

  return featureMap[feature] || feature.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

function formatValue(key: string, value: number): string {
  if (key.includes("count") || key === "text_length") {
    return Math.round(value).toString()
  }

  if (key.includes("avg") || key.includes("ratio")) {
    return value.toFixed(2)
  }

  return value.toString()
}
