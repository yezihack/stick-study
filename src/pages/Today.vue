<template>
  <div class="page-today">
    <CompleteBanner :show="showBanner" :streak="streak" />

    <!-- Header -->
    <header class="today-header">
      <div class="header-left">
        <p class="today-greeting">{{ greeting }}</p>
        <p class="today-date">{{ formattedDate }}</p>
      </div>
      <div v-if="streak > 0" class="streak-badge">
        🔥 {{ t('today.streak', { days: streak }) }}
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <span>{{ t('common.loading') }}</span>
    </div>

    <template v-else>
      <!-- No plan state -->
      <div v-if="activePlans.length === 0" class="empty-state">
        <p class="empty-icon">📚</p>
        <p class="empty-title">{{ t('today.noPlan') }}</p>
        <p class="empty-sub">{{ t('today.noPlanSub') }}</p>
        <button class="go-plans-btn" @click="router.push('/plans')">
          {{ t('nav.plans') }} →
        </button>
      </div>

      <template v-else>
        <!-- Active plan tags -->
        <div class="plan-tags">
          <span
            v-for="plan in activePlans"
            :key="plan.id"
            class="plan-tag"
            :style="{ borderColor: plan.color }"
          >
            <span class="plan-dot" :style="{ background: plan.color }" />
            {{ plan.name }}
            <span class="plan-ends">{{ t('today.planEnds', { date: plan.endDate }) }}</span>
          </span>
        </div>

        <!-- Progress -->
        <div class="progress-section">
          <ProgressBar :done="doneCount" :total="totalCount" />
        </div>

        <!-- Task list -->
        <ul class="task-list" aria-label="Task list">
          <li v-for="task in tasks" :key="task.taskItemId">
            <TaskCard
              :task="task"
              :item="getTaskItem(task.taskItemId)"
              @toggle="handleToggle"
            />
          </li>

          <!-- Empty tasks (no templates) -->
          <li v-if="tasks.length === 0" class="tasks-empty">
            <p>{{ t('today.noPlan') }}</p>
          </li>
        </ul>

        <!-- Add temp task -->
        <div class="add-task-section">
          <template v-if="!showAddTask">
            <button class="add-task-btn" @click="showAddTask = true">
              {{ t('today.addTask') }}
            </button>
          </template>
          <template v-else>
            <div class="add-task-form">
              <input
                v-model="tempTaskInput"
                class="add-task-input"
                :placeholder="t('today.addTaskPlaceholder')"
                autofocus
                @keydown.enter="submitTempTask"
                @keydown.esc="showAddTask = false"
              />
              <div class="add-task-actions">
                <button class="btn-confirm" @click="submitTempTask">
                  {{ t('today.addTaskConfirm') }}
                </button>
                <button class="btn-cancel" @click="showAddTask = false; tempTaskInput = ''">
                  {{ t('today.addTaskCancel') }}
                </button>
              </div>
            </div>
          </template>
        </div>

        <!-- Note -->
        <div class="note-section">
          <label class="note-label" for="daily-note">{{ t('today.note') }}</label>
          <textarea
            id="daily-note"
            v-model="noteText"
            class="note-textarea"
            :placeholder="t('today.notePlaceholder')"
            rows="4"
            @blur="handleSaveNote"
          />
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import TaskCard from '@/components/TaskCard.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import CompleteBanner from '@/components/CompleteBanner.vue'
import { useToday } from '@/composables/useToday'

const router = useRouter()
const { t, locale } = useI18n()

const {
  loading,
  dailyLog,
  activePlans,
  tasks,
  totalCount,
  doneCount,
  isAllDone,
  streak,
  load,
  toggleTask,
  addTempTask,
  saveNote,
  getTaskItem
} = useToday()

// ── UI state ────────────────────────────────────────────────
const showBanner = ref(false)
const showAddTask = ref(false)
const tempTaskInput = ref('')
const noteText = ref('')
let bannerTimer: ReturnType<typeof setTimeout> | null = null

// ── Greeting ────────────────────────────────────────────────
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return t('today.greeting.morning')
  if (h < 18) return t('today.greeting.afternoon')
  return t('today.greeting.evening')
})

