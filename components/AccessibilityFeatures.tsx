import { useState } from "react"

import {
  Button,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Slider
} from "~components/ui"

type ColorBlindnessType =
  | "none"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia"

interface ContrastSettings {
  mode: "light" | "dark" | "high"
  level: number
}

export const AccessibilityFeatures = () => {
  const [colorBlindness, setColorBlindness] =
    useState<ColorBlindnessType>("none")
  const [contrast, setContrast] = useState<ContrastSettings>({
    mode: "light",
    level: 100
  })

  // Apply color blindness simulation
  const applyColorBlindness = (type: ColorBlindnessType) => {
    setColorBlindness(type)
    const css = generateColorBlindnessCSS(type)
    applyCSS("color-blindness", css)
  }

  // Apply contrast adjustments with level
  const applyContrast = (mode: "light" | "dark" | "high", level?: number) => {
    const newSettings = {
      ...contrast,
      mode,
      level: level ?? contrast.level
    }
    setContrast(newSettings)

    // Apply theme class first
    document.documentElement.className = mode === "dark" ? "dark" : ""

    const css = generateContrastCSS(newSettings)
    applyCSS("contrast", css)
  }

  return (
    <div className="grid gap-4 p-4">
      {/* Color Blindness Simulation */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Color Blindness</label>
        <Select value={colorBlindness} onValueChange={applyColorBlindness}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select simulation type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Simulation Type</SelectLabel>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="protanopia">Protanopia (Red-Blind)</SelectItem>
              <SelectItem value="deuteranopia">
                Deuteranopia (Green-Blind)
              </SelectItem>
              <SelectItem value="tritanopia">
                Tritanopia (Blue-Blind)
              </SelectItem>
              <SelectItem value="achromatopsia">
                Achromatopsia (Total)
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Contrast Controls */}
      <div className="space-y-4">
        <label className="text-sm font-medium">Contrast Mode</label>
        <div className="flex gap-2">
          <Button
            variant={contrast.mode === "light" ? "default" : "outline"}
            onClick={() => applyContrast("light")}>
            Light
          </Button>
          <Button
            variant={contrast.mode === "dark" ? "default" : "outline"}
            onClick={() => applyContrast("dark")}>
            Dark
          </Button>
          <Button
            variant={contrast.mode === "high" ? "default" : "outline"}
            onClick={() => applyContrast("high")}>
            High Contrast
          </Button>
        </div>

        {/* Contrast Level Slider */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Contrast Level</label>
          <Slider
            value={[contrast.level]}
            min={50}
            max={200}
            step={10}
            onValueChange={([value]) => applyContrast(contrast.mode, value)}
          />
        </div>
      </div>
    </div>
  )
}

// Helper functions for generating CSS
function generateColorBlindnessCSS(type: ColorBlindnessType): string {
  if (type === "none") return ""

  const filters = {
    protanopia: "filter: url('#protanopia')",
    deuteranopia: "filter: url('#deuteranopia')",
    tritanopia: "filter: url('#tritanopia')",
    achromatopsia: "filter: grayscale(100%)"
  }

  return `
    html {
      ${filters[type]};
    }
    
    /* SVG filters for color blindness simulation */
    ${type !== "achromatopsia" ? getSVGFilter(type) : ""}
  `
}

// Updated contrast CSS generator using shadcn color tokens
function generateContrastCSS(settings: ContrastSettings): string {
  // Define color schemes based on shadcn's HSL values
  const schemes = {
    light: {
      background: "0 0% 100%",
      foreground: "222.2 84% 4.9%",
      card: "0 0% 100%",
      cardForeground: "222.2 84% 4.9%",
      popover: "0 0% 100%",
      popoverForeground: "222.2 84% 4.9%",
      primary: "222.2 47.4% 11.2%",
      primaryForeground: "210 40% 98%",
      secondary: "210 40% 96.1%",
      secondaryForeground: "222.2 47.4% 11.2%",
      muted: "210 40% 96.1%",
      mutedForeground: "215.4 16.3% 46.9%",
      accent: "210 40% 96.1%",
      accentForeground: "222.2 47.4% 11.2%",
      border: "214.3 31.8% 91.4%",
      input: "214.3 31.8% 91.4%",
      ring: "222.2 84% 4.9%"
    },
    dark: {
      background: "222.2 84% 4.9%",
      foreground: "210 40% 98%",
      card: "222.2 84% 4.9%",
      cardForeground: "210 40% 98%",
      popover: "222.2 84% 4.9%",
      popoverForeground: "210 40% 98%",
      primary: "210 40% 98%",
      primaryForeground: "222.2 47.4% 11.2%",
      secondary: "217.2 32.6% 17.5%",
      secondaryForeground: "210 40% 98%",
      muted: "217.2 32.6% 17.5%",
      mutedForeground: "215 20.2% 65.1%",
      accent: "217.2 32.6% 17.5%",
      accentForeground: "210 40% 98%",
      border: "217.2 32.6% 17.5%",
      input: "217.2 32.6% 17.5%",
      ring: "212.7 26.8% 83.9%"
    },
    high: {
      // High contrast mode with increased contrast ratios
      background: "0 0% 100%",
      foreground: "0 0% 0%",
      card: "0 0% 100%",
      cardForeground: "0 0% 0%",
      popover: "0 0% 100%",
      popoverForeground: "0 0% 0%",
      primary: "0 0% 0%",
      primaryForeground: "0 0% 100%",
      secondary: "0 0% 95%",
      secondaryForeground: "0 0% 0%",
      muted: "0 0% 95%",
      mutedForeground: "0 0% 20%",
      accent: "0 0% 95%",
      accentForeground: "0 0% 0%",
      border: "0 0% 0%",
      input: "0 0% 95%",
      ring: "0 0% 0%"
    }
  }

  const scheme = schemes[settings.mode]
  const contrastLevel = settings.level / 100

  return `
    :root {
      --background: ${scheme.background};
      --foreground: ${scheme.foreground};
      --card: ${scheme.card};
      --card-foreground: ${scheme.cardForeground};
      --popover: ${scheme.popover};
      --popover-foreground: ${scheme.popoverForeground};
      --primary: ${scheme.primary};
      --primary-foreground: ${scheme.primaryForeground};
      --secondary: ${scheme.secondary};
      --secondary-foreground: ${scheme.secondaryForeground};
      --muted: ${scheme.muted};
      --muted-foreground: ${scheme.mutedForeground};
      --accent: ${scheme.accent};
      --accent-foreground: ${scheme.accentForeground};
      --border: ${scheme.border};
      --input: ${scheme.input};
      --ring: ${scheme.ring};
    }

    html {
      filter: contrast(${contrastLevel}) !important;
    }

    /* Ensure proper portal rendering for select dropdown */
    #radix-portal {
      background: hsl(var(--background));
      color: hsl(var(--foreground));
    }
  `
}

// Helper function to apply CSS
function applyCSS(id: string, css: string) {
  let style = document.getElementById(`accessibility-${id}`)
  if (!style) {
    style = document.createElement("style")
    style.id = `accessibility-${id}`
    document.head.appendChild(style)
  }
  style.textContent = css
}

// Helper function to get SVG filters
function getSVGFilter(type: ColorBlindnessType): string {
  // Return appropriate SVG filter matrix for each type
  const filters = {
    protanopia: `
      <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
        <filter id="protanopia">
          <feColorMatrix
            type="matrix"
            values="0.567, 0.433, 0,     0, 0
                    0.558, 0.442, 0,     0, 0
                    0,     0.242, 0.758, 0, 0
                    0,     0,     0,     1, 0"/>
        </filter>
      </svg>
    `,
    deuteranopia: `
      <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
        <filter id="deuteranopia">
          <feColorMatrix
            type="matrix"
            values="0.625, 0.375, 0,   0, 0
                    0.7,   0.3,   0,   0, 0
                    0,     0.3,   0.7, 0, 0
                    0,     0,     0,   1, 0"/>
        </filter>
      </svg>
    `,
    tritanopia: `
      <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
        <filter id="tritanopia">
          <feColorMatrix
            type="matrix"
            values="0.95, 0.05,  0,     0, 0
                    0,    0.433, 0.567, 0, 0
                    0,    0.475, 0.525, 0, 0
                    0,    0,     0,     1, 0"/>
        </filter>
      </svg>
    `
  }
  return filters[type] || ""
}
