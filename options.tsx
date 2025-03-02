import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import "globals.css"

const OptionsPage = () => {
  const [claudeApiKey, setClaudeApiKey] = useState("")
  const [geminiApiKey, setGeminiApiKey] = useState("")
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const storage = new Storage()

  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        const claudeKey = await storage.get("claude_api_key")
        const geminiKey = await storage.get("gemini_api_key")

        if (claudeKey) {
          setClaudeApiKey(claudeKey)
        }

        if (geminiKey) {
          setGeminiApiKey(geminiKey)
        }
      } catch (error) {
        console.error("Failed to load API keys:", error)
      }
    }

    loadApiKeys()
  }, [])

  const saveApiKeys = async () => {
    try {
      await storage.set("claude_api_key", claudeApiKey)
      await storage.set("gemini_api_key", geminiApiKey)
      setSaveStatus("API keys saved successfully!")

      setTimeout(() => {
        setSaveStatus(null)
      }, 3000)
    } catch (error) {
      console.error("Failed to save API keys:", error)
      setSaveStatus("Error saving API keys")
    }
  }

  return (
    <div className="container mx-auto max-w-2xl p-8">
      <h1 className="mb-8 text-3xl font-bold">OptiSee Settings</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="claude-api-key">Claude API Key</Label>
              <Input
                id="claude-api-key"
                type="password"
                value={claudeApiKey}
                onChange={(e) => setClaudeApiKey(e.target.value)}
                placeholder="Enter your Claude API key"
              />
              <p className="text-xs text-gray-500">
                Get your API key from the{" "}
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:underline">
                  Anthropic Console
                </a>
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gemini-api-key">Gemini API Key</Label>
              <Input
                id="gemini-api-key"
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
              />
              <p className="text-xs text-gray-500">
                Get your API key from the{" "}
                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:underline">
                  Google AI Studio
                </a>
              </p>
            </div>

            <Button onClick={saveApiKeys}>Save API Keys</Button>

            {saveStatus && (
              <div className="mt-2 rounded bg-green-100 p-2 text-green-800">
                {saveStatus}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Additional accessibility settings will be added in future updates.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default OptionsPage
