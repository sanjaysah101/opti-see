import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react"

import { Storage } from "@plasmohq/storage"

interface AISettings {
  claudeApiKey: string
  geminiApiKey: string
  preferredModel: "claude" | "gemini"
}

interface AccessibilitySettings {
  highContrast: boolean
  fontSize: "small" | "medium" | "large"
  reducedMotion: boolean
  autoSimplify: boolean
}

interface GeneralSettings {
  autoStart: boolean
  notifications: boolean
  telemetry: boolean
}

interface SettingsContextType {
  aiSettings: AISettings
  accessibilitySettings: AccessibilitySettings
  generalSettings: GeneralSettings
  updateAISettings: (settings: Partial<AISettings>) => Promise<void>
  updateAccessibilitySettings: (
    settings: Partial<AccessibilitySettings>
  ) => Promise<void>
  updateGeneralSettings: (settings: Partial<GeneralSettings>) => Promise<void>
  saveStatus: string | null
}

const SettingsContext = createContext<SettingsContextType>(
  {} as SettingsContextType
)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [aiSettings, setAiSettings] = useState<AISettings>({
    claudeApiKey: "",
    geminiApiKey: "",
    preferredModel: "claude"
  })

  const [accessibilitySettings, setAccessibilitySettings] =
    useState<AccessibilitySettings>({
      highContrast: false,
      fontSize: "medium",
      reducedMotion: false,
      autoSimplify: false
    })

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    autoStart: true,
    notifications: true,
    telemetry: true
  })

  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const storage = new Storage()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      // Load all settings at once
      const [
        claudeKey,
        geminiKey,
        preferredModel,
        highContrast,
        fontSize,
        reducedMotion,
        autoSimplify,
        autoStart,
        notifications,
        telemetry
      ] = await Promise.all([
        storage.get("claude_api_key"),
        storage.get("gemini_api_key"),
        storage.get("preferred_model"),
        storage.get("high_contrast"),
        storage.get("font_size"),
        storage.get("reduced_motion"),
        storage.get("auto_simplify"),
        storage.get("auto_start"),
        storage.get("notifications"),
        storage.get("telemetry")
      ])

      setAiSettings({
        claudeApiKey: claudeKey || "",
        geminiApiKey: geminiKey || "",
        preferredModel: (preferredModel as "claude" | "gemini") || "claude"
      })

      setAccessibilitySettings({
        highContrast: highContrast === "true",
        fontSize: (fontSize as "small" | "medium" | "large") || "medium",
        reducedMotion: reducedMotion === "true",
        autoSimplify: autoSimplify === "true"
      })

      setGeneralSettings({
        autoStart: autoStart !== "false",
        notifications: notifications !== "false",
        telemetry: telemetry !== "false"
      })
    } catch (error) {
      console.error("Failed to load settings:", error)
    }
  }

  const updateAISettings = async (newSettings: Partial<AISettings>) => {
    try {
      const updatedSettings = { ...aiSettings, ...newSettings }
      setAiSettings(updatedSettings)

      await Promise.all([
        storage.set("claude_api_key", updatedSettings.claudeApiKey),
        storage.set("gemini_api_key", updatedSettings.geminiApiKey),
        storage.set("preferred_model", updatedSettings.preferredModel)
      ])

      setSaveStatus("Settings saved successfully!")
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (error) {
      console.error("Failed to save AI settings:", error)
      setSaveStatus("Error saving settings")
    }
  }

  const updateAccessibilitySettings = async (
    newSettings: Partial<AccessibilitySettings>
  ) => {
    try {
      const updatedSettings = { ...accessibilitySettings, ...newSettings }
      setAccessibilitySettings(updatedSettings)

      await Promise.all([
        storage.set("high_contrast", String(updatedSettings.highContrast)),
        storage.set("font_size", updatedSettings.fontSize),
        storage.set("reduced_motion", String(updatedSettings.reducedMotion)),
        storage.set("auto_simplify", String(updatedSettings.autoSimplify))
      ])

      setSaveStatus("Settings saved successfully!")
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (error) {
      console.error("Failed to save accessibility settings:", error)
      setSaveStatus("Error saving settings")
    }
  }

  const updateGeneralSettings = async (
    newSettings: Partial<GeneralSettings>
  ) => {
    try {
      const updatedSettings = { ...generalSettings, ...newSettings }
      setGeneralSettings(updatedSettings)

      await Promise.all([
        storage.set("auto_start", String(updatedSettings.autoStart)),
        storage.set("notifications", String(updatedSettings.notifications)),
        storage.set("telemetry", String(updatedSettings.telemetry))
      ])

      setSaveStatus("Settings saved successfully!")
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (error) {
      console.error("Failed to save general settings:", error)
      setSaveStatus("Error saving settings")
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        aiSettings,
        accessibilitySettings,
        generalSettings,
        updateAISettings,
        updateAccessibilitySettings,
        updateGeneralSettings,
        saveStatus
      }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
