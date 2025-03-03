import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useWebsiteTheme } from "@/features/website-theme"
import { Moon, Sun } from "lucide-react"

export const WebsiteThemeToggle = () => {
  const { isActive, options, toggleTheme, updateOptions } = useWebsiteTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-4 w-4" />
          <Moon className="h-4 w-4" />
          Website Theme
        </CardTitle>
        <CardDescription>Override the website's theme settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="theme-override">Theme Override</Label>
          <Switch
            id="theme-override"
            checked={isActive}
            onCheckedChange={toggleTheme}
          />
        </div>
        {isActive && (
          <>
            <div className="flex items-center justify-between">
              <Label>Theme Mode</Label>
              <div className="flex gap-2">
                <Button
                  variant={options.mode === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateOptions({ mode: "light" })}>
                  <Sun className="mr-1 h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={options.mode === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateOptions({ mode: "dark" })}>
                  <Moon className="mr-1 h-4 w-4" />
                  Dark
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="system-theme">Follow System Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically switch theme based on system preferences
                </p>
              </div>
              <Switch
                id="system-theme"
                checked={options.preserveSystemTheme}
                onCheckedChange={(checked) =>
                  updateOptions({ preserveSystemTheme: checked })
                }
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
