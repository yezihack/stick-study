<template>
  <div class="type-row">
    <div class="type-meta">
      <span class="type-name">{{ t(`taskType.${stat.type}`) }}</span>
      <span class="type-count">{{ stat.count }}</span>
    </div>
    <div class="type-track">
      <div
        class="type-fill"
        :style="{ width: stat.pct + '%', background: color }"
      />
    </div>
    <span class="type-pct">{{ stat.pct }}%</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TypeStat } from '@/composables/useStats'

const props = defineProps<{ stat: TypeStat }>()
const { t } = useI18n()

const TYPE_COLORS: Record<string, string> = {
  questions: '#c0544a',
  grammar: '#b8962a',
  pages: '#4a6741',
  listening: '#5a7fa0',
  vocab: '#8a5a9a',
  custom: '#888'
}

const color = computed(() => TYPE_COLORS[props.stat.type] ?? TYPE_COLORS.custom)
</script>

<style scoped>
.type-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-meta {
  display: flex;
  justify-content: space-between;
  min-width: 100px;
}

.type-name {
  font-size: 0.85rem;
  color: var(--ink);
}

.type-count {
  font-size: 0.8rem;
  font-family: var(--font-mono);
  color: rgba(26,31,26,0.55);
}

.type-track {
  flex: 1;
  height: 8px;
  background: rgba(26,31,26,0.08);
  border-radius: 999px;
  overflow: hidden;
}

.type-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.type-pct {
  font-size: 0.75rem;
  font-family: var(--font-mono);
  color: rgba(26,31,26,0.45);
  min-width: 32px;
  text-align: right;
}
</style>
