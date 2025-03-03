// Message listener for text-to-speech
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_SELECTED_TEXT") {
    try {
      const selectedText = window.getSelection()?.toString() || ""
      console.log("Selected text:", selectedText)
      sendResponse({ selectedText, success: true })
    } catch (error) {
      console.error("Error getting selected text:", error)
      sendResponse({ error: error.message, success: false })
    }
  }
  return true // Keep the message channel open for async response
})
