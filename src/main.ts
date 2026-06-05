import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n, { loadLocaleFromDB } from './i18n'
import { initializeDatabase, getConfig } from './db'
import { applyTheme } from './utils/theme'

const app = createApp(App)

app.use(router)
app.use(i18n)

// Apply saved dark mode preference before mount
async function applySavedTheme() {
  try {
    const config = await getConfig()
    await applyTheme(Boolean(config?.darkMode))
  } catch (error) {
    console.error('Failed to apply saved theme:', error)
  }
}

// Initialize database and load saved locale before mounting
initializeDatabase()
  .then(() => Promise.all([loadLocaleFromDB(), applySavedTheme()]))
  .then(() => {
    app.mount('#app')
    console.log('🚀 App mounted with database initialized')
  })
  .catch(error => {
    console.error('Failed to initialize app:', error)
    app.mount('#app')
  })
