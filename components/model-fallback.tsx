"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ModelFallback() {
  const [showInstructions, setShowInstructions] = useState(false)

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Face Emotion Detection</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div
          className="bg-amber-100 border border-amber-400 text-amber-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <p className="font-bold">Model files not found</p>
          <p className="block sm:inline">
            The required AI model files could not be loaded. This is likely because they haven't been downloaded yet.
          </p>
        </div>

        {showInstructions && (
          <div className="bg-gray-100 p-4 rounded-lg w-full">
            <h3 className="font-bold mb-2">How to fix this:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Make sure you have the model files in the{" "}
                <code className="bg-gray-200 px-1 rounded">public/models</code> directory
              </li>
              <li>
                Run <code className="bg-gray-200 px-1 rounded">node scripts/download-models.js</code> to download the
                required model files
              </li>
              <li>Refresh the page after the models have been downloaded</li>
            </ol>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={() => setShowInstructions(!showInstructions)}>
          {showInstructions ? "Hide Instructions" : "Show Instructions"}
        </Button>
      </CardFooter>
    </Card>
  )
}
