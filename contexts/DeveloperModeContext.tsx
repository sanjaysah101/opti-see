import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react"

import { Storage } from "@plasmohq/storage"

// Define the context type
type DeveloperModeContextType = {
  isDeveloperMode: boolean
  toggleDeveloperMode: () => void
}

// Create the context with default values
const DeveloperModeContext = createContext<DeveloperModeContextType>({
  isDeveloperMode: false,
  toggleDeveloperMode: () => {}
})

// Storage key for persisting the developer mode state
const DEVELOPER_MODE_KEY = "developer_mode"

// Provider component
export const DeveloperModeProvider = ({
  children
}: {
  children: ReactNode
}) => {
  const [isDeveloperMode, setIsDeveloperMode] = useState(false)
  const storage = new Storage()

  // Load the developer mode state from storage on initial render
  useEffect(() => {
    const loadDeveloperMode = async () => {
      try {
        const storedMode = await storage.get(DEVELOPER_MODE_KEY)
        if (storedMode !== undefined) {
          setIsDeveloperMode(storedMode === "true")
        }
      } catch (error) {
        console.error("Failed to load developer mode state:", error)
      }
    }

    loadDeveloperMode()
  }, [])

  // Toggle the developer mode and persist the change
  const toggleDeveloperMode = async () => {
    const newMode = !isDeveloperMode
    setIsDeveloperMode(newMode)

    try {
      await storage.set(DEVELOPER_MODE_KEY, String(newMode))
    } catch (error) {
      console.error("Failed to save developer mode state:", error)
    }
  }

  return (
    <DeveloperModeContext.Provider
      value={{ isDeveloperMode, toggleDeveloperMode }}>
      {children}
    </DeveloperModeContext.Provider>
  )
}

// Custom hook for using the developer mode context
export const useDeveloperMode = () => useContext(DeveloperModeContext)
