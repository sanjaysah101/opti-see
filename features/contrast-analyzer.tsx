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

export const useContrastAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ContrastResult | null>(null)
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

      // Use AI to analyze contrast
      const aiService = AIServiceFactory.getService("gemini")
      const analysisResult = await aiService.analyze(
        JSON.stringify(elementsData),
        {
          task: "contrast_analysis"
        }
      )

      // For demo purposes, generate a simulated result
      const simulatedResult: ContrastResult = {
        score: 0.78,
        issues: [
          {
            element: "p",
            foreground: "rgb(120, 120, 120)",
            background: "rgb(245, 245, 245)",
            ratio: 2.8,
            recommendation:
              "Increase contrast to at least 4.5:1 by using #595959 for text"
          },
          {
            element: "a",
            foreground: "rgb(70, 130, 180)",
            background: "rgb(240, 240, 240)",
            ratio: 3.2,
            recommendation: "Darken link color to #0056b3 for better contrast"
          }
        ],
        enhancedCSS: `
          p { color: #595959 !important; }
          a { color: #0056b3 !important; }
        `
      }

      setResult(simulatedResult)
    } catch (err) {
      setError(
        "Failed to analyze contrast: " +
          (err instanceof Error ? err.message : String(err))
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const applyEnhancedContrast = () => {
    if (result?.enhancedCSS) {
      const styleEl = document.createElement("style")
      styleEl.id = "opti-see-enhanced-contrast"
      styleEl.textContent = result.enhancedCSS
      document.head.appendChild(styleEl)
    }
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
    result,
    error
  }
}
