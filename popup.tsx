import { Settings } from "@/components/Settings"
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui"
import {
  DeveloperModeProvider,
  useDeveloperMode
} from "@/contexts/DeveloperModeContext"
import { SettingsProvider } from "@/contexts/SettingsContext"
import { Github, Info, MoreVertical, Sparkles } from "lucide-react"

import "globals.css"

import { SelectDemo } from "./components/SelectDemo"

// Separate component to use the context
const PopupContent = () => {
  const { isDeveloperMode, toggleDeveloperMode } = useDeveloperMode()

  const activateFeature = (feature: string) => {
    chrome.runtime.sendMessage({ action: "toggleToolbar" })
    chrome.runtime.sendMessage({ action: "activateFeature", feature })
  }

  return (
    <div className="flex h-[30rem] w-[25rem] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">OptiSee AI</h1>
          {isDeveloperMode && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              Dev Mode
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              window.open("https://github.com/sanjaysah101/opti-see", "_blank")
            }>
            <Github className="h-4 w-4" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>About OptiSee AI</DialogTitle>
                <DialogDescription>
                  An AI-powered accessibility extension that helps make the web
                  more accessible for everyone.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Settings />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={toggleDeveloperMode}>
                {isDeveloperMode
                  ? "Switch to User Mode"
                  : "Switch to Developer Mode"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  chrome.runtime.sendMessage({ action: "toggleToolbar" })
                }>
                Toggle Toolbar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  window.open("https://docs.optisee.ai", "_blank")
                }>
                Documentation
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  window.open("https://discord.gg/optisee", "_blank")
                }>
                Join Community
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="visual" className="h-full">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="cognitive">Cognitive</TabsTrigger>
            {isDeveloperMode && (
              <TabsTrigger value="developer">Developer</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="visual" className="h-full">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => activateFeature("contrast")}>
                Contrast Analysis
              </Button>
              <Button size="sm" onClick={() => activateFeature("color")}>
                Color Adaptation
              </Button>
              <Button size="sm" onClick={() => activateFeature("font")}>
                Font Optimization
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="cognitive" className="h-full">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => activateFeature("simplify")}>
                Simplify Content
              </Button>
              <Button size="sm" onClick={() => activateFeature("focus")}>
                Focus Mode
              </Button>
              <Button size="sm" onClick={() => activateFeature("reading")}>
                Reading Level
              </Button>
            </div>
          </TabsContent>

          {isDeveloperMode && (
            <TabsContent value="developer" className="h-full">
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => activateFeature("wcag")}>
                  WCAG Checker
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => activateFeature("score")}>
                  Accessibility Score
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => activateFeature("fixes")}>
                  Fix Suggestions
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

// Main component wrapped with the provider
const IndexPopup = () => {
  return (
    <DeveloperModeProvider>
      <SettingsProvider>
        <PopupContent />
      </SettingsProvider>
    </DeveloperModeProvider>
  )
}

export default IndexPopup
