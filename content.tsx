import { ContrastInfoOverlay } from "@/components/ContrastInfoOverlay"
import cssText from "data-text:~globals.css"
import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false // Only run in main frame, not iframes
}

type ThemeOptions = {
  mode: "light" | "dark"
  preserveSystemTheme: boolean
}

class ThemeManager {
  private styleElement: HTMLStyleElement | null = null

  constructor() {
    this.initializeThemeManager()
  }

  private initializeThemeManager() {
    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "TOGGLE_WEBSITE_THEME") {
        const { enabled, options } = message.payload
        if (enabled) {
          this.enableTheme(options)
        } else {
          this.disableTheme()
        }
      } else if (message.type === "UPDATE_WEBSITE_THEME") {
        const { options } = message.payload
        this.updateTheme(options)
      }
      sendResponse({ success: true })
      return true // Required for async response
    })
  }

  private generateThemeCSS(options: ThemeOptions): string {
    return `
      :root {
        color-scheme: ${options.mode} !important;
      }
      
      html, body {
        background-color: ${
          options.mode === "dark" ? "hsl(222.2 84% 4.9%)" : "white"
        } !important;
        color: ${
          options.mode === "dark" ? "hsl(210 40% 98%)" : "hsl(222.2 84% 4.9%)"
        } !important;
      }

      /* Override common theme classes */
      .dark, [data-theme="dark"] {
        background-color: hsl(222.2 84% 4.9%) !important;
        color: hsl(210 40% 98%) !important;
      }

      .light, [data-theme="light"] {
        background-color: white !important;
        color: hsl(222.2 84% 4.9%) !important;
      }

      /* Additional overrides for common elements */
      article, main, header, footer, section, aside {
        background-color: ${
          options.mode === "dark" ? "hsl(222.2 84% 4.9%)" : "white"
        } !important;
        color: ${
          options.mode === "dark" ? "hsl(210 40% 98%)" : "hsl(222.2 84% 4.9%)"
        } !important;
      }

      /* Override link colors */
      a {
        color: ${options.mode === "dark" ? "hsl(210 40% 98%)" : "blue"} !important;
      }

      /* Override input fields */
      input, textarea, select {
        background-color: ${
          options.mode === "dark" ? "hsl(217.2 32.6% 17.5%)" : "white"
        } !important;
        color: ${
          options.mode === "dark" ? "hsl(210 40% 98%)" : "hsl(222.2 84% 4.9%)"
        } !important;
      }
    `
  }

  private enableTheme(options: ThemeOptions) {
    if (!this.styleElement) {
      this.styleElement = document.createElement("style")
      this.styleElement.id = "opti-see-theme-override"
      document.head.appendChild(this.styleElement)
    }
    this.styleElement.textContent = this.generateThemeCSS(options)
  }

  private updateTheme(options: ThemeOptions) {
    if (this.styleElement) {
      this.styleElement.textContent = this.generateThemeCSS(options)
    }
  }

  private disableTheme() {
    if (this.styleElement) {
      this.styleElement.remove()
      this.styleElement = null
    }
  }
}

class ContrastManager {
  private styleElement: HTMLStyleElement | null = null

  constructor() {
    this.initializeContrastManager()
  }

  private initializeContrastManager() {
    console.log("🎨 Initializing contrast manager")
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("📨 Received message:", message.type)

      if (message.type === "TOGGLE_CONTRAST_OPTIMIZATION") {
        const { enabled, options } = message.payload
        console.log("🔄 Toggle contrast:", enabled, options)
        if (enabled) {
          this.enableContrastOptimization(options)
        } else {
          this.disableContrastOptimization()
        }
      } else if (message.type === "UPDATE_CONTRAST_OPTIMIZATION") {
        const { options } = message.payload
        console.log("🔄 Update contrast options:", options)
        this.updateContrastOptimization(options)
      } else if (message.type === "CONTRAST_ANALYSIS_RESULT") {
        console.log("✨ Received analysis result:", message.payload)
        this.applyContrastFixes(message.payload)
      }

      sendResponse({ success: true })
      return true
    })
  }

  private async analyzeElements() {
    console.log("🔍 Analyzing page elements")
    const elements = Array.from(document.querySelectorAll("*")).filter((el) => {
      const styles = window.getComputedStyle(el)
      const hasText = el.textContent?.trim().length > 0
      const isVisible =
        styles.display !== "none" && styles.visibility !== "hidden"
      return hasText && isVisible
    })

    console.log("📊 Found elements:", elements.length)
    return elements.map((el) => {
      const styles = window.getComputedStyle(el)
      return {
        tagName: el.tagName.toLowerCase(),
        className: el.className,
        id: el.id,
        text: el.textContent?.slice(0, 50),
        styles: {
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight
        }
      }
    })
  }

  private async enableContrastOptimization(options: any) {
    console.log("🎨 Enabling contrast optimization")
    const elementData = await this.analyzeElements()

    if (elementData.length === 0) {
      console.warn("⚠️ No elements found for contrast analysis")
      return
    }

    // Send element data to background script for AI analysis
    chrome.runtime.sendMessage({
      type: "ANALYZE_CONTRAST",
      payload: {
        elementData,
        options: {
          ...options,
          minContrast: options.minContrast || 4.5 // WCAG AA minimum
        }
      }
    })
  }

  private updateContrastOptimization(options: any) {
    console.log("🔄 Updating contrast optimization")

    // If in manual mode, apply changes immediately
    if (options.mode === "manual") {
      this.applyContrastFixes({
        mode: "manual",
        manualSettings: options.manualSettings
      })
    } else {
      // For AI mode, re-analyze
      this.enableContrastOptimization(options)
    }
  }

  private applyContrastFixes(analysisResult: any) {
    console.log("✨ Applying contrast fixes", analysisResult)

    try {
      const result =
        typeof analysisResult === "string"
          ? JSON.parse(analysisResult)
          : analysisResult

      if (!this.styleElement) {
        this.styleElement = document.createElement("style")
        this.styleElement.id = "opti-see-contrast-fixes"
        document.head.appendChild(this.styleElement)
      }

      let cssContent = ""

      if (result.mode === "manual") {
        // Apply manual contrast settings immediately
        const settings = result.manualSettings || {
          textColor: "#000000",
          backgroundColor: "#FFFFFF",
          linkColor: "#0066CC",
          headingColor: "#1A1A1A"
        }
        cssContent = `
          body { background-color: ${settings.backgroundColor} !important; }
          p, span, div { color: ${settings.textColor} !important; }
          a, button { color: ${settings.linkColor} !important; }
          h1, h2, h3, h4, h5, h6 { color: ${settings.headingColor} !important; }
        `
      } else {
        // Apply AI-generated CSS fixes
        cssContent = result.css_fixes.replace(
          /([^{]+\{[^}]+)\}/g,
          (match, group) => {
            return group.replace(/;/g, " !important;") + "}"
          }
        )
      }

      this.styleElement.textContent = cssContent
      console.log("✅ Applied contrast fixes CSS:", cssContent)
    } catch (error) {
      console.error("❌ Error applying contrast fixes:", error)
    }
  }

  private disableContrastOptimization() {
    console.log("🚫 Disabling contrast optimization")
    if (this.styleElement) {
      this.styleElement.remove()
      this.styleElement = null
    }
  }
}

// Initialize managers
new ThemeManager()
new ContrastManager()

// Original content script code for Plasmo UI styles
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

const Flyout = () => (
  <div>
    <ContrastInfoOverlay />
  </div>
)

export default Flyout
