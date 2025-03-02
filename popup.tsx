import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DeveloperModeProvider,
  useDeveloperMode
} from "@/contexts/DeveloperModeContext"

import "globals.css"

// Separate component to use the context
const PopupContent = () => {
  const { isDeveloperMode, toggleDeveloperMode } = useDeveloperMode()

  const activateFeature = (feature: string) => {
    // First, toggle the toolbar to make it visible
    chrome.runtime.sendMessage({ action: "toggleToolbar" })

    // Then activate the specific feature
    chrome.runtime.sendMessage({ action: "activateFeature", feature })
  }

  const openSettings = () => {
    chrome.runtime.openOptionsPage()
  }

  return (
    <div className="flex h-[25rem] w-[25rem] flex-col p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">OptiSee Accessibility</CardTitle>
          {isDeveloperMode && (
            <div className="mt-1 rounded bg-amber-100 px-2 py-1 text-xs text-amber-800">
              Developer Mode
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <section>
              <h3 className="mb-2 font-medium">Visual Accessibility</h3>
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
            </section>

            <section>
              <h3 className="mb-2 font-medium">Cognitive Support</h3>
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
            </section>

            {isDeveloperMode && (
              <section>
                <h3 className="mb-2 font-medium">Developer Tools</h3>
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
              </section>
            )}

            <div className="mt-2 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  chrome.runtime.sendMessage({ action: "toggleToolbar" })
                }>
                Toggle Toolbar
              </Button>
              <Button
                variant={isDeveloperMode ? "default" : "outline"}
                size="sm"
                onClick={toggleDeveloperMode}>
                {isDeveloperMode ? "User Mode" : "Developer Mode"}
              </Button>
            </div>

            <Button variant="outline" size="sm" onClick={openSettings}>
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main component wrapped with the provider
const IndexPopup = () => {
  return (
    <DeveloperModeProvider>
      <PopupContent />
    </DeveloperModeProvider>
  )
}

export default IndexPopup
