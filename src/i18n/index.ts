import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN.json'
import en from './locales/en.json'
import ja from './locales/ja.json'

// Detect system language
export const getDefaultLocale = (): string => {
  const browserLang = navigator.language.toLowerCase()
  
  if (browserLang.startsWith('zh')) return 'zh-CN'
  if (browserLang.startsWith('ja')) return 'ja'
  if (browserLang.startsWith('en')) return 'en'
  
  return 'zh-CN' // fallback
}

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    en,
    ja
  }
})

// Helper to load locale from database and apply it
export async function loadLocaleFromDB() {
  try {
    const { getConfig } = await import('@/db')
    const config = await getConfig()
    
    if (config && config.language) {
      i18n.global.locale.value = config.language
      console.log('✅ Loaded language from DB:', config.language)
    }
  } catch (error) {
    console.error('❌ Failed to load locale from DB:', error)
  }
}

export default i18n
