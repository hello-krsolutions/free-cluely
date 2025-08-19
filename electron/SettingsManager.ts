import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { Settings, DEFAULT_SETTINGS } from '../src/types/settings'

export class SettingsManager {
  private settingsPath: string
  private settings: Settings

  constructor() {
    const userDataPath = app.getPath('userData')
    this.settingsPath = path.join(userDataPath, 'settings.json')
    this.settings = this.loadSettings()
  }

  private loadSettings(): Settings {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const data = fs.readFileSync(this.settingsPath, 'utf8')
        const savedSettings = JSON.parse(data)
        
        // Merge with default settings to ensure all properties exist
        return {
          ...DEFAULT_SETTINGS,
          ...savedSettings,
          providers: {
            ...DEFAULT_SETTINGS.providers,
            ...savedSettings.providers
          }
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
    
    return { ...DEFAULT_SETTINGS }
  }

  public saveSettings(settings: Settings): void {
    try {
      this.settings = settings
      
      // Ensure the user data directory exists
      const userDataPath = app.getPath('userData')
      if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true })
      }
      
      fs.writeFileSync(this.settingsPath, JSON.stringify(settings, null, 2))
    } catch (error) {
      console.error('Error saving settings:', error)
      throw error
    }
  }

  public getSettings(): Settings {
    return { ...this.settings }
  }

  // Migrate from old .env file if it exists
  public migrateFromEnv(): void {
    try {
      const envPath = path.join(process.cwd(), '.env')
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8')
        const lines = envContent.split('\n')
        
        for (const line of lines) {
          const [key, value] = line.split('=')
          if (key === 'GEMINI_API_KEY' && value) {
            this.settings.providers.gemini.apiKey = value.trim()
            this.settings.providers.gemini.enabled = true
            this.settings.defaultProvider = 'gemini'
            break
          }
        }
        
        this.saveSettings(this.settings)
        console.log('Migrated API key from .env file')
      }
    } catch (error) {
      console.error('Error migrating from .env:', error)
    }
  }
}
