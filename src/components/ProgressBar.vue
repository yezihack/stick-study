<template>
  <div class="progress-wrap">
    <div class="progress-meta">
      <span class="progress-label">{{ t('today.progress') }}</span>
      <span class="progress-count">{{ t('today.progressDetail', { done, total }) }}</span>
    </div>
    <div class="progress-track" role="progressbar" :aria-valuenow="pct" aria-valuemin="0" aria-valuemax="100">
      <div
        class="progress-fill"
        :style="{ width: pct + '%' }"
        :class="{ done: pct === 100 }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ done: number; total: number }>()
const { t } = useI18n()

const pct = computed(() =>
  props.total === 0 ? 0 : Math.round((props.done / props.total) * 100)
)
</script>

<style scoped>
.progress-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.progress-label {
  font-size: 0.8rem;
  color: rgba(26, 31, 26, 0.6);
  font-family: var(--font-sans);
}

.progress-count {
  font-size: 0.85rem;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--ink);
}

.progress-track {
  height: 8px;
  background: rgba(26, 31, 26, 0.1);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--sakura);
  border-radius: 999px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-fill.done {
  background: var(--moss);
}
</style>
