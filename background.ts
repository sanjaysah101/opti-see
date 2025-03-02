// import Anthropic from "@anthropic-ai/sdk"

import { Storage } from "@plasmohq/storage"

// Initialize storage
const storage = new Storage()

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleToolbar") {
    // Forward the message to the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleToolbar" })
      }
    })
  } else if (message.action === "activateFeature") {
    // Check if API keys are configured for AI features
    if (["simplify", "contrast", "reading"].includes(message.feature)) {
      checkApiKeys().then((keysConfigured) => {
        if (keysConfigured) {
          // Forward the feature activation message to the active tab
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: "activateFeature",
                feature: message.feature
              })
            }
          })
        } else {
          // Prompt user to configure API keys
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: "showApiKeyPrompt"
              })
            }
          })
        }
      })
    } else {
      // Non-AI features don't need API key validation
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "activateFeature",
            feature: message.feature
          })
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

// You can add more background functionality here as needed
