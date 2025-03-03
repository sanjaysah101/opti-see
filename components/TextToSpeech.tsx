import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { useTextToSpeech } from "@/features/text-to-speech"
import { Pause, Play, Volume2 } from "lucide-react"
import { useEffect } from "react"

export const TextToSpeech = () => {
  const { speak, stop, isPlaying, hasText, error } = useTextToSpeech()

  const handleSpeak = () => {
    if (isPlaying) {
      stop()
    } else {
      speak()
    }
  }

  // Add keyboard shortcut (Ctrl/Cmd + Shift + S)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "S") {
        e.preventDefault()
        handleSpeak()
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [isPlaying])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Text to Speech
        </CardTitle>
        <CardDescription>
          Select text and click play or use Ctrl+Shift+S
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={handleSpeak}
            disabled={!hasText && !isPlaying}
            className="w-full">
            {isPlaying ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Play Selected Text
              </>
            )}
          </Button>
          {error && <div className="text-sm text-red-500">{error}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
