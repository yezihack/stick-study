<template>
  <div class="page-settings">
    <h1 class="page-title">{{ t('settings.title') }}</h1>

    <!-- General -->
    <section class="settings-section">
      <h2 class="section-title">{{ t('settings.section.general') }}</h2>

      <!-- Language -->
      <div class="settings-row">
        <span class="row-label">{{ t('settings.language') }}</span>
        <div class="lang-switcher">
          <button
            v-for="lang in languages"
            :key="lang.code"
            class="lang-btn"
            :class="{ active: locale === lang.code }"
            @click="changeLanguage(lang.code)"
          >
            {{ lang.label }}
          </button>
        </div>
      </div>

      <!-- Dark mode -->
      <div class="settings-row">
        <span class="row-label">{{ t('settings.darkMode') }}</span>
        <button class="toggle-btn" :class="{ active: darkMode }" @click="toggleDarkMode">
          <span class="toggle-knob" />
        </button>
      </div>

      <!-- Reminder -->
      <div class="settings-row">
        <div class="action-info">
          <span class="row-label">{{ t('settings.reminder') }}</span>
          <span class="action-sub">{{ t('settings.reminderSub') }}</span>
        </div>
        <button class="toggle-btn" :class="{ active: reminderEnabled }" @click="toggleReminder">
          <span class="toggle-knob" />
        </button>
      </div>

      <!-- Reminder time -->
      <Transition name="fade">
        <div v-if="reminderEnabled" class="settings-row">
          <span class="row-label">{{ t('settings.reminderTime') }}</span>
          <input
            type="time"
            class="time-input"
            :value="reminderTime"
            @change="changeReminderTime"
          />
        </div>
      </Transition>
    </section>

    <!-- Data Management -->
    <section class="settings-section">
      <h2 class="section-title">{{ t('settings.section.data') }}</h2>

      <div class="action-row">
        <div class="action-info">
          <span class="action-label">{{ t('settings.export') }}</span>
          <span class="action-sub">{{ t('settings.exportSub') }}</span>
        </div>
        <button class="action-btn" :aria-label="t('settings.export')" @click="handleExport">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v11"/><path d="M8 11l4 4 4-4"/><path d="M5 19h14"/></svg>
        </button>
      </div>

      <div class="action-row">
        <div class="action-info">
          <span class="action-label">{{ t('settings.import') }}</span>
          <span class="action-sub">{{ t('settings.importSub') }}</span>
        </div>
        <button class="action-btn" :aria-label="t('settings.import')" @click="handleImport">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 16V5"/><path d="M8 9l4-4 4 4"/><path d="M5 19h14"/></svg>
        </button>
      </div>

      <div class="action-row danger">
        <div class="action-info">
          <span class="action-label">{{ t('settings.deleteData') }}</span>
          <span class="action-sub">{{ t('settings.deleteDataSub') }}</span>
        </div>
        <button class="action-btn danger" :aria-label="t('settings.deleteData')" @click="showDeleteConfirm = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M6 7l1 13h10l1-13"/><line x1="10" y1="11" x2="10" y2="16"/><line x1="14" y1="11" x2="14" y2="16"/></svg>
        </button>
      </div>

      <div class="storage-row">
        <span class="storage-label">{{ t('settings.storageSize') }}</span>
        <span class="storage-size">{{ storageSize }}</span>
      </div>
    </section>

    <!-- About -->
    <section class="settings-section about">
      <h2 class="section-title">{{ t('settings.section.about') }}</h2>
      <p class="version">{{ t('settings.version') }} 1.0.0</p>
      <p class="slogan">{{ t('settings.slogan') }}</p>
    </section>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>

    <!-- Delete confirm dialog -->
    <Transition name="fade">
      <div v-if="showDeleteConfirm" class="confirm-overlay" @click.self="showDeleteConfirm = false">
        <div class="confirm-dialog">
          <p class="confirm-text">{{ t('settings.deleteConfirm') }}</p>
          <div class="confirm-actions">
            <button class="btn-delete" @click="handleClearData">{{ t('common.delete') }}</button>
            <button class="btn-cancel" @click="showDeleteConfirm = false">{{ t('common.cancel') }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getConfig, updateConfig } from '@/db'
