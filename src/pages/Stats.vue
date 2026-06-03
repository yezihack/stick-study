<template>
  <div class="page-stats">
    <header class="stats-header">
      <h1 class="page-title">{{ t('stats.title') }}</h1>
    </header>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>

    <template v-else>
      <!-- Range switcher -->
      <div class="range-switcher">
        <button
          v-for="r in ranges"
          :key="r.key"
          class="range-btn"
          :class="{ active: range === r.key }"
          @click="setRange(r.key)"
        >
          {{ t(`stats.range.${r.key}`) }}
        </button>
      </div>

      <!-- Hero totals -->
      <div class="hero-row">
        <div class="hero-card">
          <span class="hero-value">{{ totalTasks }}</span>
          <span class="hero-label">{{ t('stats.totalTasks') }}{{ locale === 'zh-CN' || locale === 'ja' ? t('stats.tasksUnit') : '' }}</span>
        </div>
        <div class="hero-card">
          <span class="hero-value">{{ totalDays }}</span>
          <span class="hero-label">{{ t('stats.totalDays') }}{{ locale === 'zh-CN' || locale === 'ja' ? t('stats.daysUnit') : '' }}</span>
        </div>
      </div>

      <!-- Week bar chart -->
      <div class="chart-card">
        <p class="card-title">{{ t('stats.weekChart') }}</p>
        <BarChart :days="weekData" />
      </div>

      <!-- Type breakdown -->
      <div class="breakdown-card">
        <p class="card-title">{{ t('stats.typeBreakdown') }}</p>
        <div v-if="richTypeStats.length === 0" class="no-data">{{ t('stats.noData') }}</div>
        <div v-else class="type-list">
          <TypeProgressBar
            v-for="stat in richTypeStats"
            :key="stat.type"
            :stat="stat"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BarChart from '@/components/BarChart.vue'
import TypeProgressBar from '@/components/TypeProgressBar.vue'
import { useStats } from '@/composables/useStats'
import type { RangeKey } from '@/composables/useStats'

const { t, locale } = useI18n()

const {
  range,
  loading,
  totalTasks,
  totalDays,
  weekData,
  richTypeStats,
  setRange,
  load
} = useStats()

const ranges: { key: RangeKey }[] = [
  { key: 'week' },
  { key: 'month' },
  { key: 'all' }
]

onMounted(() => load())
</script>

<style scoped>
.page-stats {
  padding: 1.5rem 1rem;
  padding-bottom: calc(var(--nav-height) + 1rem);
  max-width: 480px;
  margin: 0 auto;
}

.stats-header { margin-bottom: 1rem; }

.page-title {
  font-size: 1.4rem;
  color: var(--ink);
  margin: 0;
}

.loading {
  text-align: center;
  padding: 3rem 0;
  color: rgba(26,31,26,0.4);
  font-size: 0.9rem;
}

/* Range switcher */
.range-switcher {
  display: flex;
  gap: 6px;
  margin-bottom: 1rem;
}

.range-btn {
  flex: 1;
  padding: 7px 0;
  border: 1.5px solid rgba(26,31,26,0.15);
  border-radius: 20px;
  background: transparent;
  font-size: 0.82rem;
  color: rgba(26,31,26,0.6);
  cursor: pointer;
  transition: all 0.15s;
}

.range-btn.active {
  border-color: var(--sakura);
  background: var(--sakura);
  color: white;
}

/* Hero */
.hero-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 1rem;
}

.hero-card {
  background: white;
  border-radius: var(--radius-md);
  padding: 1.2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: var(--shadow-sm);
}

.hero-value {
  font-family: var(--font-mono);
  font-size: 2rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1;
}

.hero-label {
  font-size: 0.78rem;
  color: rgba(26,31,26,0.5);
}

/* Chart + breakdown cards */
.chart-card,
.breakdown-card {
  background: white;
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-sm);
}

.card-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gold);
  margin: 0 0 0.75rem;
}

.no-data {
  text-align: center;
  padding: 1rem 0;
  font-size: 0.85rem;
  color: rgba(26,31,26,0.4);
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
