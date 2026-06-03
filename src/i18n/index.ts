import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN.json'
import en from './locales/en.json'
import ja from './locales/ja.json'

// Detect system language
const getDefaultLocale = (): string => {
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

export default i18n
