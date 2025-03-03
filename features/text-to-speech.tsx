import { useState } from "react"

export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedText, setSelectedText] = useState<string>("")
  const speechSynth = window.speechSynthesis

  const checkSelectedText = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      if (!tab?.id) {
        throw new Error("No active tab found")
      }

      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "GET_SELECTED_TEXT"
      })

      if (response?.success && response.selectedText) {
        setSelectedText(response.selectedText)
        return true
      }
      return false
    } catch (error) {
      console.error("Error checking selected text:", error)
      return false
    }
  }

  const speak = async () => {
    try {
      if (isPlaying) {
        stop()
        return
      }

      const hasSelectedText = await checkSelectedText()
      if (!hasSelectedText) {
        setError("No text selected")
        return
      }

      const utterance = new SpeechSynthesisUtterance(selectedText)
      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => {
        setIsPlaying(false)
        setSelectedText("")
      }
      utterance.onerror = (event) => {
        setError(`Speech synthesis failed: ${event.error}`)
        setIsPlaying(false)
      }

      speechSynth.speak(utterance)
    } catch (error) {
      console.error("Text-to-speech error:", error)
      setError("Failed to initialize text-to-speech")
    }
  }

  const stop = () => {
    speechSynth.cancel()
    setIsPlaying(false)
    setSelectedText("")
  }

  return {
    speak,
    stop,
    isPlaying,
    hasText: Boolean(selectedText),
    error
  }
}
