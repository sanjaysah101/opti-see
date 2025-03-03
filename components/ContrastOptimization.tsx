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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useContrastOptimization } from "@/features/contrast-optimization"
import { Brain, Contrast, Loader2, Settings } from "lucide-react"
import { useEffect, useState } from "react"

export const ContrastOptimization = () => {
  const { isActive, options, toggleContrastMode, updateOptions } =
    useContrastOptimization()
  const [isProcessing, setIsProcessing] = useState(false)
  const [stats, setStats] = useState<{
    score?: number
    issues?: number
  } | null>(null)

  const handleToggle = async () => {
    setIsProcessing(true)
    setStats(null)
    await toggleContrastMode()
    setIsProcessing(false)
  }

  const handleUpdate = async (newOptions: any) => {
    setIsProcessing(true)
    setStats(null)
    await updateOptions(newOptions)
    setIsProcessing(false)
  }

  const handleColorChange = (colorType: string, value: string) => {
    handleUpdate({
      manualSettings: {
        ...options.manualSettings,
        [colorType]: value
      }
    })
  }

  // Move the listener to useEffect to properly manage it
  useEffect(() => {
    const messageListener = (message) => {
      if (
        message.type === "CONTRAST_ANALYSIS_RESULT" &&
        message.payload?.analysis
      ) {
        console.log("📊 Received analysis result in popup:", message.payload)
        setStats({
          score: message.payload.analysis.overall_score,
          issues: message.payload.analysis.issues.length
        })
      }
      return true
    }

    chrome.runtime.onMessage.addListener(messageListener)
    return () => chrome.runtime.onMessage.removeListener(messageListener)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Contrast className="h-5 w-5" />
          Contrast Optimization
        </CardTitle>
        <CardDescription>
          Enhance text contrast for better readability
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
            {stats && (
              <div className="text-xs">
                Score: {(stats.score * 100).toFixed(0)}% |{" "}
                <span
                  className={
                    stats.issues > 0 ? "text-yellow-500" : "text-green-500"
                  }>
                  Issues: {stats.issues}
                </span>
              </div>
            )}
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
            disabled={isProcessing}
          />
        </div>

        {isActive && (
          <Tabs
            defaultValue="ai"
            value={options.mode}
            onValueChange={(value: "ai" | "manual") =>
              handleUpdate({ mode: value })
            }>
            <TabsList className="mt-4 grid w-full grid-cols-2">
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Mode
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Manual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Minimum Contrast Ratio</Label>
                <Slider
                  value={[options.minContrast]}
                  min={3}
                  max={21}
                  step={0.5}
                  onValueChange={([value]) =>
                    handleUpdate({ minContrast: value })
                  }
                  disabled={isProcessing}
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    WCAG AA requires 4.5:1
                  </span>
                  <span className="font-medium">{options.minContrast}:1</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Color Scheme Preference</Label>
                <Select
                  value={options.preferredColorScheme}
                  onValueChange={(value: any) =>
                    handleUpdate({
                      preferredColorScheme: value
                    })
                  }
                  disabled={isProcessing}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintain">Maintain Original</SelectItem>
                    <SelectItem value="enhance">Enhance Contrast</SelectItem>
                    <SelectItem value="maximize">Maximize Contrast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-adjust">Auto-Adjust</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically adjust contrast while browsing
                  </p>
                </div>
                <Switch
                  id="auto-adjust"
                  checked={options.autoAdjust}
                  onCheckedChange={(checked) =>
                    handleUpdate({ autoAdjust: checked })
                  }
                  disabled={isProcessing}
                />
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={options.manualSettings?.textColor || "#000000"}
                      onChange={(e) =>
                        handleColorChange("textColor", e.target.value)
                      }
                    />
                    <Input
                      type="text"
                      value={options.manualSettings?.textColor || "#000000"}
                      onChange={(e) =>
                        handleColorChange("textColor", e.target.value)
                      }
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={options.manualSettings?.backgroundColor}
                      onChange={(e) =>
                        handleUpdate({
                          manualSettings: {
                            ...options.manualSettings,
                            backgroundColor: e.target.value
                          }
                        })
                      }
                    />
                    <Input
                      type="text"
                      value={options.manualSettings?.backgroundColor}
                      onChange={(e) =>
                        handleUpdate({
                          manualSettings: {
                            ...options.manualSettings,
                            backgroundColor: e.target.value
                          }
                        })
                      }
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Link Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={options.manualSettings?.linkColor}
                      onChange={(e) =>
                        handleUpdate({
                          manualSettings: {
                            ...options.manualSettings,
                            linkColor: e.target.value
                          }
                        })
                      }
                    />
                    <Input
                      type="text"
                      value={options.manualSettings?.linkColor}
                      onChange={(e) =>
                        handleUpdate({
                          manualSettings: {
                            ...options.manualSettings,
                            linkColor: e.target.value
                          }
                        })
                      }
                      placeholder="#0066CC"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Heading Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={options.manualSettings?.headingColor}
                      onChange={(e) =>
                        handleUpdate({
                          manualSettings: {
                            ...options.manualSettings,
                            headingColor: e.target.value
                          }
                        })
                      }
                    />
                    <Input
                      type="text"
                      value={options.manualSettings?.headingColor}
                      onChange={(e) =>
                        handleUpdate({
                          manualSettings: {
                            ...options.manualSettings,
                            headingColor: e.target.value
                          }
                        })
                      }
                      placeholder="#1A1A1A"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
