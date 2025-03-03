import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getContrastRatio, getWCAGLevel } from "@/utils/contrast"
import { Pipette } from "lucide-react"
import { useState } from "react"

export const ContrastChecker = () => {
  const [foreground, setForeground] = useState("#000000")
  const [background, setBackground] = useState("#FFFFFF")
  const [ratio, setRatio] = useState(21)
  const wcagLevels = getWCAGLevel(ratio)

  const handleColorChange = (type: "fg" | "bg", value: string) => {
    if (!/^#[0-9A-F]{6}$/i.test(value)) return

    if (type === "fg") {
      setForeground(value)
    } else {
      setBackground(value)
    }

    const newRatio = getContrastRatio(
      type === "fg" ? value : foreground,
      type === "bg" ? value : background
    )
    setRatio(Number(newRatio.toFixed(2)))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pipette className="h-5 w-5" />
          Contrast Checker
        </CardTitle>
        <CardDescription>
          Check color contrast ratios for WCAG compliance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Foreground Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={foreground}
                onChange={(e) => handleColorChange("fg", e.target.value)}
              />
              <Input
                type="text"
                value={foreground}
                onChange={(e) => handleColorChange("fg", e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={background}
                onChange={(e) => handleColorChange("bg", e.target.value)}
              />
              <Input
                type="text"
                value={background}
                onChange={(e) => handleColorChange("bg", e.target.value)}
                placeholder="#FFFFFF"
              />
            </div>
          </div>

          <div
            className="flex h-20 items-center justify-center rounded-lg text-2xl font-bold"
            style={{
              color: foreground,
              backgroundColor: background
            }}>
            Contrast: {ratio}:1
          </div>

          <div className="space-y-2 rounded-lg border p-4">
            <h3 className="font-medium">WCAG 2.1 Compliance</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>AA Level (Normal Text)</span>
                <span
                  className={
                    wcagLevels.AA.normal ? "text-green-500" : "text-red-500"
                  }>
                  {wcagLevels.AA.normal ? "Pass" : "Fail"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>AA Level (Large Text)</span>
                <span
                  className={
                    wcagLevels.AA.large ? "text-green-500" : "text-red-500"
                  }>
                  {wcagLevels.AA.large ? "Pass" : "Fail"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>AAA Level (Normal Text)</span>
                <span
                  className={
                    wcagLevels.AAA.normal ? "text-green-500" : "text-red-500"
                  }>
                  {wcagLevels.AAA.normal ? "Pass" : "Fail"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>AAA Level (Large Text)</span>
                <span
                  className={
                    wcagLevels.AAA.large ? "text-green-500" : "text-red-500"
                  }>
                  {wcagLevels.AAA.large ? "Pass" : "Fail"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
