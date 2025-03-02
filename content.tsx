import { useContentSimplifier } from "@/features/content-simplifier"
import { useContrastAnalyzer } from "@/features/contrast-analyzer"
import { useFocusMode } from "@/features/focus-mode"
import cssText from "data-text:~globals.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false // Only run in main frame, not iframes
}

const styleElement = document.createElement("style")

/**
 * Generates a style element with adjusted CSS to work correctly within a Shadow DOM.
 *
 * Tailwind CSS relies on `rem` units, which are based on the root font size (typically defined on the <html>
 * or <body> element). However, in a Shadow DOM (as used by Plasmo), there is no native root element, so the
 * rem values would reference the actual page's root font size—often leading to sizing inconsistencies.
 *
 * To address this, we:
 * 1. Replace the `:root` selector with `:host(plasmo-csui)` to properly scope the styles within the Shadow DOM.
 * 2. Convert all `rem` units to pixel values using a fixed base font size, ensuring consistent styling
 *    regardless of the host page's font size.
 */
export const getStyle = (): HTMLStyleElement => {
  const baseFontSize = 16

  let updatedCssText = cssText.replaceAll(":root", ":host(plasmo-csui)")
  const remRegex = /([\d.]+)rem/g
  updatedCssText = updatedCssText.replace(remRegex, (match, remValue) => {
    const pixelsValue = parseFloat(remValue) * baseFontSize

    return `${pixelsValue}px`
  })

  styleElement.textContent = updatedCssText

  return styleElement
}

