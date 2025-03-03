// Utility functions for calculating contrast ratios
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

export function getContrastRatio(color1: string, color2: string): number {
  const getRGB = (color: string) => {
    const hex = color.replace("#", "")
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16)
    }
  }

  const c1 = getRGB(color1)
  const c2 = getRGB(color2)

  const l1 = getLuminance(c1.r, c1.g, c1.b)
  const l2 = getLuminance(c2.r, c2.g, c2.b)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

export function getWCAGLevel(ratio: number): {
  AA: { normal: boolean; large: boolean }
  AAA: { normal: boolean; large: boolean }
} {
  return {
    AA: {
      normal: ratio >= 4.5,
      large: ratio >= 3
    },
    AAA: {
      normal: ratio >= 7,
      large: ratio >= 4.5
    }
  }
}
