<template>
  <div class="page-settings">
    <h1>Settings Page</h1>
    
    <div v-if="config" class="config-info">
      <h2>Current Config:</h2>
      <pre>{{ JSON.stringify(config, null, 2) }}</pre>
      
      <div class="test-buttons">
        <button @click="testDatabaseWrite">Test Write</button>
        <button @click="testDatabaseRead">Test Read</button>
        <button @click="changeLanguage">Change Language</button>
      </div>
      
      <div v-if="testResult" class="test-result">
        <strong>Test Result:</strong>
        <pre>{{ testResult }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getConfig, updateConfig, db } from '@/db'
import type { Plan } from '@/db/models'
import { useI18n } from 'vue-i18n'

const config = ref()
const testResult = ref('')
const { locale } = useI18n()

onMounted(async () => {
  config.value = await getConfig()
})

async function testDatabaseWrite() {
  try {
    // Test creating a plan
    const testPlan: Plan = {
      id: crypto.randomUUID(),
      name: '测试计划',
      bookTitle: '测试书籍',
      startDate: '2026-06-01',
      endDate: '2026-12-31',
      isActive: true,
      color: '#c0544a',
      createdAt: new Date().toISOString()
    }
    
    await db.plans.add(testPlan)
    testResult.value = `✅ Successfully created plan: ${testPlan.name}`
  } catch (error) {
    testResult.value = `❌ Error: ${error}`
  }
}

async function testDatabaseRead() {
  try {
    const plans = await db.plans.toArray()
    const dailyLogs = await db.dailyLogs.toArray()
    const templates = await db.taskTemplates.toArray()
    
    testResult.value = JSON.stringify({
      plans: plans.length,
      dailyLogs: dailyLogs.length,
      templates: templates.length,
      plansData: plans
    }, null, 2)
  } catch (error) {
    testResult.value = `❌ Error: ${error}`
  }
}

async function changeLanguage() {
  const languages: Array<'zh-CN' | 'en' | 'ja'> = ['zh-CN', 'en', 'ja']
  const currentIndex = languages.indexOf(locale.value as 'zh-CN' | 'en' | 'ja')
  const nextLang = languages[(currentIndex + 1) % languages.length]
  
  // Update i18n
  locale.value = nextLang
  
  // Save to database
  await updateConfig({ language: nextLang })
  
  // Reload config
  config.value = await getConfig()
  
  testResult.value = `✅ Language changed to: ${nextLang}`
}
</script>

<style scoped>
.page-settings {
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.config-info {
  margin-top: 1rem;
}

pre {
  background: var(--ink);
  color: var(--paper);
  padding: 1rem;
  border-radius: var(--radius-sm);
  overflow-x: auto;
}

.test-buttons {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
}

button {
  padding: 0.5rem 1rem;
  background: var(--sakura);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 500;
}

button:hover {
  opacity: 0.9;
}

.test-result {
  margin-top: 1rem;
  padding: 1rem;
  background: #e8f5e9;
  border-radius: var(--radius-sm);
}
</style>
