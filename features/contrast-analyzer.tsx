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
      text_content: string
      current_contrast: number
      current_colors: {
        foreground: string
        background: string
      }
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

  const highlightIssues = (issues: Array<any>) => {
    // Remove any existing highlights
    removeHighlights()

    // Add new highlights
    issues.forEach((issue) => {
      try {
        // Try to find elements with the given selector
        const elements = document.querySelectorAll(issue.element)
        if (elements.length === 0) {
          // Fallback to tag name if specific selector doesn't match
          const tagName = issue.element.split(/[.#]/)[0]
          const fallbackElements = document.getElementsByTagName(tagName)
          Array.from(fallbackElements).forEach((el) => {
            if (el.textContent?.includes(issue.text_content)) {
              highlightElement(el, issue)
            }
          })
        } else {
          elements.forEach((el) => highlightElement(el, issue))
        }
      } catch (error) {
        console.error(`Failed to highlight element: ${issue.element}`, error)
      }
    })
  }

  const highlightElement = (el: Element, issue: any) => {
    el.setAttribute("data-contrast-issue", "true")
    const existingStyle = el.getAttribute("style") || ""
    el.setAttribute(
      "style",
      `${existingStyle};
      outline: 2px solid #ff6b6b !important;
      outline-offset: 2px !important;
      position: relative !important;`
    )

    // Add tooltip with contrast information
    const tooltip = document.createElement("div")
    tooltip.className = "contrast-issue-tooltip"
    tooltip.style.cssText = `
      position: absolute;
      top: -24px;
      left: 0;
      background: #ff6b6b;
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 9999;
      pointer-events: none;
    `
    tooltip.textContent = `Contrast: ${issue.current_contrast.toFixed(2)}:1`
    el.appendChild(tooltip)
  }

  const removeHighlights = () => {
    document.querySelectorAll('[data-contrast-issue="true"]').forEach((el) => {
      el.removeAttribute("data-contrast-issue")
      el.removeAttribute("style")
    })
  }

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
          // Create a unique selector for the element
          const selector = getElementSelector(el)
          return {
            element: selector,
            text_content: el.textContent?.slice(0, 50) || "",
            foreground: styles.color,
            background: styles.backgroundColor
          }
        })
        .filter((el) => el.text_content.trim().length > 0)

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
          text: issue.text_content,
          foreground: issue.suggested_colors.foreground,
          background: issue.suggested_colors.background,
          ratio: issue.current_contrast,
          recommendation: issue.recommendation
        }))
      }

      // Highlight issues on the page
      highlightIssues(result.analysis.issues)

      setIsAnalyzing(false)
      return transformedResult
    } catch (error) {
      console.error("Error analyzing contrast:", error)
      setError("Failed to analyze contrast")
      setIsAnalyzing(false)
      removeHighlights()
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

  // Clean up highlights when component unmounts
  useEffect(() => {
    return () => {
      removeHighlights()
    }
  }, [])

  // Add this helper function to get specific selectors
  const getElementSelector = (el: Element): string => {
    let path = el.tagName.toLowerCase()
    if (el.id) {
      return `#${el.id}`
    }
    if (el.classList.length) {
      path += `.${Array.from(el.classList).join(".")}`
    }
    return path
  }

  return {
    analyzeContrast,
    applyEnhancedContrast,
    removeEnhancedContrast,
    isAnalyzing,
    error,
    removeHighlights
  }
}
