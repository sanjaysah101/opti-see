import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

export const ApiKeyConfig = () => {
  const [apiKey, setApiKey] = useStorage("claude-api-key", "")
  const [tempKey, setTempKey] = useState(apiKey || "")

  const saveApiKey = () => {
    setApiKey(tempKey)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="api-key">Claude API Key</Label>
        <Input
          id="api-key"
          type="password"
          value={tempKey}
          onChange={(e) => setTempKey(e.target.value)}
          placeholder="Enter your Claude API key"
        />
      </div>
      <Button onClick={saveApiKey}>Save API Key</Button>
    </div>
  )
}
