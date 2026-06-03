import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n, { loadLocaleFromDB } from './i18n'
import { initializeDatabase } from './db'

const app = createApp(App)

app.use(router)
app.use(i18n)

// Initialize database and load saved locale before mounting
initializeDatabase()
  .then(() => loadLocaleFromDB())
  .then(() => {
    app.mount('#app')
    console.log('🚀 App mounted with database initialized')
  })
  .catch(error => {
    console.error('Failed to initialize app:', error)
    app.mount('#app')
  })
