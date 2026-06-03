<template>
  <div class="plan-card" :style="{ borderLeftColor: plan.color }">
    <!-- Header -->
    <div class="card-head">
      <div class="card-meta">
        <span class="card-name">{{ plan.name }}</span>
        <span class="card-book">{{ plan.bookTitle }}</span>
      </div>
      <div class="card-actions">
        <button class="action-btn" :aria-label="t('common.edit')" @click="$emit('edit', plan)">✏️</button>
        <button
          class="action-btn"
          :aria-label="plan.isActive ? t('plans.form.archive') : t('plans.active')"
          @click="$emit('toggle', plan.id)"
        >
          {{ plan.isActive ? '📦' : '▶️' }}
        </button>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="card-progress">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progress.pct + '%', background: plan.color }" />
      </div>
    </div>

    <!-- Footer -->
    <div class="card-foot">
      <span class="date-range">{{ plan.startDate }} → {{ plan.endDate }}</span>
      <span class="days-left" :class="{ over: progress.daysLeft < 0 }">
        {{
          progress.daysLeft < 0
            ? t('plans.daysOver')
            : t('plans.daysLeft', { days: progress.daysLeft })
        }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Plan } from '@/db/models'
import { usePlans } from '@/composables/usePlans'

const props = defineProps<{ plan: Plan }>()
defineEmits<{
  edit: [plan: Plan]
  toggle: [id: string]
}>()

const { t } = useI18n()
const { getPlanProgress } = usePlans()
const progress = computed(() => getPlanProgress(props.plan))
</script>

<style scoped>
.plan-card {
  background: white;
  border-radius: var(--radius-md);
  border-left: 4px solid var(--sakura);
  padding: 14px 14px 10px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ink);
}

.card-book {
  font-size: 0.78rem;
  color: rgba(26,31,26,0.5);
}

.card-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  background: transparent;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: background 0.12s;
}

.action-btn:hover { background: rgba(26,31,26,0.06); }

.progress-track {
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

.card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-range {
  font-size: 0.72rem;
  font-family: var(--font-mono);
  color: rgba(26,31,26,0.4);
}

.days-left {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--moss);
}

.days-left.over { color: rgba(26,31,26,0.35); }
</style>
