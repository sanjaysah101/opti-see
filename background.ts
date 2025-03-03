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

    // Format the prompt to force structured output
    const prompt = `Analyze these website elements for contrast issues and provide specific CSS fixes.
    Elements: ${JSON.stringify(payload.elementData)}

    IMPORTANT: You must respond with a valid JSON object in exactly this format, with no additional text:
    {
      "analysis": {
        "overall_score": 0.75,
        "issues": [
          {
            "element": "p.some-class",
            "current_contrast": 2.5,
            "recommendation": "Increase contrast by darkening text",
            "suggested_colors": {
              "foreground": "#000000",
              "background": "#FFFFFF"
            }
          }
        ]
      },
      "css_fixes": "p.some-class { color: #000000; background-color: #FFFFFF; }"
    }

    Ensure all CSS selectors are specific and valid. Target elements by their exact class names, IDs, or tag names from the input data. The contrast ratio must meet WCAG ${payload.options.minContrast}:1 standard.`

    const result = await aiService.analyze(prompt, {
      task: "contrast_analysis",
      format: "json",
      temperature: 0.1
    })

    // Ensure the response is properly formatted JSON
    const parsedResult =
      typeof result === "string" ? JSON.parse(result) : result

    if (!parsedResult?.css_fixes || !parsedResult?.analysis) {
      console.error("❌ Invalid AI response format:", parsedResult)
      return null
    }

    console.log("✅ Valid analysis result:", parsedResult)
    return parsedResult
  } catch (error) {
    console.error("❌ Error in contrast analysis:", error)
    return null
  }
}

// You can add more background functionality here as needed
