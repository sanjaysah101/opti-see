import { AIServiceFactory } from "@/services/ai-service"
import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

type ContrastOptions = {
  autoAdjust: boolean
  minContrast: number // WCAG recommendation is 4.5:1 for normal text
  preferredColorScheme: "maintain" | "enhance" | "maximize"
  mode: "ai" | "manual"
  manualSettings?: {
    textColor: string
    backgroundColor: string
    linkColor: string
    headingColor: string
  }
}

export const useContrastOptimization = () => {
  const [isActive, setIsActive] = useState(false)
  const [options, setOptions] = useState<ContrastOptions>({
    autoAdjust: true,
    minContrast: 4.5,
    preferredColorScheme: "enhance",
    mode: "ai",
    manualSettings: {
      textColor: "#000000",
      backgroundColor: "#FFFFFF",
      linkColor: "#0066CC",
      headingColor: "#1A1A1A"
    }
  })
  const [apiKey] = useStorage("claude-api-key")

  const toggleContrastMode = async () => {
    console.log("🔍 Toggling contrast mode:", !isActive)
    const newState = !isActive
    setIsActive(newState)

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      if (!tab?.id) {
        console.warn("❌ No active tab found")
        return
      }

      await chrome.tabs.sendMessage(tab.id, {
        type: "TOGGLE_CONTRAST_OPTIMIZATION",
        payload: {
          enabled: newState,
          options
        }
      })

      console.log("✅ Contrast mode toggled successfully")
    } catch (error) {
      console.error("❌ Failed to toggle contrast mode:", error)
      setIsActive(!newState) // Revert state on error
    }
  }

  const updateOptions = async (newOptions: Partial<ContrastOptions>) => {
    console.log("🔄 Updating contrast options:", newOptions)

    // Merge the new options with existing ones
    const updatedOptions = {
      ...options,
      ...newOptions,
      manualSettings: {
        ...options.manualSettings,
        ...(newOptions.manualSettings || {})
      }
    }
    setOptions(updatedOptions)

    if (isActive) {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true
        })
        if (!tab?.id) {
          console.warn("❌ No active tab found for options update")
          return
        }

        // Send immediate update for manual mode
        chrome.tabs.sendMessage(tab.id, {
          type: "UPDATE_CONTRAST_OPTIMIZATION",
          payload: {
            options: updatedOptions
          }
        })
      } catch (error) {
        console.error("❌ Failed to update contrast options:", error)
      }
    }
  }

  const analyzeContrast = async (elementData: any) => {
    console.log("🎨 Starting contrast analysis for elements:", elementData)

    if (!apiKey) {
      console.warn("❌ No API key found for contrast analysis")
      return null
    }

    try {
      // Use the AI service factory instead of direct API call
      const aiService = AIServiceFactory.getService("claude")
      console.log("🤖 Using Claude AI service for analysis")

      const prompt = `Analyze the contrast of these website elements and suggest optimal color combinations that maintain the site's aesthetic while meeting WCAG 2.2 standards. Elements: ${JSON.stringify(elementData)}

      Please provide your response in the following JSON format:
      {
        "analysis": {
          "overall_score": number,
          "issues": [
            {
              "element": string,
              "current_contrast": number,
              "recommendation": string,
              "suggested_colors": {
                "foreground": string,
                "background": string
              }
            }
          ]
        },
        "css_fixes": string
      }
      `

      const result = await aiService.analyze(prompt, {
        task: "contrast_analysis",
        format: "json"
      })

      console.log("✅ AI analysis completed:", result)
      return result
    } catch (error) {
      console.error("❌ Error during contrast analysis:", error)
      return null
    }
  }

  return {
    isActive,
    options,
    toggleContrastMode,
    updateOptions,
    analyzeContrast
  }
}
