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

      <!-- Theme mode -->
      <div class="settings-row">
        <span class="row-label">{{ t('settings.themeMode') }}</span>
        <div class="lang-switcher">
          <button
            v-for="mode in themeModes"
            :key="mode"
            class="lang-btn"
            :class="{ active: themeMode === mode }"
            @click="changeThemeMode(mode)"
          >
            {{ t(`settings.theme.${mode}`) }}
          </button>
        </div>
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
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 3v11" />
            <path d="M8 11l4 4 4-4" />
            <path d="M5 19h14" />
          </svg>
        </button>
      </div>

      <div class="action-row">
        <div class="action-info">
          <span class="action-label">{{ t('settings.import') }}</span>
          <span class="action-sub">{{ t('settings.importSub') }}</span>
        </div>
        <button class="action-btn" :aria-label="t('settings.import')" @click="handleImport">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 16V5" />
            <path d="M8 9l4-4 4 4" />
            <path d="M5 19h14" />
          </svg>
        </button>
      </div>

      <div class="action-row danger">
        <div class="action-info">
          <span class="action-label">{{ t('settings.deleteData') }}</span>
          <span class="action-sub">{{ t('settings.deleteDataSub') }}</span>
        </div>
        <button
          class="action-btn danger"
          :aria-label="t('settings.deleteData')"
          @click="showDeleteConfirm = true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 7h16" />
            <path d="M9 7V5h6v2" />
            <path d="M6 7l1 13h10l1-13" />
            <line x1="10" y1="11" x2="10" y2="16" />
            <line x1="14" y1="11" x2="14" y2="16" />
          </svg>
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
      <img class="about-logo" src="/logo.svg" alt="" width="72" height="72" />
      <p class="version">{{ t('settings.version') }} {{ appConfig.version }}</p>
      <p class="slogan">{{ appConfig.slogan }}</p>

      <!-- GitHub -->
      <a class="link-row" :href="appConfig.githubUrl" target="_blank" rel="noopener noreferrer">
        <span class="link-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2z"
            />
          </svg>
        </span>
        <div class="action-info">
          <span class="action-label">{{ t('settings.github') }}</span>
          <span class="action-sub">{{ t('settings.githubSub') }}</span>
        </div>
        <span class="link-arrow">›</span>
      </a>

      <!-- Sponsor -->
      <button class="link-row" @click="showSponsor = true">
        <span class="link-icon heart">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 21s-7.5-4.6-10-9.4C.6 8.7 2 5.5 5 5.5c1.9 0 3.2 1.1 4 2.4.8-1.3 2.1-2.4 4-2.4 3 0 4.4 3.2 3 6.1C19.5 16.4 12 21 12 21z"
            />
          </svg>
        </span>
        <div class="action-info">
          <span class="action-label">{{ t('settings.sponsor') }}</span>
          <span class="action-sub">{{ t('settings.sponsorSub') }}</span>
        </div>
        <span class="link-arrow">›</span>
      </button>

      <p class="no-ads">🛡️ {{ t('settings.noAds') }}</p>
    </section>

    <!-- Sponsor QR dialog -->
    <Transition name="fade">
      <div v-if="showSponsor" class="sponsor-overlay" @click.self="showSponsor = false">
        <div class="sponsor-dialog">
          <h3 class="sponsor-title">{{ t('settings.sponsorDialogTitle') }}</h3>
          <img class="sponsor-qr" :src="appConfig.wechatQrUrl" alt="WeChat Pay QR" />
          <p class="sponsor-tip">{{ t('settings.sponsorDialogTip') }}</p>
          <div class="sponsor-actions">
            <button class="btn-download" @click="handleDownloadQr">
              {{ t('settings.sponsorDownload') }}
            </button>
            <button class="btn-cancel" @click="showSponsor = false">
              {{ t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

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
            <button class="btn-cancel" @click="showDeleteConfirm = false">
              {{ t('common.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Capacitor } from '@capacitor/core'
import { Media } from '@capacitor-community/media'
import { appConfig } from '@/config'
import { getConfig, updateConfig } from '@/db'
import { applyThemeMode } from '@/utils/theme'
import type { ThemeMode } from '@/db/models'
import {
  exportData,
  importData,
  clearAllData,
  estimateStorageSize
} from '@/composables/useDataManagement'
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

const themeMode = ref<ThemeMode>('auto')
const themeModes: ThemeMode[] = ['light', 'dark', 'auto']
const reminderEnabled = ref(false)
const reminderTime = ref('09:00')
const storageSize = ref('—')
const showDeleteConfirm = ref(false)
const showSponsor = ref(false)

const toast = ref({ show: false, message: '', type: 'info' })

// ── Init ─────────────────────────────────────────────────────
onMounted(async () => {
  const config = await getConfig()
  if (config) {
    themeMode.value = config.themeMode ?? 'auto'
    applyThemeMode(themeMode.value)
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

// ── Theme mode ───────────────────────────────────────────────
async function changeThemeMode(mode: ThemeMode) {
  themeMode.value = mode
  await applyThemeMode(mode)
  await updateConfig({ themeMode: mode })
}

// ── Reminder ─────────────────────────────────────────────────
async function applyReminder() {
  const message = getLocalizedReminderMessage(locale.value)
  await scheduleDailyReminder(
    {
      language: locale.value as 'zh-CN' | 'en' | 'ja',
      themeMode: themeMode.value,
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

// ── Sponsor QR download ──────────────────────────────────────
// On native (Android/iOS) a browser `<a download>` is ignored by the
// WebView, so the file never reaches the gallery even though the click
// "succeeds". Use the Media plugin to save into the photo album instead.
// On web, keep the blob-based `<a download>` flow.
async function handleDownloadQr() {
  if (Capacitor.isNativePlatform()) {
    await saveQrToGallery()
  } else {
    await downloadQrInBrowser()
  }
}

async function saveQrToGallery() {
  try {
    // Read the bundled QR (served by the Capacitor local server) as a
    // base64 data URL — the native plugin can't resolve a relative path.
    const res = await fetch(appConfig.wechatQrUrl)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const dataUrl = await blobToDataUrl(await res.blob())

    // savePhoto on Android requires an existing album folder, so make
    // sure ours exists first (createAlbum throws if it already does).
    const albumName = 'StickStudy'
    const { path } = await Media.getAlbumsPath()
    try {
      await Media.createAlbum({ name: albumName })
    } catch {
      // Album already exists — fine.
    }

    await Media.savePhoto({
      path: dataUrl,
      albumIdentifier: `${path}/${albumName}`,
      fileName: `wxpay-${Date.now()}`
    })
    showToast(t('settings.toast.qrSavedToGallery'), 'success')
  } catch (err) {
    console.error(err)
    showToast(t('settings.toast.qrDownloadFailed'), 'error')
  }
}

async function downloadQrInBrowser() {
  try {
    const res = await fetch(appConfig.wechatQrUrl)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const url = URL.createObjectURL(await res.blob())
    const a = document.createElement('a')
    a.href = url
    a.download = 'wxpay.jpg'
    a.click()
    URL.revokeObjectURL(url)
    showToast(t('settings.toast.qrDownloaded'), 'success')
  } catch (err) {
    console.error(err)
    // Fallback: let the user save it manually.
    window.open(appConfig.wechatQrUrl, '_blank', 'noopener')
    showToast(t('settings.toast.qrDownloadFailed'), 'error')
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function showToast(msg: string, type: 'info' | 'success' | 'error' = 'info') {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => {
    toast.value.show = false
  }, 2500)
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
  background: var(--surface);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-sm);
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
  background: #fff;
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

.action-btn:active {
  transform: scale(0.9);
}

.action-row.danger .action-label {
  color: var(--sakura);
}
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

.about-logo {
  display: block;
  margin: 0 auto 0.75rem;
  width: 72px;
  height: 72px;
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

/* About links (GitHub / Sponsor) */
.link-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-align: left;
  padding: 12px 0;
  border-top: 1px solid rgba(128, 128, 128, 0.08);
  background: transparent;
  border-left: none;
  border-right: none;
  border-bottom: none;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  font-family: inherit;
}

.about .link-row:first-of-type {
  margin-top: 0.75rem;
}

.link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  color: var(--ink);
}

.link-icon svg {
  width: 24px;
  height: 24px;
}

.link-icon.heart {
  color: var(--sakura);
}

.link-row .action-info {
  flex: 1;
  text-align: left;
}

.link-arrow {
  color: rgba(var(--ink-rgb), 0.3);
  font-size: 1.1rem;
}

.no-ads {
  margin: 1rem 0 0;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(128, 128, 128, 0.08);
  font-size: 0.8rem;
  color: var(--moss);
  font-weight: 500;
}

/* Sponsor dialog */
.sponsor-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 400;
  padding: 1rem;
}

.sponsor-dialog {
  background: var(--surface);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  max-width: 300px;
  width: 100%;
  box-shadow: var(--shadow-md);
  text-align: center;
}

.sponsor-title {
  font-size: 1.05rem;
  color: var(--ink);
  margin: 0 0 1rem;
}

.sponsor-qr {
  display: block;
  width: 220px;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
  border-radius: var(--radius-sm);
  background: #fff;
}

.sponsor-tip {
  font-size: 0.82rem;
  color: rgba(var(--ink-rgb), 0.6);
  margin: 0.75rem 0 1rem;
  line-height: 1.5;
}

.sponsor-actions {
  display: flex;
  gap: 8px;
}

.btn-download {
  flex: 1;
  padding: 10px;
  background: var(--sakura);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  cursor: pointer;
}

/* Toast */
.toast {
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px) + 20px);
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

.toast.success {
  background: var(--moss);
  color: white;
}
.toast.error {
  background: var(--sakura);
  color: white;
}

.toast-enter-active {
  transition:
    transform 0.3s cubic-bezier(0.34, 1.2, 0.64, 1),
    opacity 0.2s;
}
.toast-leave-active {
  transition:
    transform 0.2s,
    opacity 0.2s;
}
.toast-enter-from,
.toast-leave-to {
  transform: translateX(-50%) translateY(-20px);
  opacity: 0;
}

/* Confirm dialog */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 400;
  padding: 1rem;
}

.confirm-dialog {
  background: var(--surface);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  max-width: 320px;
  width: 100%;
  box-shadow: var(--shadow-md);
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
