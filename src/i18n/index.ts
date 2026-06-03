import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN.json'
import en from './locales/en.json'
import ja from './locales/ja.json'
import { getConfig } from '@/db'

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

// Load saved locale from DB and apply it
export async function loadLocaleFromDB() {
  try {
    const config = await getConfig()
    if (config?.language) {
      i18n.global.locale.value = config.language
    }
  } catch (error) {
    console.error('Failed to load locale from DB:', error)
  }
}

export default i18n
