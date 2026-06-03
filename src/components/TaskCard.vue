<template>
  <button
    class="task-card"
    :class="{ completed: task.completed }"
    @click="$emit('toggle', task.taskItemId)"
  >
    <!-- Checkbox -->
    <span class="check-circle" aria-hidden="true">
      <svg v-if="task.completed" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7.5" stroke="currentColor"/>
        <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg v-else viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7.5" stroke="currentColor"/>
      </svg>
    </span>

    <!-- Content -->
    <span class="card-body">
      <span class="card-main">
        <!-- Type badge -->
        <span v-if="!task.isTemp" class="type-badge" :style="{ background: typeColor }">
          {{ t(`taskType.${item?.type ?? 'custom'}`) }}
        </span>
        <span v-else class="type-badge temp-badge">{{ t('taskType.custom') }}</span>

        <!-- Title -->
        <span class="card-title">
          <template v-if="task.isTemp">{{ task.tempDescription }}</template>
          <template v-else>
            {{ item?.count }} {{ t(`taskType.${item?.type ?? 'custom'}`) }}
            <span v-if="item?.description" class="card-desc">— {{ item.description }}</span>
          </template>
        </span>
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TaskLog, TaskItem } from '@/db/models'

const props = defineProps<{
  task: TaskLog
  item: TaskItem | null
}>()

defineEmits<{ toggle: [taskItemId: string] }>()

const { t } = useI18n()

const TYPE_COLORS: Record<string, string> = {
  questions: '#c0544a',
  grammar: '#b8962a',
  pages: '#4a6741',
  listening: '#5a7fa0',
  vocab: '#8a5a9a',
  custom: '#888'
}

const typeColor = computed(() => {
  const type = props.item?.type ?? 'custom'
  return TYPE_COLORS[type] ?? TYPE_COLORS.custom
})
</script>

<style scoped>
.task-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  background: white;
  border: 1.5px solid rgba(26, 31, 26, 0.08);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
  transition: all 0.18s ease;
  box-shadow: var(--shadow-sm);
}

.task-card:active {
  transform: scale(0.98);
}

.task-card.completed {
  opacity: 0.55;
  background: rgba(26, 31, 26, 0.03);
}

.check-circle {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 1px;
  color: var(--sakura);
  transition: color 0.15s;
}

.task-card.completed .check-circle {
  color: var(--moss);
}

.check-circle svg {
  width: 100%;
  height: 100%;
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.type-badge {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  letter-spacing: 0.03em;
  flex-shrink: 0;
}

.temp-badge {
  background: #888;
}

.card-title {
  font-size: 0.92rem;
  color: var(--ink);
  font-family: var(--font-sans);
  line-height: 1.4;
}

.task-card.completed .card-title {
  text-decoration: line-through;
  color: rgba(26, 31, 26, 0.4);
}

.card-desc {
  color: rgba(26, 31, 26, 0.5);
  font-size: 0.85rem;
}
</style>
