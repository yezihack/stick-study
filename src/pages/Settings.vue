<template>
  <div class="page-settings">
    <h1 class="page-title">{{ t('settings.title') }}</h1>

    <!-- Language -->
    <section class="settings-section">
      <h2 class="section-title">{{ t('settings.section.general') }}</h2>

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
    </section>

    <!-- DB test (临时，M5 时替换) -->
    <section class="settings-section">
      <h2 class="section-title">DB Test</h2>
      <div v-if="config" class="db-info">
        <pre>{{ JSON.stringify(config, null, 2) }}</pre>
      </div>
      <div class="test-buttons">
        <button class="test-btn" @click="testWrite">Write test plan</button>
        <button class="test-btn" @click="testRead">Read all tables</button>
      </div>
      <pre v-if="testResult" class="test-result">{{ testResult }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getConfig, updateConfig, db } from '@/db'
import type { Plan } from '@/db/models'

const { t, locale } = useI18n()
const config = ref()
const testResult = ref('')

const languages = [
  { code: 'zh-CN', label: '中文' },
  { code: 'en', label: 'EN' },
  { code: 'ja', label: '日本語' }
] as const

onMounted(async () => {
  config.value = await getConfig()
})

async function changeLanguage(lang: 'zh-CN' | 'en' | 'ja') {
  locale.value = lang
  await updateConfig({ language: lang })
  config.value = await getConfig()
}

async function testWrite() {
  const plan: Plan = {
    id: crypto.randomUUID(),
    name: 'Test Plan',
    bookTitle: 'Test Book',
    startDate: '2026-06-01',
    endDate: '2026-12-31',
    isActive: true,
    color: '#c0544a',
    createdAt: new Date().toISOString()
  }
  await db.plans.add(plan)
  testResult.value = `✅ Plan added: ${plan.name} (${plan.id})`
}

async function testRead() {
  const [plans, logs, templates] = await Promise.all([
    db.plans.toArray(),
    db.dailyLogs.toArray(),
    db.taskTemplates.toArray()
  ])
  testResult.value = JSON.stringify(
    { plans: plans.length, dailyLogs: logs.length, taskTemplates: templates.length, plans_data: plans },
    null,
    2
  )
}
</script>

<style scoped>
.page-settings {
  padding: 1.5rem 1rem 2rem;
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

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gold);
  margin-bottom: 0.75rem;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.row-label {
  font-size: 0.95rem;
  color: var(--ink);
}

.lang-switcher {
  display: flex;
  gap: 4px;
}

.lang-btn {
  padding: 4px 10px;
  border: 1.5px solid rgba(26, 31, 26, 0.2);
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

.db-info pre {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  background: var(--ink);
  color: var(--paper);
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  overflow-x: auto;
  margin-bottom: 0.75rem;
}

.test-buttons {
  display: flex;
  gap: 0.5rem;
}

.test-btn {
  padding: 6px 12px;
  background: var(--moss);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  cursor: pointer;
}

.test-result {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  background: var(--ink);
  color: #a8d8a8;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  margin-top: 0.75rem;
  overflow-x: auto;
  white-space: pre-wrap;
}
</style>
