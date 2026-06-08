import Dexie, { Table } from 'dexie'
import type { Plan, TaskTemplate, DailyLog, AppConfig } from './models'

// Dexie Database Class
class StudyDB extends Dexie {
  plans!: Table<Plan, string>
  taskTemplates!: Table<TaskTemplate, string>
  dailyLogs!: Table<DailyLog, string>
  config!: Table<AppConfig, number>

  constructor() {
    super('StudyCheckInDB')

    // Define database schema
    this.version(1).stores({
      plans: 'id, isActive, startDate, endDate',
      taskTemplates: 'id, planId',
      dailyLogs: 'id, date, planId, completedAt',
      config: '++id'
    })
  }
}

// Create database instance
export const db = new StudyDB()

// Initialize database with default config
export async function initializeDatabase() {
  try {
    // Check if config exists
    const configCount = await db.config.count()

    if (configCount === 0) {
      // Insert default config
      const defaultConfig: AppConfig = {
        language: detectSystemLanguage(),
        themeMode: 'auto',
        reminderEnabled: false,
        reminderTime: '09:00'
      }

      await db.config.add(defaultConfig)
      console.log('✅ Database initialized with default config')
    } else {
      // Migrate legacy configs that only have the boolean `darkMode` field.
      const config = await getConfig()
      if (config && config.id && config.themeMode === undefined) {
        await db.config.update(config.id, {
          themeMode: config.darkMode ? 'dark' : 'light'
        })
      }
    }
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
  }
}

// Detect system language
function detectSystemLanguage(): 'zh-CN' | 'en' | 'ja' {
  const browserLang = navigator.language.toLowerCase()

  if (browserLang.startsWith('zh')) return 'zh-CN'
  if (browserLang.startsWith('ja')) return 'ja'
  if (browserLang.startsWith('en')) return 'en'

  return 'zh-CN' // fallback
}

// Helper: Get current config
export async function getConfig(): Promise<AppConfig | undefined> {
  return await db.config.toCollection().first()
}

// Helper: Update config
export async function updateConfig(updates: Partial<AppConfig>): Promise<void> {
  const config = await getConfig()
  if (config && config.id) {
    await db.config.update(config.id, updates)
  }
}

// Export database instance
export default db
