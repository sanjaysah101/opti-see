import { AIServiceFactory, ClaudeAIService } from "@/services/ai-service"
import { useState } from "react"

type SimplificationLevel = "mild" | "moderate" | "strong"

type SimplificationResult = {
  original: string
  simplified: string
  readingLevel: string
  statistics: {
    originalWordCount: number
    simplifiedWordCount: number
    originalReadingTime: number
    simplifiedReadingTime: number
  }
}

export const useContentSimplifier = () => {
  const [isSimplifying, setIsSimplifying] = useState(false)
  const [result, setResult] = useState<SimplificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const simplifyContent = async (level: SimplificationLevel = "moderate") => {
    console.log("Starting content simplification")
    setIsSimplifying(true)
    setError(null)

    try {
      // Get the main content of the page
      const mainContent = document.querySelector(
        "main, article, .content, #content"
      )
      const contentToSimplify =
        mainContent?.textContent || document.body.textContent || ""

      // Trim and limit content length for API calls
      const trimmedContent = contentToSimplify.trim().slice(0, 5000)

      // Get Claude AI service
      const aiService = AIServiceFactory.getService("claude") as ClaudeAIService

      // Check if the service is initialized with an API key
      const isInitialized = await aiService.isInitialized()
      console.log("Service initialized:", isInitialized)

      if (!isInitialized) {
        throw new Error("Claude API key not configured")
      }

      try {
        // Use the specialized simplifyContent method
        console.log("Calling simplifyContent method")
        const simplifiedText = await aiService.simplifyContent(
          trimmedContent,
          level
        )

        // Calculate statistics
        const originalWordCount = trimmedContent.split(/\s+/).length
        const simplifiedWordCount = simplifiedText.split(/\s+/).length

        const result: SimplificationResult = {
          original: trimmedContent.slice(0, 200) + "...",
          simplified: simplifiedText,
          readingLevel:
            level === "mild"
              ? "Grade 8-9"
              : level === "moderate"
                ? "Grade 6-7"
                : "Grade 4-5",
          statistics: {
            originalWordCount,
            simplifiedWordCount,
            originalReadingTime: Math.ceil(originalWordCount / 200), // words per minute
            simplifiedReadingTime: Math.ceil(simplifiedWordCount / 200)
          }
        }

        setResult(result)
      } catch (apiError) {
        console.error("API error:", apiError)

        // Fallback to simulated result if API fails
        const originalWordCount = trimmedContent.split(/\s+/).length
        const simplifiedWordCount = Math.floor(originalWordCount * 0.7)

        const fallbackResult: SimplificationResult = {
          original: trimmedContent.slice(0, 200) + "...",
          simplified:
            "This is a simplified version of the content. It uses shorter sentences and simpler words. It keeps the main ideas but makes them easier to understand.",
          readingLevel:
            level === "mild"
              ? "Grade 8-9"
              : level === "moderate"
                ? "Grade 6-7"
                : "Grade 4-5",
          statistics: {
            originalWordCount,
            simplifiedWordCount,
            originalReadingTime: Math.ceil(originalWordCount / 200),
            simplifiedReadingTime: Math.ceil(simplifiedWordCount / 200)
          }
        }

        setResult(fallbackResult)
        setError(
          "Using simulated result due to API error: " +
            (apiError instanceof Error ? apiError.message : String(apiError))
        )
      }
    } catch (err) {
      setError(
        "Failed to simplify content: " +
          (err instanceof Error ? err.message : String(err))
      )
    } finally {
      setIsSimplifying(false)
    }
  }

  const applySimplifiedContent = () => {
    if (!result?.simplified) return

    // Find main content container
    const mainContent = document.querySelector(
      "main, article, .content, #content"
    )

    if (mainContent) {
      // Store original content
      if (!mainContent.hasAttribute("data-original-content")) {
        mainContent.setAttribute("data-original-content", mainContent.innerHTML)
      }

      // Replace with simplified content
      mainContent.innerHTML = `<div class="opti-see-simplified">
        <p style="font-size: 1.1em; line-height: 1.6;">${result.simplified}</p>
        <p style="margin-top: 20px; font-style: italic; font-size: 0.9em;">
          Reading level: ${result.readingLevel} | 
          Reading time: ${result.statistics.simplifiedReadingTime} min
        </p>
      </div>`
    }
  }

  const restoreOriginalContent = () => {
    const mainContent = document.querySelector(
      "main, article, .content, #content"
    )

    if (mainContent && mainContent.hasAttribute("data-original-content")) {
      mainContent.innerHTML =
        mainContent.getAttribute("data-original-content") || ""
      mainContent.removeAttribute("data-original-content")
    }
  }

  return {
    simplifyContent,
    applySimplifiedContent,
    restoreOriginalContent,
    isSimplifying,
    result,
    error
  }
}
