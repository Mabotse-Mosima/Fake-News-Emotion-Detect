import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ApiTokenMissing() {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>API Token Required</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="warning" className="mb-4">
          <AlertTitle>Hugging Face API Token Missing</AlertTitle>
          <AlertDescription>This application requires a Hugging Face API token to function properly.</AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">How to set up your API token:</h3>

          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Create a free account at{" "}
              <a
                href="https://huggingface.co/join"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Hugging Face
              </a>
            </li>
            <li>
              Generate an API token in your{" "}
              <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                account settings
              </a>
            </li>
            <li>
              Add the token to your environment variables as{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">HUGGING_FACE_TOKEN</code>
            </li>
            <li>Restart your application</li>
          </ol>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          The emotion detection feature will be available once you've configured your API token.
        </p>
      </CardFooter>
    </Card>
  )
}