import { exportData, importData, clearAllData, estimateStorageSize } from '@/composables/useDataManagement'
import {
  scheduleDailyReminder,
  cancelDailyReminder,
  requestNotificationPermission,
  getLocalizedReminderMessage
} from '@/composables/useNotifications'

const { t, locale } = useI18n()

const languages = [
  { code: 'zh-CN', label: '中文' },
  { code: 'en', label: 'EN' },
  { code: 'ja', label: '日本語' }
] as const

const darkMode = ref(false)
const reminderEnabled = ref(false)
const reminderTime = ref('09:00')
const storageSize = ref('—')
const showDeleteConfirm = ref(false)

const toast = ref({ show: false, message: '', type: 'info' })

// ── Init ─────────────────────────────────────────────────────
onMounted(async () => {
  const config = await getConfig()
  if (config) {
    darkMode.value = config.darkMode
    applyDarkMode(config.darkMode)
    reminderEnabled.value = config.reminderEnabled
    reminderTime.value = config.reminderTime || '09:00'
  }
  storageSize.value = await estimateStorageSize()
})

// ── Language ─────────────────────────────────────────────────
async function changeLanguage(lang: 'zh-CN' | 'en' | 'ja') {
  locale.value = lang
  await updateConfig({ language: lang })
  // Re-schedule reminder with localized message
  if (reminderEnabled.value) {
    await applyReminder()
  }
}

// ── Dark mode ────────────────────────────────────────────────
function applyDarkMode(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

async function toggleDarkMode() {
  darkMode.value = !darkMode.value
  applyDarkMode(darkMode.value)
  await updateConfig({ darkMode: darkMode.value })
}

// Watch dark mode changes
watch(darkMode, val => applyDarkMode(val))

// ── Reminder ─────────────────────────────────────────────────
async function applyReminder() {
  const message = getLocalizedReminderMessage(locale.value)
  await scheduleDailyReminder(
    {
      language: locale.value as 'zh-CN' | 'en' | 'ja',
      darkMode: darkMode.value,
      reminderEnabled: reminderEnabled.value,
      reminderTime: reminderTime.value
    },
    message
  )
}

async function toggleReminder() {
  reminderEnabled.value = !reminderEnabled.value
  await updateConfig({ reminderEnabled: reminderEnabled.value })

  if (reminderEnabled.value) {
    const granted = await requestNotificationPermission()
    if (!granted) {
      reminderEnabled.value = false
      await updateConfig({ reminderEnabled: false })
      showToast(t('settings.toast.permissionDenied'), 'error')
      return
    }
    await applyReminder()
    showToast(t('settings.toast.reminderSet'), 'success')
  } else {
    await cancelDailyReminder()
  }
}

async function changeReminderTime(e: Event) {
  const value = (e.target as HTMLInputElement).value
  reminderTime.value = value
  await updateConfig({ reminderTime: value })
  if (reminderEnabled.value) {
    await applyReminder()
    showToast(t('settings.toast.reminderSet'), 'success')
  }
}

// ── Data management ──────────────────────────────────────────
async function handleExport() {
  try {
    await exportData()
    showToast(t('settings.toast.exportSuccess'), 'success')
  } catch (err) {
    showToast(t('common.error'), 'error')
    console.error(err)
  }
}

async function handleImport() {
  try {
    await importData()
    showToast(t('settings.toast.importSuccess'), 'success')
    setTimeout(() => location.reload(), 800)
  } catch (err) {
    showToast(t('common.error'), 'error')
    console.error(err)
  }
}

async function handleClearData() {
  try {
    await clearAllData()
    showDeleteConfirm.value = false
    showToast(t('settings.toast.clearSuccess'), 'success')
    setTimeout(() => location.reload(), 800)
  } catch (err) {
    showToast(t('common.error'), 'error')
    console.error(err)
  }
}

function showToast(msg: string, type: 'info' | 'success' | 'error' = 'info') {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => { toast.value.show = false }, 2500)
}
</script>

<style scoped>
.page-settings {
  padding: 1.5rem 1rem;
  padding-bottom: calc(var(--nav-height) + 1rem);
  max-width: 480px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.4rem;
  color: var(--ink);
  margin-bottom: 1.5rem;
}

.settings-section {
  background: white;
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-sm);
}

:root.dark .settings-section {
  background: #252a25;
}

.section-title {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gold);
  margin-bottom: 0.75rem;
}

