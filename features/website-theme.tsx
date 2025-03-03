import { useEffect, useState } from "react"

type WebsiteThemeOptions = {
  mode: "light" | "dark"
  preserveSystemTheme: boolean
}

export const useWebsiteTheme = () => {
  const [isActive, setIsActive] = useState(false)
  const [options, setOptions] = useState<WebsiteThemeOptions>({
    mode: "light",
    preserveSystemTheme: true
  })

  const toggleTheme = async () => {
    const newState = !isActive
    setIsActive(newState)

    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return

    // Send message to content script
    chrome.tabs.sendMessage(tab.id, {
      type: "TOGGLE_WEBSITE_THEME",
      payload: {
        enabled: newState,
        options
      }
    })
  }

  const updateOptions = async (newOptions: Partial<WebsiteThemeOptions>) => {
    const updatedOptions = { ...options, ...newOptions }
    setOptions(updatedOptions)

    if (isActive) {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      if (!tab?.id) return

      // Update theme in content script
      chrome.tabs.sendMessage(tab.id, {
        type: "UPDATE_WEBSITE_THEME",
        payload: {
          options: updatedOptions
        }
      })
    }
  }

  // Handle system theme changes if preserveSystemTheme is true
  useEffect(() => {
    if (!options.preserveSystemTheme) return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e: MediaQueryListEvent) => {
      updateOptions({ mode: e.matches ? "dark" : "light" })
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [options.preserveSystemTheme])

  return {
    isActive,
    options,
    toggleTheme,
    updateOptions
  }
}
