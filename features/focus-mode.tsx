import { useState } from "react"

type FocusModeOptions = {
  intensity: "low" | "medium" | "high"
  highlightLinks: boolean
  dimImages: boolean
}

export const useFocusMode = () => {
  const [isActive, setIsActive] = useState(false)
  const [options, setOptions] = useState<FocusModeOptions>({
    intensity: "medium",
    highlightLinks: true,
    dimImages: true
  })
  
  const toggleFocusMode = () => {
    if (isActive) {
      disableFocusMode()
    } else {
      enableFocusMode()
    }
    setIsActive(!isActive)
  }
  
  const enableFocusMode = () => {
    // Create and inject the focus mode styles
    const styleEl = document.createElement("style")
    styleEl.id = "opti-see-focus-mode"
    
    // Generate CSS based on intensity
    let css = ""
    
    switch (options.intensity) {
      case "low":
        css = `
          body > * {
            opacity: 0.9;
          }
          main, article, .content, #content {
            opacity: 1;
            background-color: rgba(255, 255, 255, 0.95) !important;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          }
        `
        break
      case "medium":
        css = `
          body > * {
            opacity: 0.5;
          }
          main, article, .content, #content {
            opacity: 1;
            background-color: rgba(255, 255, 255, 1) !important;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.15);
          }
          body {
            background-color: rgba(240, 240, 240, 0.8) !important;
          }
        `
        break
      case "high":
        css = `
          body > * {
            opacity: 0.3;
          }
          main, article, .content, #content {
            opacity: 1;
            background-color: rgba(255, 255, 255, 1) !important;
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.2);
          }
          body {
            background-color: rgba(220, 220, 220, 0.9) !important;
          }
        `
        break
    }
    
    // Add link highlighting if enabled
    if (options.highlightLinks) {
      css += `
        main a, article a, .content a, #content a {
          background-color: rgba(255, 255, 100, 0.3);
          border-bottom: 1px solid rgba(0, 0, 0, 0.2);
          text-decoration: none !important;
        }
      `
    }
    
    // Add image dimming if enabled
    if (options.dimImages) {
      css += `
        img {
          filter: saturate(0.8) brightness(0.95);
        }
      `
    }
    
    styleEl.textContent = css
    document.head.appendChild(styleEl)
  }
  
  const disableFocusMode = () => {
    const styleEl = document.getElementById("opti-see-focus-mode")
    if (styleEl) {
      styleEl.remove()
    }
  }
  
  const updateOptions = (newOptions: Partial<FocusModeOptions>) => {
    const updatedOptions = { ...options, ...newOptions }
    setOptions(updatedOptions)
    
    // If focus mode is active, update it with new options
    if (isActive) {
      disableFocusMode()
      setOptions(updatedOptions)
      enableFocusMode()
    }
  }
  
  return {
    isActive,
    options,
    toggleFocusMode,
    updateOptions
  }
} 