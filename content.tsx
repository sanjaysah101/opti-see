import cssText from "data-text:~globals.css"
import type { PlasmoCSConfig } from "plasmo"

import { AccessibilityToolbar } from "./components/AccessibilityToolbar"

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

const Flyout = () => <AccessibilityToolbar />

export default Flyout
