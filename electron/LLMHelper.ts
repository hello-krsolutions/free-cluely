import { AIProviderManager } from "./AIProviderManager"
import { Settings, DEFAULT_SETTINGS } from "../src/types/settings"
import { SettingsManager } from "./SettingsManager"

export class LLMHelper {
  private aiManager: AIProviderManager
  private settingsManager: SettingsManager

  constructor() {
    this.settingsManager = new SettingsManager()
    const settings = this.settingsManager.getSettings()
    this.aiManager = new AIProviderManager(settings)
  }

  public async updateSettings(newSettings: Settings) {
    this.settingsManager.saveSettings(newSettings)
    this.aiManager.updateSettings(newSettings)
  }

  public getSettings(): Settings {
    return this.settingsManager.getSettings()
  }

  public async testConnection(provider: any, apiKey: string, model: string) {
    return this.aiManager.testConnection(provider, apiKey, model)
  }

  public async extractProblemFromImages(imagePaths: string[]) {
    try {
      const provider = this.aiManager.getProvider()
      return await provider.extractProblemFromImages(imagePaths)
    } catch (error) {
      console.error("Error extracting problem from images:", error)
      throw error
    }
  }

  public async generateSolution(problemInfo: any) {
    try {
      console.log("[LLMHelper] Calling AI provider for solution...")
      const provider = this.aiManager.getProvider()
      const result = await provider.generateSolution(problemInfo)
      console.log("[LLMHelper] AI provider returned result:", result)
      return result
    } catch (error) {
      console.error("[LLMHelper] Error in generateSolution:", error)
      throw error
    }
  }

  public async debugSolutionWithImages(problemInfo: any, currentCode: string, debugImagePaths: string[]) {
    try {
      const provider = this.aiManager.getProvider()
      const result = await provider.debugSolutionWithImages(problemInfo, currentCode, debugImagePaths)
      console.log("[LLMHelper] Parsed debug AI response:", result)
      return result
    } catch (error) {
      console.error("Error debugging solution with images:", error)
      throw error
    }
  }

  public async analyzeAudioFile(audioPath: string) {
    try {
      // Try to use Gemini first for audio analysis, fallback to image analysis
      const provider = this.aiManager.getProvider('gemini')
      if (provider) {
        return await provider.analyzeAudioFile(audioPath)
      }
      throw new Error("Audio analysis requires Gemini provider")
    } catch (error) {
      console.error("Error analyzing audio file:", error)
      throw error
    }
  }

  public async analyzeAudioFromBase64(data: string, mimeType: string) {
    try {
      // Try to use Gemini first for audio analysis
      const provider = this.aiManager.getProvider('gemini')
      if (provider) {
        return await provider.analyzeAudioFromBase64(data, mimeType)
      }
      throw new Error("Audio analysis requires Gemini provider")
    } catch (error) {
      console.error("Error analyzing audio from base64:", error)
      throw error
    }
  }

  public async analyzeImageFile(imagePath: string) {
    try {
      const provider = this.aiManager.getProvider()
      return await provider.analyzeImageFile(imagePath)
    } catch (error) {
      console.error("Error analyzing image file:", error)
      throw error
    }
  }

  public async chatWithGemini(message: string): Promise<string> {
    try {
      const provider = this.aiManager.getProvider()
      return await provider.chatWithAI(message)
    } catch (error) {
      console.error("[LLMHelper] Error in chatWithAI:", error)
      throw error
    }
  }

  public getAvailableProviders() {
    return this.aiManager.getAvailableProviders()
  }
}
