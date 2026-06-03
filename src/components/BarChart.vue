<template>
  <div class="bar-chart" aria-hidden="true">
    <div
      v-for="day in days"
      :key="day.date"
      class="bar-col"
      :class="{ today: day.isToday }"
    >
      <span class="bar-value">{{ day.count > 0 ? day.count : '' }}</span>
      <div class="bar-track">
        <div
          class="bar-fill"
          :style="{ height: barHeight(day.count) + '%' }"
        />
      </div>
      <span class="bar-label">{{ day.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WeekDay } from '@/composables/useStats'

const props = defineProps<{ days: WeekDay[] }>()

const maxCount = computed(() => Math.max(...props.days.map(d => d.count), 1))

function barHeight(count: number): number {
  return Math.round((count / maxCount.value) * 100)
}
</script>

<style scoped>
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 120px;
  padding-bottom: 0;
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
}

.bar-value {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: rgba(26,31,26,0.5);
  height: 14px;
  line-height: 14px;
}

.bar-track {
  flex: 1;
  width: 100%;
  background: rgba(26,31,26,0.07);
  border-radius: 4px 4px 2px 2px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  background: var(--sakura);
  border-radius: 4px 4px 0 0;
  transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 0;
}

.bar-col.today .bar-fill {
  background: var(--moss);
}

.bar-label {
  font-size: 0.65rem;
  color: rgba(26,31,26,0.5);
  white-space: nowrap;
}

.bar-col.today .bar-label {
  color: var(--moss);
  font-weight: 700;
}
</style>
