<template>
  <div class="plan-card">
    <!-- 大任务: plan header (white zone) -->
    <div class="card-head" :style="{ borderLeftColor: plan.color }">
      <div class="head-main">
        <div class="card-meta">
          <span class="card-name">{{ plan.name }}</span>
          <span class="card-book">{{ plan.bookTitle }}</span>
          <span class="card-dates">{{ plan.startDate }} ～ {{ plan.endDate }}</span>
        </div>
        <div class="head-side">
          <span class="status-dot" :style="{ background: plan.isActive ? 'var(--moss)' : 'rgba(26,31,26,0.2)' }" />
          <div class="card-actions">
            <button class="action-btn" :aria-label="t('common.edit')" @click="$emit('edit', plan)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 20h4l10-10-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>
            </button>
            <button
              class="action-btn"
              :aria-label="plan.isActive ? t('plans.form.archive') : t('plans.active')"
              @click="$emit('toggle', plan.id)"
            >
              <svg v-if="plan.isActive" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="3.5" y="5" width="17" height="4" rx="1"/><path d="M5 9v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9"/><line x1="10" y1="13" x2="14" y2="13"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M7 5l11 7-11 7z"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="card-progress">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progress.pct + '%', background: plan.color }" />
        </div>
        <span class="days-left" :class="{ over: progress.daysLeft < 0 }">
          {{
            progress.daysLeft < 0
              ? t('plans.daysOver')
              : t('plans.daysLeft', { days: progress.daysLeft })
          }}
        </span>
      </div>
    </div>

    <!-- 小任务: sub-task list (paper-toned zone) -->
    <div v-if="items.length > 0" class="card-tasks">
      <div v-for="item in items" :key="item.id" class="task-row">
        <span class="task-badge" :style="typeStyle(item.type)">{{ t('taskType.' + item.type) }}</span>
        <span class="task-desc">{{ item.description || t('taskType.' + item.type) }}</span>
        <span class="task-count">×{{ item.count }}{{ unitSuffix(item.type) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Plan, TaskTemplate, TaskItem } from '@/db/models'
import { TaskType } from '@/db/models'
import { usePlans } from '@/composables/usePlans'

const props = defineProps<{ plan: Plan; templates?: TaskTemplate[] }>()
defineEmits<{
  edit: [plan: Plan]
  toggle: [id: string]
}>()

const { t } = useI18n()
const { getPlanProgress } = usePlans()
const progress = computed(() => getPlanProgress(props.plan))

// Flatten all task items across this plan's templates for display
const items = computed<TaskItem[]>(() =>
  (props.templates ?? []).flatMap(tpl => tpl.items)
)

// Tinted badge color per task type
const TYPE_COLORS: Record<string, string> = {
  [TaskType.QUESTIONS]: 'var(--moss)',
  [TaskType.GRAMMAR]: 'var(--gold)',
  [TaskType.PAGES]: 'var(--sakura)',
  [TaskType.LISTENING]: '#5a7fa0',
  [TaskType.VOCAB]: '#8a5a9a',
  [TaskType.CUSTOM]: 'var(--ink)'
}

function typeStyle(type: string) {
  const color = TYPE_COLORS[type] ?? 'var(--ink)'
  return { color, background: `color-mix(in srgb, ${color} 16%, transparent)` }
}

function unitSuffix(type: string): string {
  return type === TaskType.PAGES ? 'p' : ''
}
</script>

<style scoped>
.plan-card {
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── 大任务: header zone (white) ───────────────────── */
.card-head {
  background: white;
  border-left: 4px solid var(--sakura);
  padding: 14px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.head-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.card-name {
  font-family: var(--font-serif);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.25;
}

.card-book {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.85rem;
  color: rgba(26,31,26,0.55);
}

.card-dates {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  color: rgba(26,31,26,0.4);
  margin-top: 2px;
}

.head-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.card-actions {
  display: flex;
  gap: 2px;
}

.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: background 0.12s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(26,31,26,0.55);
}

.action-btn svg { width: 18px; height: 18px; }

.action-btn:hover {
  background: rgba(26,31,26,0.06);
  color: var(--ink);
}

.card-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-track {
  flex: 1;
  height: 4px;
  background: rgba(26,31,26,0.08);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s;
}

.days-left {
  flex-shrink: 0;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--moss);
}

.days-left.over { color: rgba(26,31,26,0.35); }

/* ── 小任务: sub-task zone (paper tone) ────────────── */
.card-tasks {
  background: color-mix(in srgb, var(--paper) 70%, white);
  border-top: 1px solid rgba(26,31,26,0.06);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-badge {
  flex-shrink: 0;
  min-width: 44px;
  text-align: center;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 0.76rem;
  font-weight: 600;
}

.task-desc {
  flex: 1;
  font-size: 0.9rem;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-count {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(26,31,26,0.55);
}
</style>
