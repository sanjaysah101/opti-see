import { AltTextGenerator } from "@/components/AltTextGenerator"
import { ContrastAnalysisReport } from "@/components/ContrastAnalysisReport"
import { ContrastChecker } from "@/components/ContrastChecker"
import { ContrastOptimization } from "@/components/ContrastOptimization"
import { Settings } from "@/components/Settings"
import { TextToSpeech } from "@/components/TextToSpeech"
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  DropdownMenuTrigger
} from "@/components/ui"
import { WebsiteThemeToggle } from "@/components/WebsiteThemeToggle"
import {
  DeveloperModeProvider,
  useDeveloperMode
} from "@/contexts/DeveloperModeContext"
import { SettingsProvider } from "@/contexts/SettingsContext"
import { Contrast, Github, Info, MoreVertical, Sparkles } from "lucide-react"

import "globals.css"

// Separate component to use the context
const PopupContent = () => {
  const { isDeveloperMode, toggleDeveloperMode } = useDeveloperMode()

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
      <div className="flex-1 overflow-auto px-4 py-2">
        <div className="space-y-4">
          <WebsiteThemeToggle />
          {isDeveloperMode ? (
            <>
              <ContrastOptimization />
              <ContrastChecker />
              <ContrastAnalysisReport />
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Contrast className="h-5 w-5" />
                  Contrast Tools
                </CardTitle>
                <CardDescription>
                  Advanced contrast tools are available in developer mode
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={toggleDeveloperMode}
                  className="w-full">
                  Enable Developer Mode
                </Button>
              </CardContent>
            </Card>
          )}
          <AltTextGenerator />
          <TextToSpeech />
        </div>
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
