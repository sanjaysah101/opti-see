import { Anthropic } from "@anthropic-ai/sdk" // Import the SDK

// Import the SDK

import { Storage } from "@plasmohq/storage"

// Base interface for AI services
interface AIService {
  analyze: (content: string, options?: any) => Promise<any>
  generate: (prompt: string, options?: any) => Promise<string>
  isInitialized: () => Promise<boolean>
}

// Chrome Gemini AI implementation
export class GeminiAIService implements AIService {
  private apiKey: string | null = null

  constructor() {
    // Load API key if available
    this.loadApiKey()
  }

  private async loadApiKey() {
    try {
      // In a real implementation, you would load this from secure storage
      this.apiKey = "YOUR_API_KEY" // Placeholder
    } catch (error) {
      console.error("Failed to load Gemini API key:", error)
    }
  }

  async analyze(content: string, options: any = {}) {
    // Placeholder for Gemini AI analysis
    console.log("Analyzing with Gemini AI:", content)
    return { result: "Gemini analysis result" }
  }

  async generate(prompt: string, options: any = {}) {
    // Placeholder for Gemini AI generation
    console.log("Generating with Gemini AI:", prompt)
    return "Gemini generated content"
  }

  async isInitialized(): Promise<boolean> {
    return Boolean(this.apiKey)
  }
}

// Claude AI implementation with proper API integration
export class ClaudeAIService implements AIService {
  private apiKey: string | null = null
  private anthropicClient: Anthropic | null = null // SDK client instance
  private storage = new Storage()
  private initPromise: Promise<void> | null = null

  constructor() {
    this.initPromise = this.loadApiKey()
  }

  private async loadApiKey() {
    try {
      this.apiKey = await this.storage.get("claude_api_key")
      console.log("API key loaded:", this.apiKey ? "Found" : "Not found")
      if (this.apiKey) {
        this.anthropicClient = new Anthropic({
          apiKey: this.apiKey,
          dangerouslyAllowBrowser: true
        })
      }
    } catch (error) {
      console.error("Failed to load Claude API key:", error)
    }
  }

  // Method to check if the service is initialized
  async isInitialized(): Promise<boolean> {
    if (this.initPromise) {
      await this.initPromise
    }
    return Boolean(this.apiKey && this.anthropicClient)
  }

  // Helper method to ensure API key is loaded before making requests
  private async ensureInitialized() {
    if (this.initPromise) {
      await this.initPromise
    }
    if (!this.apiKey || !this.anthropicClient) {
      throw new Error("Claude API key not configured")
    }
  }

  async analyze(content: string, options: any = {}) {
    await this.ensureInitialized()

    const systemPrompt = this.createSystemPrompt(options.task)
    const userMessage = this.createUserMessage(content, options.task)

    try {
      const response = await this.anthropicClient!.messages.create({
        model: "claude-3-5-sonnet-20240620",
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
        max_tokens: 4000,
        temperature: 0.2
      })

      return response.content[0].text
    } catch (error) {
      console.error("Claude analysis error:", error)
      throw error
    }
  }

  async generate(prompt: string, options: any = {}) {
    await this.ensureInitialized()

    const systemPrompt =
      options.systemPrompt ||
      "You are an AI assistant specialized in creating accessible content."
    const temperature = options.temperature || 0.7

    try {
      const response = await this.anthropicClient!.messages.create({
        model: "claude-3-5-sonnet-20240620",
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
        max_tokens: options.maxTokens || 4000,
        temperature
      })

      return response.content[0].text
    } catch (error) {
      console.error("Claude generation error:", error)
      throw error
    }
  }

  private createSystemPrompt(task: string | undefined): string {
    let systemPrompt =
      "You are an AI assistant specialized in web accessibility analysis."
    if (task === "contrast_analysis") {
      systemPrompt +=
        " Analyze the provided HTML elements for contrast issues according to WCAG 2.2 standards."
    } else if (task === "readability_analysis") {
      systemPrompt +=
        " Analyze the provided text for readability issues and suggest improvements."
    }
    return systemPrompt
  }

  private createUserMessage(content: string, task: string | undefined): string {
    return task ? `Task: ${task}\n\nContent to analyze:\n${content}` : content
  }

  // Method specifically for content simplification
  async simplifyContent(content: string, level: string = "moderate") {
    console.log("Simplifying content with level:", level)
    await this.ensureInitialized()

    console.log(
      "API key after initialization:",
      this.apiKey ? "Available" : "Not available"
    )

    // Create a system prompt for content simplification
    const systemPrompt = `You are an AI assistant specialized in making content more accessible. 
Your task is to simplify text to a ${level} reading level while preserving the key information.
For a "mild" level, aim for grade 8-9 reading level.
For a "moderate" level, aim for grade 6-7 reading level.
For a "strong" level, aim for grade 4-5 reading level.`

    try {
      const response = await this.anthropicClient!.messages.create({
        model: "claude-3-5-sonnet-20240620",
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Please simplify the following text to a ${level} reading level. Preserve all key information but use simpler language, shorter sentences, and clearer structure:\n\n${content}`
          }
        ],
        max_tokens: 4000,
        temperature: 0.3 // Lower temperature for more consistent simplification
      })

      return response.content[0].text
    } catch (error) {
      console.error("Claude simplification error:", error)
      throw error
    }
  }
}

// AI Service Factory
export class AIServiceFactory {
  static getService(type: "gemini" | "claude"): AIService {
    switch (type) {
      case "gemini":
        return new GeminiAIService()
      case "claude":
        return new ClaudeAIService()
      default:
        return new ClaudeAIService() // Default to Claude
    }
  }
}
