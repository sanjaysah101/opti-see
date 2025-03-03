// Utility functions for feature implementations
export const featureUtils = {
  // Contrast Analysis
  analyzeContrast: () => {
    const elements = document.querySelectorAll("*")
    const contrastIssues: {
      element: Element
      contrast: number
      recommendation: string
    }[] = []

    elements.forEach((element) => {
      const style = window.getComputedStyle(element)
      const backgroundColor = style.backgroundColor
      const color = style.color

      // Calculate contrast ratio using WCAG formula
      const contrast = calculateContrastRatio(color, backgroundColor)

      // WCAG 2.1 requirements: 4.5:1 for normal text, 3:1 for large text
      if (contrast < 4.5) {
        contrastIssues.push({
          element,
          contrast,
          recommendation: `Increase contrast to at least 4.5:1. Current: ${contrast.toFixed(2)}:1`
        })

        // Add visual indicator
        element.setAttribute("data-contrast-issue", "true")
        element.style.outline = "2px solid #ff6b6b"
      }
    })

    return contrastIssues
  },

  // Color Adaptation
  adaptColors: () => {
    const elements = document.querySelectorAll("*")

    elements.forEach((element) => {
      const style = window.getComputedStyle(element)

      // Enhance color visibility
      if (
        style.backgroundColor !== "transparent" &&
        style.backgroundColor !== "rgba(0, 0, 0, 0)"
      ) {
        element.setAttribute("data-original-bg", style.backgroundColor)
        element.style.backgroundColor = enhanceColor(style.backgroundColor)
      }

      if (style.color !== "inherit") {
        element.setAttribute("data-original-color", style.color)
        element.style.color = enhanceColor(style.color)
      }
    })
  },

  // Font Optimization
  optimizeFont: () => {
    document.body.style.setProperty(
      "--optimized-font",
      '"Open Sans", sans-serif'
    )

    const style = document.createElement("style")
    style.textContent = `
      body, p, div, span, h1, h2, h3, h4, h5, h6 {
        font-family: var(--optimized-font) !important;
        line-height: 1.6 !important;
        letter-spacing: 0.5px !important;
      }
      
      p, div, span {
        font-size: 16px !important;
      }
      
      h1 { font-size: 2em !important; }
      h2 { font-size: 1.5em !important; }
      h3 { font-size: 1.17em !important; }
    `
    document.head.appendChild(style)
  },

  // Content Simplification
  simplifyContent: async () => {
    const mainContent = document.querySelector(
      "main, article, .content, #content"
    )
    if (!mainContent) return

    const originalText = mainContent.textContent || ""
    mainContent.setAttribute("data-original-content", mainContent.innerHTML)

    // Add loading indicator
    mainContent.innerHTML =
      '<div class="simplifying-content">Simplifying content...</div>'

    try {
      // Send message to background script for AI processing
      chrome.runtime.sendMessage(
        {
          action: "simplifyContent",
          content: originalText
        },
        (response) => {
          if (response.simplified) {
            mainContent.innerHTML = `
            <div class="simplified-content">
              ${response.simplified}
              <button class="restore-original">Restore Original</button>
            </div>
          `
          }
        }
      )
    } catch (error) {
      console.error("Content simplification failed:", error)
      mainContent.innerHTML =
        mainContent.getAttribute("data-original-content") || ""
    }
  },

  // Focus Mode
  toggleFocusMode: (enable: boolean) => {
    if (enable) {
      const style = document.createElement("style")
      style.id = "focus-mode-style"
      style.textContent = `
        body > *:not(main):not(article):not(.content):not(#content) {
          opacity: 0.3;
          transition: opacity 0.3s ease;
        }
        
        main, article, .content, #content {
          position: relative;
          z-index: 1;
          background: white;
          box-shadow: 0 0 100px rgba(0,0,0,0.3);
          padding: 2rem;
          margin: 2rem auto;
          max-width: 800px;
          transition: all 0.3s ease;
        }
        
        .focus-active {
          opacity: 1 !important;
        }
      `
      document.head.appendChild(style)
    } else {
      const style = document.getElementById("focus-mode-style")
      if (style) style.remove()
    }
  }
}

// Helper functions
function calculateContrastRatio(color1: string, color2: string): number {
  // Convert colors to luminance values
  const l1 = getLuminance(color1)
  const l2 = getLuminance(color2)

  // Calculate contrast ratio
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function getLuminance(color: string): number {
  // Convert color to RGB values
  const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0]
  const [r, g, b] = rgb.map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function enhanceColor(color: string): string {
  // Implement color enhancement logic
  // This is a simplified version - you might want to use a more sophisticated algorithm
  const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0]
  const enhancedRgb = rgb.map((c) => Math.min(255, c + 20))
  return `rgb(${enhancedRgb.join(",")})`
}
