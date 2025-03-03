import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { useAltTextGenerator } from "@/features/alt-text-generator"
import { Image, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

type AltTextSuggestion = {
  src: string
  alt_text: string
  confidence: number
  reasoning: string
}

export const AltTextGenerator = () => {
  const {
    generateAltText,
    highlightImagesWithoutAlt,
    removeHighlights,
    isGenerating
  } = useAltTextGenerator()
  const [suggestions, setSuggestions] = useState<AltTextSuggestion[]>([])

  const handleAnalyze = async () => {
    // Get all images without alt text
    const images = Array.from(
      document.querySelectorAll("img:not([alt]), img[alt='']")
    ).map((img) => ({
      src: (img as HTMLImageElement).src,
      dimensions: {
        width: img.clientWidth,
        height: img.clientHeight
      },
      contextualText: getContextualText(img)
    }))

    highlightImagesWithoutAlt()
    const result = await generateAltText(images)
    if (result) {
      setSuggestions(result)
    }
  }

  const getContextualText = (img: Element): string => {
    // Get nearby text that might provide context
    const nearby = img.parentElement?.textContent?.trim().slice(0, 100) || ""
    return nearby
  }

  const applyAltText = (suggestion: AltTextSuggestion) => {
    const img = document.querySelector(
      `img[src="${suggestion.src}"]`
    ) as HTMLImageElement
    if (img) {
      img.setAttribute("alt", suggestion.alt_text)
      img.setAttribute("data-ai-alt", "true")
    }
  }

  useEffect(() => {
    return () => {
      removeHighlights()
    }
  }, [removeHighlights])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Alt Text Generator
        </CardTitle>
        <CardDescription>
          Generate accessible alt text for images
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={handleAnalyze}
            disabled={isGenerating}
            className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Images...
              </>
            ) : (
              "Analyze Images"
            )}
          </Button>

          {suggestions.length > 0 && (
            <div className="space-y-4">
              <div className="font-medium">
                Suggestions ({suggestions.length})
              </div>
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="rounded-lg border p-3">
                    <img
                      src={suggestion.src}
                      className="mb-2 h-20 w-20 object-cover"
                      alt={suggestion.alt_text}
                    />
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Suggested Alt Text:
                      </div>
                      <div className="text-sm">{suggestion.alt_text}</div>
                      <div className="text-xs text-muted-foreground">
                        {suggestion.reasoning}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => applyAltText(suggestion)}>
                        Apply Suggestion
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
