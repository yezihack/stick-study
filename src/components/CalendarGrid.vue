<template>
  <div class="calendar-grid">
    <!-- Weekday headers -->
    <div class="grid-header">
      <span v-for="wd in weekdayLabels" :key="wd" class="wd-label">{{ wd }}</span>
    </div>

    <!-- Day cells -->
    <div class="grid-body">
      <button
        v-for="(cell, i) in days"
        :key="i"
        class="day-cell"
        :class="[
          cell.status,
          { today: cell.isToday, padding: !cell.isCurrentMonth, clickable: !!cell.date }
        ]"
        :disabled="!cell.date"
        :aria-label="cell.date || undefined"
        @click="cell.date && $emit('select', cell.date)"
      >
        <span v-if="cell.day" class="day-num">{{ cell.day }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CalendarDay } from '@/composables/useCalendar'

defineProps<{ days: CalendarDay[] }>()
defineEmits<{ select: [date: string] }>()

const { tm, rt } = useI18n()

const weekdayLabels = computed<string[]>(() => {
  const raw = tm('calendar.weekdays') as unknown[]
  const fallback = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return Array.isArray(raw) ? raw.map(m => rt(m as string)) : fallback
})
</script>

<style scoped>
.calendar-grid {
  user-select: none;
}

.grid-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}

.wd-label {
  text-align: center;
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(var(--ink-rgb), 0.45);
  padding: 4px 0;
}

.grid-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: default;
  transition: transform 0.12s;
}

.day-cell.clickable {
  cursor: pointer;
}

.day-cell.clickable:active {
  transform: scale(0.88);
}

.day-num {
  font-size: 0.8rem;
  font-family: var(--font-mono);
  color: var(--ink);
  line-height: 1;
}

/* Status colors */
.day-cell.done {
  background: var(--moss);
}
.day-cell.done .day-num {
  color: white;
}

.day-cell.partial {
  background: var(--gold);
}
.day-cell.partial .day-num {
  color: white;
}

.day-cell.none.clickable {
  background: rgba(var(--ink-rgb), 0.06);
}

.day-cell.today {
  outline: 2px solid var(--sakura);
  outline-offset: -2px;
}
.day-cell.today.none {
  background: transparent;
}
.day-cell.today .day-num {
  color: var(--sakura);
  font-weight: 700;
}
.day-cell.today.done .day-num,
.day-cell.today.partial .day-num {
  color: white;
}

.day-cell.padding {
  pointer-events: none;
  opacity: 0;
}
</style>
