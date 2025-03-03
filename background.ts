// import Anthropic from "@anthropic-ai/sdk"

import { AIServiceFactory } from "@/services/ai-service"

import { Storage } from "@plasmohq/storage"

// Initialize storage
const storage = new Storage()

// Listen for messages from the popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ANALYZE_CONTRAST") {
    console.log("📊 Received contrast analysis request:", message.payload)
    handleContrastAnalysis(message.payload)
      .then((result) => {
        console.log("✅ Analysis complete:", result)
        // Send response directly using sendResponse
        sendResponse(result)
      })
      .catch((error) => {
        console.error("❌ Analysis failed:", error)
        sendResponse(null)
      })
    return true // Keep the message channel open for async response
  } else if (message.action === "activateFeature") {
    // Check if API keys are configured for AI features
    if (["simplify", "contrast", "reading"].includes(message.feature)) {
      checkApiKeys().then((keysConfigured) => {
        if (!keysConfigured) {
          // Notify popup to show API key configuration prompt
          chrome.runtime.sendMessage({ action: "showApiKeyPrompt" })
        }
      })
    }
  } else if (message.action === "openSettings") {
    chrome.runtime.openOptionsPage()
  } else if (message.type === "GENERATE_ALT_TEXT") {
    console.log("🖼️ Received alt text generation request:", message.payload)
    handleAltTextGeneration(message.payload)
      .then((result) => {
        console.log("✅ Alt text generation complete:", result)
        sendResponse(result)
      })
      .catch((error) => {
        console.error("❌ Alt text generation failed:", error)
        sendResponse(null)
      })
    return true
  }

  // Always return true for async response
  return true
})

// Check if necessary API keys are configured
async function checkApiKeys() {
  try {
    const claudeApiKey = await storage.get("claude_api_key")
    const geminiApiKey = await storage.get("gemini_api_key")

    console.log("API keys check:", {
      claude: Boolean(claudeApiKey),
      gemini: Boolean(geminiApiKey)
    })

    // const anthropic = new Anthropic({
    //   apiKey: claudeApiKey,
    //   dangerouslyAllowBrowser: true
    // })

    // const msg = await anthropic.messages.create({
    //   model: "claude-3-7-sonnet-20250219",
    //   max_tokens: 1000,
    //   temperature: 1,
    //   system: "Respond only with short poems.",
    //   messages: [
    //     {
    //       role: "user",
    //       content: [
    //         {
    //           type: "text",
    //           text: "Why is the ocean salty?"
    //         }
    //       ]
    //     }
    //   ]
    // })
    // console.log(msg)

    // For now, we'll just require one of the API keys to be configured
    return Boolean(claudeApiKey || geminiApiKey)
  } catch (error) {
    console.error("Failed to check API keys:", error)
    return false
  }
}

async function handleContrastAnalysis(payload: {
  elementData: any
  options: any
}) {
  console.log("🔍 Starting contrast analysis with options:", payload.options)

  try {
    const aiService = AIServiceFactory.getService("claude")
    const isInitialized = await aiService.isInitialized()

    if (!isInitialized) {
      console.error("❌ AI service not initialized")
      return null
    }

    // Pre-analyze elements to calculate actual contrast ratios
    const analyzedElements = payload.elementData.map((el) => {
      const contrast = calculateContrastRatio(el.foreground, el.background)
      return {
        ...el,
        contrast_ratio: contrast,
        needs_fix: contrast < payload.options.minContrast
      }
    })

    // Filter elements that need fixing
    const issuesFound = analyzedElements.filter((el) => el.needs_fix)

    // Calculate overall score based on the proportion of elements that meet contrast requirements
    const totalElements = analyzedElements.length
    const passingElements = analyzedElements.length - issuesFound.length
    const overallScore = totalElements > 0 ? passingElements / totalElements : 1

    // Format the response
    const analysisResult = {
      analysis: {
        overall_score: overallScore,
        issues: issuesFound.map((issue) => ({
          element: issue.element,
          text_content: issue.text_content,
          current_contrast: issue.contrast_ratio,
          current_colors: {
            foreground: issue.foreground,
            background: issue.background
          },
          recommendation: `Increase contrast to at least ${payload.options.minContrast}:1 (current: ${issue.contrast_ratio.toFixed(2)}:1)`,
          suggested_colors: suggestImprovedColors(
            issue.foreground,
            issue.background,
            payload.options.minContrast
          )
        }))
      },
      css_fixes: generateCSSFixes(issuesFound, payload.options.minContrast)
    }

    console.log("✅ Analysis complete:", analysisResult)
    return analysisResult
  } catch (error) {
    console.error("❌ Error in contrast analysis:", error)
    return null
  }
}

// Helper function to calculate contrast ratio
function calculateContrastRatio(color1: string, color2: string): number {
  // Convert colors to relative luminance and calculate ratio
  // Implementation details...
  return 4.5 // Placeholder - implement actual calculation
}

// Helper function to suggest improved colors
function suggestImprovedColors(
  foreground: string,
  background: string,
  targetContrast: number
) {
  // Implement color adjustment logic to meet target contrast
  // For now, return a simple suggestion
  return {
    foreground: "#000000",
    background: "#FFFFFF"
  }
}

// Helper function to generate CSS fixes
function generateCSSFixes(issues: any[], targetContrast: number): string {
  return issues
    .map(
      (issue) =>
        `${issue.element} { color: ${issue.suggested_colors.foreground}; background-color: ${issue.suggested_colors.background}; }`
    )
    .join("\n")
}

async function handleAltTextGeneration(payload: { images: any[] }) {
  try {
    const aiService = AIServiceFactory.getService("claude")
    const isInitialized = await aiService.isInitialized()

    if (!isInitialized) {
      console.error("❌ AI service not initialized")
      return null
    }

    const prompt = `Analyze these images and generate descriptive, accessible alt text that follows WCAG guidelines. For each image, consider its context and purpose on the page.

    Images: ${JSON.stringify(payload.images)}

    Respond with a JSON object in this format:
    {
      "suggestions": [
        {
          "src": "image-url",
          "alt_text": "Descriptive alt text",
          "confidence": 0.95,
          "reasoning": "Brief explanation of the generated alt text"
        }
      ]
    }`

    const result = await aiService.analyze(prompt, {
      task: "alt_text_generation",
      format: "json"
    })

    return result
  } catch (error) {
    console.error("❌ Error generating alt text:", error)
    return null
  }
}

// You can add more background functionality here as needed
