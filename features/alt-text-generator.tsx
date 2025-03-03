import { useState } from "react"

export type ImageInfo = {
  src: string
  alt?: string
  currentAlt?: string
  dimensions?: {
    width: number
    height: number
  }
  contextualText?: string // Nearby text that might help describe the image
}

export const useAltTextGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateAltText = async (images: ImageInfo[]) => {
    setIsGenerating(true)
    setError(null)

    try {
      const result = await new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: "GENERATE_ALT_TEXT",
            payload: { images }
          },
          (response) => resolve(response)
        )
      })

      if (!result) {
        throw new Error("No alt text generated")
      }

      return result.suggestions
    } catch (error) {
      console.error("Error generating alt text:", error)
      setError("Failed to generate alt text")
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  const applyAltText = (imageElement: HTMLImageElement, altText: string) => {
    imageElement.setAttribute("alt", altText)
    // Add a visual indicator for developers
    imageElement.setAttribute("data-ai-alt", "true")
  }

  const highlightImagesWithoutAlt = () => {
    document.querySelectorAll("img:not([alt]), img[alt='']").forEach((img) => {
      ;(img as HTMLImageElement).style.outline = "3px solid #ff6b6b"
      ;(img as HTMLImageElement).style.outlineOffset = "2px"
    })
  }

  const removeHighlights = () => {
    document.querySelectorAll("[data-ai-alt]").forEach((img) => {
      ;(img as HTMLImageElement).style.outline = ""
      ;(img as HTMLImageElement).style.outlineOffset = ""
    })
  }

  return {
    generateAltText,
    applyAltText,
    highlightImagesWithoutAlt,
    removeHighlights,
    isGenerating,
    error
  }
}
