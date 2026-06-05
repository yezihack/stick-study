<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div
        class="modal-sheet"
        role="dialog"
        :aria-label="t('calendar.dayDetail.title', { date: date })"
      >
        <!-- Handle bar -->
        <div class="modal-handle" />

        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">{{ formattedDate }}</h2>
          <button
            class="close-btn"
            :aria-label="t('calendar.dayDetail.close')"
            @click="$emit('close')"
          >
            ✕
          </button>
        </div>

        <!-- No data -->
        <div v-if="!log" class="modal-empty">
          <p>{{ t('calendar.dayDetail.noTasks') }}</p>
        </div>

        <template v-else>
          <!-- Tasks -->
          <div class="modal-section">
            <p class="section-label">{{ t('calendar.dayDetail.tasks') }}</p>
            <ul class="task-list">
              <li
                v-for="task in log.tasks"
                :key="task.taskItemId"
                class="task-row"
                :class="{ completed: task.completed }"
              >
                <span class="task-check">{{ task.completed ? '✓' : '○' }}</span>
                <span class="task-name">
                  {{ task.isTemp ? task.tempDescription : resolveLabel(task.taskItemId) }}
                </span>
              </li>
            </ul>
          </div>

          <!-- Note -->
          <div class="modal-section">
            <p class="section-label">{{ t('calendar.dayDetail.note') }}</p>
            <p v-if="log.note" class="note-text">{{ log.note }}</p>
            <p v-else class="note-empty">{{ t('calendar.dayDetail.noNote') }}</p>
          </div>
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DailyLog, TaskTemplate } from '@/db/models'

const props = defineProps<{
  show: boolean
  date: string | null
  log: DailyLog | null
  templates: TaskTemplate[]
}>()

defineEmits<{ close: [] }>()

const { t, locale } = useI18n()

const formattedDate = computed(() => {
  if (!props.date) return ''
  const [y, m, d] = props.date.split('-').map(Number)
  if (locale.value === 'en') {
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  return `${y}年${m}月${d}日`
})

function resolveLabel(taskItemId: string): string {
  for (const tpl of props.templates) {
    const item = tpl.items.find(i => i.id === taskItemId)
    if (item)
      return `${item.count} ${t(`taskType.${item.type}`)}${item.description ? ' — ' + item.description : ''}`
  }
  return taskItemId
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  z-index: 300;
}

.modal-sheet {
  width: 100%;
  max-height: 80vh;
  background: var(--paper);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  padding: 0 1rem 2rem;
  overflow-y: auto;
}

.modal-handle {
  width: 40px;
  height: 4px;
  background: rgba(var(--ink-rgb), 0.15);
  border-radius: 2px;
  margin: 10px auto 4px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0 1rem;
}

.modal-title {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  color: var(--ink);
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1rem;
  color: rgba(var(--ink-rgb), 0.4);
  cursor: pointer;
  padding: 4px 8px;
}

.modal-empty {
  text-align: center;
  padding: 2rem 0;
  color: rgba(var(--ink-rgb), 0.4);
  font-size: 0.9rem;
}

.modal-section {
  margin-bottom: 1.25rem;
}

.section-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gold);
  margin: 0 0 0.5rem;
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.task-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  color: var(--ink);
}

.task-row.completed .task-name {
  text-decoration: line-through;
  opacity: 0.45;
}

.task-check {
  font-size: 0.8rem;
  color: var(--moss);
  min-width: 16px;
}

.task-row:not(.completed) .task-check {
  color: rgba(var(--ink-rgb), 0.3);
}

.note-text {
  font-size: 0.88rem;
  color: var(--ink);
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
}

.note-empty {
  font-size: 0.85rem;
  color: rgba(var(--ink-rgb), 0.4);
  margin: 0;
  font-style: italic;
}

/* Sheet slide-up */
.modal-enter-active {
  transition:
    transform 0.3s cubic-bezier(0.34, 1.2, 0.64, 1),
    opacity 0.2s;
}
.modal-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s;
}
.modal-enter-from,
.modal-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
