import NewsAnalyzer from "@/components/news-analyzer"
import EmotionDetector from "@/components/emotion-detector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="bg-slate-800 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">AI Detection Systems</h1>
          <p className="text-slate-300 mt-2">Research-based analysis using machine learning</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="fake-news" className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fake-news">Fake News Detection</TabsTrigger>
              <TabsTrigger value="emotion">Emotion Detection</TabsTrigger>
            </TabsList>
            <TabsContent value="fake-news" className="mt-6">
              <NewsAnalyzer />

              <div className="mt-12 bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h2 className="text-xl font-semibold mb-4">About Fake News Detection</h2>
                <p className="mb-4">
                  This fake news detection system uses advanced natural language processing and machine learning
                  techniques to analyze news articles. The model has been trained on thousands of labeled examples of
                  both legitimate and fake news articles.
                </p>

                <h3 className="font-medium text-lg mt-6 mb-2">Key Features Analyzed:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Linguistic Patterns:</strong> Sentence structure, complexity, and word choice
                  </li>
                  <li>
                    <strong>Stylistic Elements:</strong> Punctuation usage, capitalization, and formatting
                  </li>
                  <li>
                    <strong>Content Analysis:</strong> Sensationalist language, emotional content, and clickbait
                    patterns
                  </li>
                  <li>
                    <strong>Source Indicators:</strong> Citation patterns and reference to authoritative sources
                  </li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="emotion" className="mt-6">
              <EmotionDetector />

              <div className="mt-12 bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h2 className="text-xl font-semibold mb-4">About Emotion Detection</h2>
                <p className="mb-4">
                  This emotion detection system uses computer vision and deep learning to analyze facial expressions and
                  identify emotions. The model is trained on thousands of labeled images of facial expressions.
                </p>

                <h3 className="font-medium text-lg mt-6 mb-2">How It Works:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>The system captures an image from your webcam</li>
                  <li>Face detection algorithms locate and extract facial features</li>
                  <li>A convolutional neural network analyzes the facial features</li>
                  <li>The model classifies the expression into one of seven basic emotions</li>
                  <li>Results are displayed with a confidence score</li>
                </ol>

                <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
                  <p className="text-blue-800 text-sm">
                    <strong>Privacy Note:</strong> All processing is done locally in your browser. No images are stored
                    or transmitted to external servers.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <footer className="bg-slate-100 py-6 border-t border-slate-200">
        <div className="container mx-auto px-4 text-center text-slate-600 text-sm">
          <p>AI Detection Systems | Research Implementation</p>
          <p className="mt-2">Based on academic research in machine learning and computer vision</p>
        </div>
      </footer>
    </main>
  )
}
