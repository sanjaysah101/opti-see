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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDeveloperMode } from "@/contexts/DeveloperModeContext"
import { useSettings } from "@/contexts/SettingsContext"
import {
  Bot,
  Eye,
  KeyRound,
  Settings as SettingsIcon,
  Sliders
} from "lucide-react"

export const Settings = () => {
  const {
    aiSettings,
    accessibilitySettings,
    generalSettings,
    updateAISettings,
    updateAccessibilitySettings,
    updateGeneralSettings,
    saveStatus
  } = useSettings()

  const { isDeveloperMode, toggleDeveloperMode } = useDeveloperMode()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Configure OptiSee AI settings and preferences
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI
            </TabsTrigger>
            <TabsTrigger
              value="accessibility"
              className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Access
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              API
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic extension settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Developer Mode</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable advanced features and debugging tools
                    </p>
                  </div>
                  <Switch
                    checked={isDeveloperMode}
                    onCheckedChange={toggleDeveloperMode}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-start</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically start the extension on browser launch
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.autoStart}
                    onCheckedChange={(checked) =>
                      updateGeneralSettings({ autoStart: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Show desktop notifications for important events
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.notifications}
                    onCheckedChange={(checked) =>
                      updateGeneralSettings({ notifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Usage Data</Label>
                    <p className="text-xs text-muted-foreground">
                      Help improve OptiSee by sharing anonymous usage data
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.telemetry}
                    onCheckedChange={(checked) =>
                      updateGeneralSettings({ telemetry: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle>AI Settings</CardTitle>
                <CardDescription>
                  Configure AI model preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Preferred AI Model</Label>
                  <Select
                    value={aiSettings.preferredModel}
                    onValueChange={(value: "claude" | "gemini") =>
                      updateAISettings({ preferredModel: value })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI Model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                      <SelectItem value="gemini">Gemini (Google)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accessibility">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Settings</CardTitle>
                <CardDescription>
                  Configure accessibility preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>High Contrast</Label>
                    <p className="text-xs text-muted-foreground">
                      Enhance contrast for better visibility
                    </p>
                  </div>
                  <Switch
                    checked={accessibilitySettings.highContrast}
                    onCheckedChange={(checked) =>
                      updateAccessibilitySettings({ highContrast: checked })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select
                    value={accessibilitySettings.fontSize}
                    onValueChange={(value: "small" | "medium" | "large") =>
                      updateAccessibilitySettings({ fontSize: value })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reduced Motion</Label>
                    <p className="text-xs text-muted-foreground">
                      Minimize animations and transitions
                    </p>
                  </div>
                  <Switch
                    checked={accessibilitySettings.reducedMotion}
                    onCheckedChange={(checked) =>
                      updateAccessibilitySettings({ reducedMotion: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Simplify</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically simplify complex content
                    </p>
                  </div>
                  <Switch
                    checked={accessibilitySettings.autoSimplify}
                    onCheckedChange={(checked) =>
                      updateAccessibilitySettings({ autoSimplify: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Settings</CardTitle>
                <CardDescription>
                  Configure API keys for AI services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="claude-api">Claude API Key</Label>
                  <Input
                    id="claude-api"
                    type="password"
                    value={aiSettings.claudeApiKey}
                    onChange={(e) =>
                      updateAISettings({ claudeApiKey: e.target.value })
                    }
                    placeholder="Enter Claude API key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gemini-api">Gemini API Key</Label>
                  <Input
                    id="gemini-api"
                    type="password"
                    value={aiSettings.geminiApiKey}
                    onChange={(e) =>
                      updateAISettings({ geminiApiKey: e.target.value })
                    }
                    placeholder="Enter Gemini API key"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {saveStatus && (
          <p
            className={`mt-4 text-sm ${
              saveStatus.includes("Error")
                ? "text-destructive"
                : "text-green-600"
            }`}>
            {saveStatus}
          </p>
        )}
      </SheetContent>
    </Sheet>
  )
}
