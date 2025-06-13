/**
 * Extracts features from article text for fake news detection
 */
export function extractFeatures(text: string): Record<string, number> {
  const features: Record<string, number> = {}

  // Normalize text
  const normalizedText = text.toLowerCase()
  const words = normalizedText.match(/\b\w+\b/g) || []
  const totalWords = words.length

  // Sensationalism score (based on sensationalist words)
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
  const sensationalistCount = countWordsFromList(normalizedText, sensationalistWords)
  features.sensationalism_score = Math.min(sensationalistCount / (totalWords / 50), 1)

  // Emotional words
  const emotionalWords = [
    "angry",
    "furious",
    "outraged",
    "devastated",
    "thrilled",
    "excited",
    "terrified",
    "scared",
    "afraid",
    "happy",
    "sad",
    "disgusted",
    "hate",
    "love",
  ]
  const emotionalCount = countWordsFromList(normalizedText, emotionalWords)
  features.emotional_words = Math.min(emotionalCount / (totalWords / 30), 1)

  // Clickbait patterns
  const clickbaitPatterns = [
    "you won't believe",
    "mind blowing",
    "what happens next",
    "this is why",
    "here's why",
    "find out",
    "the truth about",
    "will shock you",
  ]
  let clickbaitScore = 0
  clickbaitPatterns.forEach((pattern) => {
    if (normalizedText.includes(pattern)) clickbaitScore += 0.2
  })
  features.clickbait_score = Math.min(clickbaitScore, 1)

  // Political bias words
  const politicalWords = [
    "liberal",
    "conservative",
    "democrat",
    "republican",
    "leftist",
    "right-wing",
    "radical",
    "socialist",
    "fascist",
    "communist",
    "trump",
    "biden",
  ]
  const politicalCount = countWordsFromList(normalizedText, politicalWords)
  features.political_bias = Math.min(politicalCount / (totalWords / 40), 1)

  // Source citations (look for phrases that indicate sources)
  const sourcePhrases = [
    "according to",
    "said that",
    "reported by",
    "study shows",
    "research indicates",
    "experts say",
    "sources confirm",
    "data shows",
    "evidence suggests",
  ]
  let sourceCount = 0
  sourcePhrases.forEach((phrase) => {
    const regex = new RegExp(phrase, "gi")
    const matches = normalizedText.match(regex)
    if (matches) sourceCount += matches.length
  })
  features.source_citations = Math.min(sourceCount / 3, 1)

  // Exclamation count
  const exclamationCount = (text.match(/!/g) || []).length
  features.exclamation_count = Math.min(exclamationCount / 5, 1)

  // Capitalization ratio (ALL CAPS words)
  const allCapsWords = text.match(/\b[A-Z]{2,}\b/g) || []
  features.capitalization_ratio = Math.min(allCapsWords.length / (totalWords / 20), 1)

  // Spelling errors (simplified simulation)
  // In a real app, this would use a proper spell checker
  const commonlyMisspelledWords = [
    "definately",
    "seperate",
    "wierd",
    "recieve",
    "untill",
    "occured",
    "goverment",
    "suprise",
    "accomodate",
    "begining",
    "beleive",
    "concious",
    "foriegn",
  ]
  const spellingErrors = countWordsFromList(normalizedText, commonlyMisspelledWords)
  features.spelling_errors = Math.min(spellingErrors / 3, 1)

  // Passive voice (simplified detection)
  const passiveVoicePatterns = [
    "was made",
    "were made",
    "has been",
    "have been",
    "was done",
    "were done",
    "is being",
    "are being",
    "was given",
    "were given",
  ]
  let passiveCount = 0
  passiveVoicePatterns.forEach((pattern) => {
    const regex = new RegExp(pattern, "gi")
    const matches = normalizedText.match(regex)
    if (matches) passiveCount += matches.length
  })
  features.passive_voice = Math.min(passiveCount / 5, 1)

  // Sentence complexity (based on average sentence length)
  const sentences = text.split(/[.!?]+/)
  const avgSentenceLength = totalWords / Math.max(sentences.length, 1)
  features.sentence_complexity = Math.min(avgSentenceLength / 25, 1)

  return features
}

/**
 * Counts occurrences of words from a list in a text
 */
function countWordsFromList(text: string, wordList: string[]): number {
  let count = 0
  wordList.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    const matches = text.match(regex)
    if (matches) count += matches.length
  })
  return count
}
