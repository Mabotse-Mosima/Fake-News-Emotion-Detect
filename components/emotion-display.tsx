import { Progress } from "@/components/ui/progress"

interface EmotionDisplayProps {
  emotion: string
  confidence: number
}

const EMOTION_COLORS: Record<string, string> = {
  happy: "bg-yellow-500",
  sad: "bg-blue-500",
  angry: "bg-red-500",
  surprised: "bg-purple-500",
  fearful: "bg-orange-500",
  disgusted: "bg-green-500",
  neutral: "bg-gray-500",
  // Additional mappings for different model outputs
  happiness: "bg-yellow-500",
  sadness: "bg-blue-500",
  anger: "bg-red-500",
  surprise: "bg-purple-500",
  fear: "bg-orange-500",
  disgust: "bg-green-500",
  neutral: "bg-gray-500",
  contempt: "bg-indigo-500",
}

const EMOTION_EMOJIS: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  surprised: "😲",
  fearful: "😨",
  disgusted: "🤢",
  neutral: "😐",
  // Additional mappings for different model outputs
  happiness: "😊",
  sadness: "😢",
  anger: "😠",
  surprise: "😲",
  fear: "😨",
  disgust: "🤢",
  neutral: "😐",
  contempt: "😒",
}

export default function EmotionDisplay({ emotion, confidence }: EmotionDisplayProps) {
  const formattedEmotion = emotion.toLowerCase()
  const color = EMOTION_COLORS[formattedEmotion] || "bg-gray-500"
  const emoji = EMOTION_EMOJIS[formattedEmotion] || ""
  const confidencePercent = Math.round(confidence * 100)

  // Format the emotion name for display (capitalize first letter)
  const displayEmotion = formattedEmotion.charAt(0).toUpperCase() + formattedEmotion.slice(1)

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{emoji}</span>
          <h3 className="text-xl font-medium">{displayEmotion}</h3>
        </div>
        <span className="text-sm font-medium">{confidencePercent}%</span>
      </div>
      <Progress value={confidencePercent} className={color} />
    </div>
  )
}
