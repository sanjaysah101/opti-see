import { AIServiceFactory } from "@/services/ai-service"
import { useEffect, useState } from "react"

type ContrastResult = {
  score: number
  issues: Array<{
    element: string
    foreground: string
    background: string
    ratio: number
    recommendation: string
  }>
  enhancedCSS?: string
}

type AnalysisResponse = {
  analysis: {
    overall_score: number
    issues: Array<{
      element: string
      current_contrast: number
      recommendation: string
      suggested_colors: {
        foreground: string
        background: string
      }
    }>
  }
  css_fixes: string
}

export const useContrastAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeContrast = async () => {
    setIsAnalyzing(true)
    setError(null)

    try {
      // Get all text elements on the page
      const textElements = Array.from(
        document.querySelectorAll(
          "p, h1, h2, h3, h4, h5, h6, span, a, button, label, input"
        )
      )

      // Extract color information
      const elementsData = textElements
        .map((el) => {
          const styles = window.getComputedStyle(el)
          return {
            element: el.tagName.toLowerCase(),
            text: el.textContent?.slice(0, 50) || "",
            foreground: styles.color,
            background: styles.backgroundColor
          }
        })
        .filter((el) => el.text.trim().length > 0)

      // Send to background for AI analysis
      const result = await new Promise<AnalysisResponse | null>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: "ANALYZE_CONTRAST",
            payload: {
              elementData: elementsData,
              options: { minContrast: 4.5 }
            }
          },
          (response) => resolve(response)
        )
      })

      if (!result) {
        throw new Error("No analysis result received")
      }

      // Transform the AI response to match our UI format
      const transformedResult = {
        score: result.analysis.overall_score,
        issues: result.analysis.issues.map((issue) => ({
          element: issue.element,
          foreground: issue.suggested_colors.foreground,
          background: issue.suggested_colors.background,
          ratio: issue.current_contrast,
          recommendation: issue.recommendation
        }))
      }

      setIsAnalyzing(false)
      return transformedResult
    } catch (error) {
      console.error("Error analyzing contrast:", error)
      setError("Failed to analyze contrast")
      setIsAnalyzing(false)
      return null
    }
  }

  const applyEnhancedContrast = (enhancedCSS: string) => {
    const styleEl = document.createElement("style")
    styleEl.id = "opti-see-enhanced-contrast"
    styleEl.textContent = enhancedCSS
    document.head.appendChild(styleEl)
  }

  const removeEnhancedContrast = () => {
    const styleEl = document.getElementById("opti-see-enhanced-contrast")
    if (styleEl) {
      styleEl.remove()
    }
  }

  return {
    analyzeContrast,
    applyEnhancedContrast,
    removeEnhancedContrast,
    isAnalyzing,
    error
  }
}