/* Settings row */
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 8px 0;
}

.row-label {
  font-size: 0.92rem;
  color: var(--ink);
}

/* Language */
.lang-switcher {
  display: flex;
  gap: 4px;
}

.lang-btn {
  padding: 4px 10px;
  border: 1.5px solid rgba(128, 128, 128, 0.3);
  border-radius: 20px;
  background: transparent;
  font-size: 0.8rem;
  cursor: pointer;
  color: var(--ink);
  transition: all 0.15s;
}

.lang-btn.active {
  border-color: var(--sakura);
  background: var(--sakura);
  color: white;
}

/* Toggle */
.toggle-btn {
  width: 48px;
  height: 26px;
  border-radius: 999px;
  border: 1.5px solid rgba(128, 128, 128, 0.25);
  background: rgba(128, 128, 128, 0.15);
  cursor: pointer;
  position: relative;
  transition: all 0.25s;
  padding: 0;
}

.toggle-btn.active {
  background: var(--moss);
  border-color: var(--moss);
}

.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  transition: transform 0.25s;
}

.toggle-btn.active .toggle-knob {
  transform: translateX(22px);
}

/* Time input */
.time-input {
  padding: 6px 10px;
  border: 1.5px solid rgba(128, 128, 128, 0.3);
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 0.9rem;
  font-family: var(--font-mono);
  color: var(--ink);
  cursor: pointer;
}

.time-input:focus {
  outline: none;
  border-color: var(--sakura);
}

/* Action rows */
.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(128, 128, 128, 0.08);
}

.action-row:last-of-type {
  border-bottom: none;
}

.action-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.action-label {
  font-size: 0.9rem;
  color: var(--ink);
  font-weight: 500;
}

.action-sub {
  font-size: 0.75rem;
  color: rgba(128, 128, 128, 0.6);
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(128, 128, 128, 0.08);
  cursor: pointer;
  transition: transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
}

.action-btn svg {
  width: 20px;
  height: 20px;
}

.action-btn:active { transform: scale(0.9); }

.action-row.danger .action-label { color: var(--sakura); }
.action-btn.danger {
  background: rgba(192, 84, 74, 0.1);
  color: var(--sakura);
}

/* Storage */
.storage-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px solid rgba(128, 128, 128, 0.08);
}

.storage-label {
  font-size: 0.85rem;
  color: rgba(128, 128, 128, 0.6);
}

.storage-size {
  font-size: 0.85rem;
  font-family: var(--font-mono);
  color: var(--ink);
}

/* About */
.about {
  text-align: center;
  padding: 1.5rem 1rem;
}

.version {
  font-size: 0.85rem;
  color: rgba(128, 128, 128, 0.5);
  margin: 0 0 0.5rem;
}

.slogan {
  font-size: 0.9rem;
  font-style: italic;
  color: var(--ink);
  margin: 0;
  opacity: 0.7;
}

/* Toast */
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background: var(--ink);
  color: var(--paper);
  border-radius: 20px;
  font-size: 0.85rem;
  z-index: 500;
  box-shadow: var(--shadow-md);
}

.toast.success { background: var(--moss); color: white; }
.toast.error { background: var(--sakura); color: white; }

.toast-enter-active { transition: transform 0.3s cubic-bezier(0.34,1.2,0.64,1), opacity 0.2s; }
.toast-leave-active { transition: transform 0.2s, opacity 0.2s; }
.toast-enter-from, .toast-leave-to { transform: translateX(-50%) translateY(-20px); opacity: 0; }

/* Confirm dialog */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 400;
  padding: 1rem;
}

.confirm-dialog {
  background: white;
  border-radius: var(--radius-md);
  padding: 1.5rem;
  max-width: 320px;
  width: 100%;
  box-shadow: var(--shadow-md);
}

:root.dark .confirm-dialog {
  background: #252a25;
}

.confirm-text {
  font-size: 0.9rem;
  color: var(--ink);
  margin: 0 0 1.25rem;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 8px;
}

.btn-delete {
  flex: 1;
  padding: 10px;
  background: var(--sakura);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-cancel {
  flex: 1;
  padding: 10px;
  background: transparent;
  border: 1.5px solid rgba(128, 128, 128, 0.2);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  cursor: pointer;
  color: var(--ink);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
