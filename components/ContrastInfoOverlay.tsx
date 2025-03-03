import { Card } from "@/components/ui/card"
import { getContrastRatio, getWCAGLevel } from "@/utils/contrast"
import { useEffect, useState } from "react"

type ContrastInfo = {
  text: string
  textColor: string
  backgroundColor: string
  ratio: number
  suggestion: string
  position: {
    x: number
    y: number
  }
}

export const ContrastInfoOverlay = () => {
  const [info, setInfo] = useState<ContrastInfo | null>(null)

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) {
        setInfo(null)
        return
      }

      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const selectedElement = selection.anchorNode?.parentElement

      if (!selectedElement) return

      const styles = window.getComputedStyle(selectedElement)
      const textColor = styles.color
      const backgroundColor = styles.backgroundColor

      // Convert RGB to Hex
      const rgbToHex = (rgb: string) => {
        const [r, g, b] = rgb.match(/\d+/g)!.map(Number)
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
      }

      const textColorHex = rgbToHex(textColor)
      const backgroundColorHex = rgbToHex(backgroundColor)
      const ratio = getContrastRatio(textColorHex, backgroundColorHex)
      const wcagLevels = getWCAGLevel(ratio)

      let suggestion = ""
      if (!wcagLevels.AA.normal) {
        suggestion =
          "Consider increasing contrast to meet WCAG AA standards (4.5:1)"
      } else if (!wcagLevels.AAA.normal) {
        suggestion = "For better accessibility, aim for WCAG AAA standard (7:1)"
      }

      setInfo({
        text: selection.toString(),
        textColor: textColorHex,
        backgroundColor: backgroundColorHex,
        ratio,
        suggestion,
        position: {
          x: rect.left + window.scrollX,
          y: rect.bottom + window.scrollY + 10
        }
      })
    }

    document.addEventListener("selectionchange", handleSelection)
    return () =>
      document.removeEventListener("selectionchange", handleSelection)
  }, [])

  if (!info) return null

  return (
    <div
      className="fixed z-50"
      style={{
        left: `${info.position.x}px`,
        top: `${info.position.y}px`
      }}>
      <Card className="w-80 p-4 shadow-lg">
        <div className="space-y-2 text-sm">
          <div className="font-medium">Selected Text:</div>
          <div className="max-h-20 overflow-auto rounded border p-2">
            {info.text}
          </div>
          <div className="flex items-center gap-2">
            <span>Colors:</span>
            <div
              className="h-4 w-4 rounded border"
              style={{ backgroundColor: info.textColor }}
              title={`Text: ${info.textColor}`}
            />
            <div
              className="h-4 w-4 rounded border"
              style={{ backgroundColor: info.backgroundColor }}
              title={`Background: ${info.backgroundColor}`}
            />
          </div>
          <div>
            Contrast Ratio:{" "}
            <span className="font-medium">{info.ratio.toFixed(2)}:1</span>
          </div>
          <div className="text-xs text-muted-foreground">{info.suggestion}</div>
        </div>
      </Card>
    </div>
  )
}