// ── Date formatting (locale-aware) ──────────────────────────
const formattedDate = computed(() => {
  const lang = locale.value
  const date = new Date()
  if (lang === 'zh-CN') {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }
  if (lang === 'ja') {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
})

// ── Watch all-done → show banner ─────────────────────────────
watch(isAllDone, val => {
  if (!val) return
  if (bannerTimer) clearTimeout(bannerTimer)
  showBanner.value = true
  bannerTimer = setTimeout(() => { showBanner.value = false }, 4000)
})

// ── Sync note textarea with loaded data ──────────────────────
watch(dailyLog, log => {
  if (log) noteText.value = log.note
}, { immediate: true })

// ── Handlers ────────────────────────────────────────────────
async function handleToggle(taskItemId: string) {
  await toggleTask(taskItemId)
}

async function submitTempTask() {
  if (!tempTaskInput.value.trim()) return
  await addTempTask(tempTaskInput.value)
  tempTaskInput.value = ''
  showAddTask.value = false
}

async function handleSaveNote() {
  await saveNote(noteText.value)
}

// ── Init ─────────────────────────────────────────────────────
onMounted(() => load())
</script>

<style scoped>
.page-today {
  padding: 1.5rem 1rem;
  padding-bottom: calc(var(--nav-height) + 1rem);
  max-width: 480px;
  margin: 0 auto;
}

/* Header */
.today-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.today-greeting {
  font-size: 0.85rem;
  color: rgba(26, 31, 26, 0.55);
  margin: 0 0 2px;
}

.today-date {
  font-size: 1.2rem;
  font-family: var(--font-serif);
  font-weight: 700;
  color: var(--ink);
  margin: 0;
}

.streak-badge {
  background: var(--gold);
  color: white;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  white-space: nowrap;
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 3rem 0;
  color: rgba(26, 31, 26, 0.4);
  font-size: 0.9rem;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  margin: 0 0 0.5rem;
}

.empty-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--ink);
  margin: 0 0 0.25rem;
}

.empty-sub {
  font-size: 0.85rem;
  color: rgba(26, 31, 26, 0.5);
  margin: 0 0 1.25rem;
}

.go-plans-btn {
  padding: 8px 20px;
  background: var(--sakura);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
}

/* Plan tags */
.plan-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 1rem;
}

.plan-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1.5px solid var(--sakura);
  border-radius: 20px;
  font-size: 0.78rem;
  color: var(--ink);
  background: white;
}

.plan-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.plan-ends {
  font-size: 0.7rem;
  opacity: 0.55;
}

/* Progress */
.progress-section {
  margin-bottom: 1.25rem;
}

/* Task list */
.task-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tasks-empty {
  text-align: center;
  padding: 1.5rem;
  color: rgba(26, 31, 26, 0.4);
  font-size: 0.85rem;
}

/* Add task */
.add-task-section {
  margin-bottom: 1.25rem;
}

.add-task-btn {
  width: 100%;
  padding: 12px;
  border: 1.5px dashed rgba(26, 31, 26, 0.2);
  border-radius: var(--radius-md);
  background: transparent;
  color: rgba(26, 31, 26, 0.5);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s;
}

.add-task-btn:hover {
  border-color: var(--sakura);
  color: var(--sakura);
}

.add-task-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-task-input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid var(--sakura);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-family: var(--font-sans);
  color: var(--ink);
  background: white;
  outline: none;
}

.add-task-actions {
  display: flex;
  gap: 8px;
}

.btn-confirm {
  flex: 1;
  padding: 9px;
  background: var(--sakura);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  cursor: pointer;
}

.btn-cancel {
  flex: 1;
  padding: 9px;
  background: transparent;
  color: rgba(26, 31, 26, 0.55);
  border: 1.5px solid rgba(26, 31, 26, 0.15);
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  cursor: pointer;
}

/* Note */
.note-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.note-label {
  font-size: 0.8rem;
  color: rgba(26, 31, 26, 0.55);
  font-weight: 500;
}

.note-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid rgba(26, 31, 26, 0.12);
  border-radius: var(--radius-md);
  font-size: 0.88rem;
  font-family: var(--font-sans);
  color: var(--ink);
  background: white;
  resize: vertical;
  outline: none;
  line-height: 1.6;
  transition: border-color 0.15s;
}

.note-textarea:focus {
  border-color: var(--sakura);
}
</style>
