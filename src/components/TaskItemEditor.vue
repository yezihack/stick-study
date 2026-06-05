<template>
  <div class="item-editor">
    <!-- Type selector -->
    <div class="field-row">
      <label class="field-label">{{
        t('plans.template.weekdays') !== '适用星期' ? t('taskType.' + item.type) : ''
      }}</label>
      <div class="type-pills">
        <button
          v-for="type in taskTypes"
          :key="type"
          class="type-pill"
          :class="{ active: item.type === type }"
          type="button"
          @click="emit('update', { ...item, type, unit: type })"
        >
          {{ t(`taskType.${type}`) }}
        </button>
      </div>
    </div>

    <!-- Count + description row -->
    <div class="item-row">
      <input
        class="count-input"
        type="number"
        min="1"
        :value="item.count"
        :aria-label="t('plans.template.count')"
        @input="
          emit('update', {
            ...item,
            count: Math.max(1, Number(($event.target as HTMLInputElement).value))
          })
        "
      />
      <input
        class="desc-input"
        type="text"
        :value="item.description"
        :placeholder="t('plans.template.description')"
        @input="emit('update', { ...item, description: ($event.target as HTMLInputElement).value })"
      />
      <button
        class="remove-btn"
        type="button"
        :aria-label="t('common.delete')"
        @click="emit('remove')"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { TaskType } from '@/db/models'
import type { TaskItem } from '@/db/models'

defineProps<{ item: TaskItem }>()
const emit = defineEmits<{
  update: [item: TaskItem]
  remove: []
}>()

const { t } = useI18n()
const taskTypes = Object.values(TaskType)
</script>

<style scoped>
.item-editor {
  background: rgba(var(--ink-rgb), 0.03);
  border-radius: var(--radius-sm);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 0.72rem;
  color: rgba(var(--ink-rgb), 0.5);
}

.type-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.type-pill {
  padding: 3px 9px;
  border: 1.5px solid rgba(var(--ink-rgb), 0.15);
  border-radius: 20px;
  background: transparent;
  font-size: 0.72rem;
  cursor: pointer;
  color: rgba(var(--ink-rgb), 0.6);
  transition: all 0.12s;
}

.type-pill.active {
  border-color: var(--sakura);
  background: var(--sakura);
  color: white;
}

.item-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.count-input {
  width: 60px;
  padding: 6px 8px;
  border: 1.5px solid rgba(var(--ink-rgb), 0.15);
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-family: var(--font-mono);
  color: var(--ink);
  background: var(--surface);
  text-align: center;
  outline: none;
}

.count-input:focus {
  border-color: var(--sakura);
}

.desc-input {
  flex: 1;
  padding: 6px 10px;
  border: 1.5px solid rgba(var(--ink-rgb), 0.15);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-family: var(--font-sans);
  color: var(--ink);
  background: var(--surface);
  outline: none;
}

.desc-input:focus {
  border-color: var(--sakura);
}

.remove-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: rgba(var(--ink-rgb), 0.35);
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 4px;
}

.remove-btn:hover {
  color: var(--sakura);
}
</style>
