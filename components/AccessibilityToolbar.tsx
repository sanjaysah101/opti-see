import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import { AccessibilityFeatures } from "./AccessibilityFeatures"

export const AccessibilityToolbar = () => {
  const [isDeveloperMode, setIsDeveloperMode] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const storage = new Storage()

  // Load developer mode state and toolbar visibility
  useEffect(() => {
    const loadState = async () => {
      try {
        const developerMode = await storage.get("developer_mode")
        if (developerMode !== undefined) {
          setIsDeveloperMode(developerMode === "true")
        }

        // You can add logic here to determine when the toolbar should be visible
        // For now, we'll keep it hidden by default
        setIsVisible(false)
      } catch (error) {
        console.error("Failed to load state:", error)
      }
    }

    loadState()

    // Listen for messages from the popup to toggle visibility
    const messageListener = (message) => {
      if (message.action === "toggleToolbar") {
        setIsVisible((prev) => !prev)
      }
    }

    chrome.runtime.onMessage.addListener(messageListener)

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col rounded-lg border-2 bg-white p-4 shadow-lg">
        <h2 className="mb-2 text-lg font-bold">
          Accessibility Tools
          {isDeveloperMode && (
            <span className="ml-2 rounded bg-amber-100 px-2 py-1 text-xs text-amber-800">
              Developer Mode
            </span>
          )}
        </h2>
        <AccessibilityFeatures />
      </div>
    </>
  )
}