// This component will only be rendered when the user activates it
// through the extension popup or keyboard shortcut
const AccessibilityToolbar = () => {
  const [isDeveloperMode, setIsDeveloperMode] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false)
  const storage = new Storage()

  // Initialize our accessibility features
  const contrastAnalyzer = useContrastAnalyzer()
  const contentSimplifier = useContentSimplifier()
  const focusMode = useFocusMode()

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
      } else if (message.action === "activateFeature") {
        handleFeatureActivation(message.feature)
      } else if (message.action === "showApiKeyPrompt") {
        setShowApiKeyPrompt(true)
        setIsVisible(true)
      }
    }

    chrome.runtime.onMessage.addListener(messageListener)

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  const handleFeatureActivation = (feature: string) => {
    setActiveFeature(feature)

    switch (feature) {
      case "contrast":
        contrastAnalyzer.analyzeContrast()
        break
      case "simplify":
        contentSimplifier.simplifyContent()
        break
      case "focus":
        focusMode.toggleFocusMode()
        break
      // Add more features as needed
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col rounded-lg border-2 bg-white p-4 shadow-lg">
      <h2 className="mb-2 text-lg font-bold">
        Accessibility Tools
        {isDeveloperMode && (
          <span className="ml-2 rounded bg-amber-100 px-2 py-1 text-xs text-amber-800">
            Developer Mode
          </span>
        )}
      </h2>

      <div className="flex flex-wrap gap-2">
        {/* Basic accessibility tools */}
        <button
          className={`rounded px-3 py-1 text-white ${activeFeature === "contrast" ? "bg-blue-700" : "bg-blue-500 hover:bg-blue-600"}`}
          onClick={() => handleFeatureActivation("contrast")}>
          {contrastAnalyzer.isAnalyzing ? "Analyzing..." : "Contrast"}
        </button>

        <button
          className={`rounded px-3 py-1 text-white ${focusMode.isActive ? "bg-blue-700" : "bg-blue-500 hover:bg-blue-600"}`}
          onClick={() => handleFeatureActivation("focus")}>
          {focusMode.isActive ? "Disable Focus" : "Focus Mode"}
        </button>

        <button
          className={`rounded px-3 py-1 text-white ${activeFeature === "simplify" ? "bg-blue-700" : "bg-blue-500 hover:bg-blue-600"}`}
          onClick={() => handleFeatureActivation("simplify")}>
          {contentSimplifier.isSimplifying ? "Simplifying..." : "Simplify"}
        </button>

        {/* Developer-only tools */}
        {isDeveloperMode && (
          <>
            <button className="rounded bg-purple-500 px-3 py-1 text-white hover:bg-purple-600">
              WCAG Check
            </button>
            <button className="rounded bg-purple-500 px-3 py-1 text-white hover:bg-purple-600">
              Element Analysis
            </button>
          </>
        )}
      </div>

      {/* Results panels for each feature */}
      {activeFeature === "contrast" && contrastAnalyzer.result && (
        <div className="mt-4 rounded border p-3">
          <h3 className="font-medium">Contrast Analysis</h3>
          <p>Score: {contrastAnalyzer.result.score * 100}%</p>
          <p>Issues found: {contrastAnalyzer.result.issues.length}</p>
          <div className="mt-2 flex gap-2">
            <button
              className="rounded bg-green-500 px-2 py-1 text-sm text-white hover:bg-green-600"
              onClick={contrastAnalyzer.applyEnhancedContrast}>
              Apply Fixes
            </button>
            <button
              className="rounded bg-gray-500 px-2 py-1 text-sm text-white hover:bg-gray-600"
              onClick={contrastAnalyzer.removeEnhancedContrast}>
              Remove Fixes
            </button>
          </div>
        </div>
      )}

      {activeFeature === "simplify" && contentSimplifier.result && (
        <div className="mt-4 rounded border p-3">
          <h3 className="font-medium">Content Simplification</h3>
          <p>Reading level: {contentSimplifier.result.readingLevel}</p>
          <p>
            Words reduced:{" "}
            {contentSimplifier.result.statistics.originalWordCount -
              contentSimplifier.result.statistics.simplifiedWordCount}
          </p>
          <div className="mt-2 flex gap-2">
            <button
              className="rounded bg-green-500 px-2 py-1 text-sm text-white hover:bg-green-600"
              onClick={contentSimplifier.applySimplifiedContent}>
              Apply Simplified
            </button>
            <button
              className="rounded bg-gray-500 px-2 py-1 text-sm text-white hover:bg-gray-600"
              onClick={contentSimplifier.restoreOriginalContent}>
              Restore Original
            </button>
          </div>
        </div>
      )}

      {activeFeature === "focus" && focusMode.isActive && (
        <div className="mt-4 rounded border p-3">
          <h3 className="font-medium">Focus Mode Settings</h3>
          <div className="mt-2">
            <label className="block text-sm">Intensity:</label>
            <select
              className="mt-1 w-full rounded border p-1 text-sm"
              value={focusMode.options.intensity}
              onChange={(e) =>
                focusMode.updateOptions({ intensity: e.target.value as any })
              }>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="highlight-links"
              checked={focusMode.options.highlightLinks}
              onChange={(e) =>
                focusMode.updateOptions({ highlightLinks: e.target.checked })
              }
            />
            <label htmlFor="highlight-links" className="text-sm">
              Highlight links
            </label>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="checkbox"
              id="dim-images"
              checked={focusMode.options.dimImages}
              onChange={(e) =>
                focusMode.updateOptions({ dimImages: e.target.checked })
              }
            />
            <label htmlFor="dim-images" className="text-sm">
              Dim images
            </label>
          </div>
        </div>
      )}

      {showApiKeyPrompt && (
        <div className="mt-4 rounded border border-amber-300 bg-amber-50 p-3">
          <h3 className="font-medium text-amber-800">API Key Required</h3>
          <p className="mt-1 text-sm text-amber-700">
            This feature requires an API key to work. Please configure your API
            keys in the settings.
          </p>
          <div className="mt-2">
            <button
              className="rounded bg-amber-500 px-3 py-1 text-white hover:bg-amber-600"
              onClick={() =>
                chrome.runtime.sendMessage({ action: "openSettings" })
              }>
              Open Settings
            </button>
            <button
              className="ml-2 rounded bg-gray-300 px-3 py-1 text-gray-700 hover:bg-gray-400"
              onClick={() => setShowApiKeyPrompt(false)}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccessibilityToolbar
