<template>
  <div class="page-calendar">
    <header class="cal-header">
      <h1 class="page-title">{{ t('calendar.title') }}</h1>
    </header>

    <!-- Month navigation -->
    <div class="month-nav">
      <button class="nav-btn" :aria-label="'prev'" @click="prevMonth">‹</button>
      <span class="month-label">
        {{ monthLabel.year }}<span class="month-sep">年</span>{{ monthLabel.month
        }}<span class="month-sep">月</span>
      </span>
      <button class="nav-btn" :aria-label="'next'" @click="nextMonth">›</button>
    </div>

    <!-- Calendar grid -->
    <div class="grid-card">
      <CalendarGrid :days="calendarDays" @select="selectDay" />
    </div>

    <!-- Stats cards -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-value">{{ streak }}</span>
        <span class="stat-label">{{ t('calendar.statsStreak') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ monthStats.done }}</span>
        <span class="stat-label">{{ t('calendar.statsMonthDone') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ monthStats.rate }}%</span>
        <span class="stat-label">{{ t('calendar.statsMonthRate') }}</span>
      </div>
    </div>

    <!-- Completion-rate stats (today / yesterday / last week) -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-value">{{ fmtRate(periodStats.today) }}</span>
        <span class="stat-label">{{ t('calendar.statsTodayRate') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ fmtRate(periodStats.yesterday) }}</span>
        <span class="stat-label">{{ t('calendar.statsYesterdayRate') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ fmtRate(periodStats.lastWeek) }}</span>
        <span class="stat-label">{{ t('calendar.statsLastWeekRate') }}</span>
      </div>
    </div>

    <!-- Legend -->
    <div class="legend">
      <span class="legend-item">
        <span class="legend-dot done" />{{ t('calendar.status.done') }}
      </span>
      <span class="legend-item">
        <span class="legend-dot partial" />{{ t('calendar.status.partial') }}
      </span>
      <span class="legend-item">
        <span class="legend-dot none" />{{ t('calendar.status.none') }}
      </span>
    </div>

    <!-- Recent history -->
    <section class="recent-section">
      <h2 class="section-title">{{ t('calendar.recentTitle') }}</h2>
      <p v-if="recentLogs.length === 0" class="no-recent">{{ t('calendar.noRecent') }}</p>
      <ul v-else class="recent-list">
        <li v-for="log in recentLogs" :key="log.id" class="recent-row" @click="selectDay(log.date)">
          <span class="recent-date">{{ formatDate(log.date) }}</span>
          <span class="recent-count">
            {{ log.tasks.filter(t => t.completed).length }} / {{ log.tasks.length }}
          </span>
          <span class="recent-arrow">›</span>
        </li>
      </ul>
    </section>

    <!-- Day detail modal -->
    <DayDetailModal
      :show="!!selectedDate"
      :date="selectedDate"
      :log="selectedLog"
      :templates="templates"
      @close="closeDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import CalendarGrid from '@/components/CalendarGrid.vue'
import DayDetailModal from '@/components/DayDetailModal.vue'
import { useCalendar } from '@/composables/useCalendar'
import { db } from '@/db'
import type { TaskTemplate } from '@/db/models'

const { t, locale } = useI18n()

const {
  monthLabel,
  calendarDays,
  monthStats,
  streak,
  periodStats,
  recentLogs,
  selectedDate,
  selectedLog,
  load,
  prevMonth,
  nextMonth,
  selectDay,
  closeDetail
} = useCalendar()

const templates = ref<TaskTemplate[]>([])

// Render a completion rate; "—" when no tasks existed in that period.
function fmtRate(rate: number | null): string {
  return rate === null ? '—' : `${rate}%`
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  if (locale.value === 'en') {
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return `${m}月${d}日`
}

onMounted(async () => {
  await load()
  templates.value = await db.taskTemplates.toArray()
})
</script>

<style scoped>
.page-calendar {
  padding: 1.5rem 1rem;
  padding-bottom: calc(var(--nav-height) + 1rem);
  max-width: 480px;
  margin: 0 auto;
}

.cal-header {
  margin-bottom: 1rem;
}

.page-title {
  font-size: 1.4rem;
  color: var(--ink);
  margin: 0;
}

/* Month nav */
.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid rgba(var(--ink-rgb), 0.15);
  background: var(--surface);
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
  transition: all 0.15s;
}

.nav-btn:hover {
  border-color: var(--sakura);
  color: var(--sakura);
}

.month-label {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
}

.month-sep {
  font-size: 0.85rem;
  opacity: 0.6;
}

/* Grid card */
.grid-card {
  background: var(--surface);
  border-radius: var(--radius-md);
  padding: 12px;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-sm);
}

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 0.75rem;
}

.stat-card {
  background: var(--surface);
  border-radius: var(--radius-md);
  padding: 12px 8px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-family: var(--font-mono);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--ink);
}

.stat-label {
  font-size: 0.68rem;
  color: rgba(var(--ink-rgb), 0.5);
}

/* Legend */
.legend {
  display: flex;
  gap: 12px;
  margin-bottom: 1.25rem;
  padding: 0 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: rgba(var(--ink-rgb), 0.6);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.done {
  background: var(--moss);
}
.legend-dot.partial {
  background: var(--gold);
}
.legend-dot.none {
  background: rgba(var(--ink-rgb), 0.12);
}

/* Recent */
.recent-section {
  margin-top: 0.5rem;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gold);
  margin: 0 0 0.5rem;
}

.no-recent {
  font-size: 0.85rem;
  color: rgba(var(--ink-rgb), 0.4);
  text-align: center;
  padding: 1rem 0;
}

.recent-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.recent-row {
  display: flex;
  align-items: center;
  background: var(--surface);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: opacity 0.15s;
}

.recent-row:active {
  opacity: 0.7;
}

.recent-date {
  flex: 1;
  font-size: 0.88rem;
  color: var(--ink);
}

.recent-count {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: rgba(var(--ink-rgb), 0.5);
  margin-right: 8px;
}

.recent-arrow {
  color: rgba(var(--ink-rgb), 0.3);
  font-size: 0.9rem;
}
</style>
