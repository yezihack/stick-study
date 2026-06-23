<template>
  <Transition name="sheet">
    <div v-if="show" class="form-overlay" @click.self="$emit('cancel')">
      <div class="form-sheet">
        <div class="form-handle" />

        <div class="form-header">
          <h2 class="form-title">
            {{ editingId ? t('plans.form.titleEdit') : t('plans.form.titleCreate') }}
          </h2>
          <button class="close-btn" @click="$emit('cancel')">✕</button>
        </div>

        <form class="form-body" @submit.prevent="handleSubmit">
          <!-- Plan name -->
          <div class="field">
            <label class="label" for="plan-name">{{ t('plans.form.name') }}</label>
            <input
              id="plan-name"
              v-model="form.name"
              class="input"
              :class="{ error: errors.name }"
              :placeholder="t('plans.form.namePlaceholder')"
            />
            <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
          </div>

          <!-- Book title -->
          <div class="field">
            <label class="label" for="plan-book">{{ t('plans.form.bookTitle') }}</label>
            <input
              id="plan-book"
              v-model="form.bookTitle"
              class="input"
              :placeholder="t('plans.form.bookTitlePlaceholder')"
            />
          </div>

          <!-- Date / Duration -->
          <div class="field">
            <div class="date-mode-toggle">
              <button
                type="button"
                class="mode-btn"
                :class="{ active: dateMode === 'calendar' }"
                @click="dateMode = 'calendar'"
              >
                {{ t('plans.form.dateModeCalendar') }}
              </button>
              <button
                type="button"
                class="mode-btn"
                :class="{ active: dateMode === 'duration' }"
                @click="switchToDuration"
              >
                {{ t('plans.form.dateModeDuration') }}
              </button>
            </div>
          </div>

          <!-- Calendar mode: two date pickers -->
          <template v-if="dateMode === 'calendar'">
            <div class="field-row-2">
              <div class="field">
                <label class="label" for="plan-start">{{ t('plans.form.startDate') }}</label>
                <input
                  id="plan-start"
                  v-model="form.startDate"
                  class="input"
                  type="date"
                  :class="{ error: errors.dates }"
                />
              </div>
              <div class="field">
                <label class="label" for="plan-end">{{ t('plans.form.endDate') }}</label>
                <input
                  id="plan-end"
                  v-model="form.endDate"
                  class="input"
                  type="date"
                  :class="{ error: errors.dates }"
                />
              </div>
            </div>
          </template>

          <!-- Duration mode: start date + slider -->
          <template v-else>
            <div class="field">
              <label class="label" for="plan-start-d">{{ t('plans.form.startDate') }}</label>
              <input
                id="plan-start-d"
                v-model="form.startDate"
                class="input"
                type="date"
                :class="{ error: errors.dates }"
              />
            </div>
            <div class="field">
              <div class="duration-header">
                <label class="label" for="plan-duration">{{ t('plans.form.duration') }}</label>
                <span class="duration-value">{{
                  t('plans.form.durationValue', { days: duration })
                }}</span>
              </div>
              <input
                id="plan-duration"
                v-model.number="duration"
                class="duration-slider"
                type="range"
                min="1"
                max="30"
                step="1"
              />
              <span class="duration-end"
                >{{ t('plans.form.endDate') }}: {{ form.endDate || '—' }}</span
              >
            </div>
          </template>
          <span v-if="errors.dates" class="error-msg">{{ errors.dates }}</span>

          <!-- Color -->
          <div class="field">
            <label class="label">{{ t('plans.form.color') }}</label>
            <div class="color-row">
              <button
                v-for="c in COLORS"
                :key="c"
                type="button"
                class="color-swatch"
                :class="{ active: form.color === c }"
                :style="{ background: c }"
                @click="form.color = c"
              />
            </div>
          </div>

          <!-- Task templates -->
          <div class="field">
            <div class="templates-header">
              <span class="label">{{ t('plans.form.templates') }}</span>
              <button type="button" class="add-tpl-btn" @click="addTemplate">
                {{ t('plans.form.addTemplate') }}
              </button>
            </div>

            <div v-for="tpl in localTemplates" :key="tpl.id" class="template-block">
              <!-- Weekday selector -->
              <div class="weekday-row">
                <span class="wd-hint">{{ t('plans.template.weekdays') }}:</span>
                <div class="wd-pills">
                  <button
                    v-for="(wd, idx) in weekdayLabels"
                    :key="idx"
                    type="button"
                    class="wd-pill"
                    :class="{ active: tpl.weekdays.length === 0 || tpl.weekdays.includes(idx) }"
                    @click="toggleWeekday(tpl, idx)"
                  >
                    {{ wd }}
                  </button>
                </div>
                <button type="button" class="remove-tpl-btn" @click="removeTemplate(tpl.id)">
                  ✕
                </button>
              </div>

              <!-- Task items -->
              <div class="items-list">
                <TaskItemEditor
                  v-for="item in tpl.items"
                  :key="item.id"
                  :item="item"
                  @update="updateItem(tpl, $event)"
                  @remove="removeItem(tpl, item.id)"
                />
                <button type="button" class="add-item-btn" @click="addItem(tpl)">
                  {{ t('plans.template.addItem') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="submit" class="btn-save">{{ t('plans.form.save') }}</button>
            <button type="button" class="btn-cancel" @click="$emit('cancel')">
              {{ t('plans.form.cancel') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import TaskItemEditor from '@/components/TaskItemEditor.vue'
import type { Plan, TaskTemplate, TaskItem } from '@/db/models'
import { TaskType } from '@/db/models'

const props = defineProps<{
  show: boolean
  editingPlan: Plan | null
  editingTemplates: TaskTemplate[]
}>()

const emit = defineEmits<{
  cancel: []
  save: [plan: Omit<Plan, 'id' | 'createdAt'>, templates: Omit<TaskTemplate, 'id' | 'planId'>[]]
}>()

const { t } = useI18n()

const COLORS = ['#c0544a', '#b8962a', '#4a6741', '#5a7fa0', '#8a5a9a', '#1a1f1a']

const weekdayLabels = computed(() => {
  const raw = t('calendar.weekdays')
  return Array.isArray(raw) ? raw : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
})

const editingId = computed(() => props.editingPlan?.id ?? null)

// ── Local form state ──────────────────────────────────────
const form = ref({
  name: '',
  bookTitle: '',
  startDate: '',
  endDate: '',
  color: COLORS[0],
  isActive: true,
  isArchived: false
})

type TemplateLocal = Omit<TaskTemplate, 'planId'>

const localTemplates = ref<TemplateLocal[]>([])
const errors = ref<{ name?: string; dates?: string }>({})

// ── Date mode (calendar pickers vs duration slider) ───────
const dateMode = ref<'calendar' | 'duration'>('calendar')
const duration = ref(7) // days, 1–30

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function switchToDuration() {
  dateMode.value = 'duration'
  if (!form.value.startDate) {
    form.value.startDate = new Date().toISOString().slice(0, 10)
  }
  // derive a sensible duration from existing dates if both present
  if (form.value.startDate && form.value.endDate) {
    const diff =
      Math.round(
        (new Date(form.value.endDate).getTime() - new Date(form.value.startDate).getTime()) /
          86400000
      ) + 1
    duration.value = Math.min(30, Math.max(1, diff))
  }
}

// In duration mode, keep endDate = startDate + (duration - 1) days
watch([duration, () => form.value.startDate], () => {
  if (dateMode.value !== 'duration' || !form.value.startDate) return
  form.value.endDate = addDays(form.value.startDate, duration.value - 1)
})

// ── Sync with editing plan ────────────────────────────────
watch(
  () => props.show,
  val => {
    if (!val) return
    errors.value = {}
    dateMode.value = 'calendar'
    duration.value = 7

    if (props.editingPlan) {
      const p = props.editingPlan
      form.value = {
        name: p.name,
        bookTitle: p.bookTitle,
        startDate: p.startDate,
        endDate: p.endDate,
        color: p.color,
        isActive: p.isActive,
        isArchived: p.isArchived || false
      }
      localTemplates.value = props.editingTemplates.map(t => ({
        id: t.id,
        weekdays: [...t.weekdays],
        items: t.items.map(i => ({ ...i }))
      }))
    } else {
      // Adding a new plan: default to duration mode with today as start date
      const today = new Date().toISOString().slice(0, 10)
      form.value = {
        name: '',
        bookTitle: '',
        startDate: today,
        endDate: addDays(today, duration.value - 1),
        color: COLORS[0],
        isActive: true,
        isArchived: false
      }
      localTemplates.value = [freshTemplate()]
      dateMode.value = 'duration'
    }
  }
)

function freshTemplate(): TemplateLocal {
  return {
    id: crypto.randomUUID(),
    weekdays: [],
    items: [
      {
        id: crypto.randomUUID(),
        type: TaskType.QUESTIONS,
        count: 10,
        unit: 'questions',
        description: ''
      }
    ]
  }
}

// ── Template mutations ────────────────────────────────────
function addTemplate() {
  localTemplates.value.push(freshTemplate())
}

function removeTemplate(id: string) {
  localTemplates.value = localTemplates.value.filter(t => t.id !== id)
}

function toggleWeekday(tpl: TemplateLocal, wd: number) {
  if (tpl.weekdays.length === 0) {
    // "every day" → restrict to all except this one
    tpl.weekdays = [0, 1, 2, 3, 4, 5, 6].filter(d => d !== wd)
  } else if (tpl.weekdays.includes(wd)) {
    tpl.weekdays = tpl.weekdays.filter(d => d !== wd)
    if (tpl.weekdays.length === 7) tpl.weekdays = [] // back to every day
  } else {
    tpl.weekdays.push(wd)
    tpl.weekdays.sort()
    if (tpl.weekdays.length === 7) tpl.weekdays = []
  }
}

function addItem(tpl: TemplateLocal) {
  tpl.items.push({
    id: crypto.randomUUID(),
    type: TaskType.QUESTIONS,
    count: 10,
    unit: 'questions',
    description: ''
  })
}

function removeItem(tpl: TemplateLocal, itemId: string) {
  if (tpl.items.length <= 1) return // keep at least one
  tpl.items = tpl.items.filter(i => i.id !== itemId)
}

function updateItem(tpl: TemplateLocal, updated: TaskItem) {
  const idx = tpl.items.findIndex(i => i.id === updated.id)
  if (idx !== -1) tpl.items[idx] = updated
}

// ── Validation + submit ───────────────────────────────────
function validate(): boolean {
  errors.value = {}
  if (!form.value.name.trim()) {
    errors.value.name = t('plans.form.errors.nameRequired')
    return false
  }
  if (!form.value.startDate || !form.value.endDate) {
    errors.value.dates = t('plans.form.errors.dateRequired')
    return false
  }
  if (form.value.startDate > form.value.endDate) {
    errors.value.dates = t('plans.form.errors.dateOrder')
    return false
  }
  return true
}

function handleSubmit() {
  if (!validate()) return
  emit(
    'save',
    { ...form.value },
    localTemplates.value.map(t => ({ weekdays: t.weekdays, items: t.items }))
  )
}
</script>

<style scoped>
.form-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  z-index: 300;
}

.form-sheet {
  width: 100%;
  max-height: 92vh;
  background: var(--paper);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  overflow-y: auto;
  padding: 0 1rem 2rem;
}

.form-handle {
  width: 40px;
  height: 4px;
  background: rgba(var(--ink-rgb), 0.15);
  border-radius: 2px;
  margin: 10px auto 4px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0 1rem;
}

.form-title {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  color: var(--ink);
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1rem;
  color: rgba(var(--ink-rgb), 0.4);
  cursor: pointer;
  padding: 4px 8px;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(var(--ink-rgb), 0.55);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input {
  padding: 10px 12px;
  border: 1.5px solid rgba(var(--ink-rgb), 0.15);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-family: var(--font-sans);
  color: var(--ink);
  background: var(--surface);
  outline: none;
  width: 100%;
}

.input:focus {
  border-color: var(--sakura);
}
.input.error {
  border-color: var(--sakura);
}

/* Date mode toggle */
.date-mode-toggle {
  display: flex;
  gap: 4px;
  background: rgba(var(--ink-rgb), 0.05);
  border-radius: var(--radius-sm);
  padding: 3px;
}

.mode-btn {
  flex: 1;
  padding: 7px 0;
  border: none;
  background: transparent;
  border-radius: calc(var(--radius-sm) - 3px);
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(var(--ink-rgb), 0.55);
  cursor: pointer;
  transition: all 0.15s;
}

.mode-btn.active {
  background: var(--surface);
  color: var(--sakura);
  box-shadow: var(--shadow-sm);
}

/* Duration slider */
.duration-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.duration-value {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--sakura);
}

.duration-slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(var(--ink-rgb), 0.12);
  border-radius: 3px;
  outline: none;
  margin: 8px 0 6px;
}

.duration-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--sakura);
  border: 3px solid white;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}

.duration-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--sakura);
  border: 3px solid white;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}

.duration-end {
  font-size: 0.75rem;
  color: rgba(var(--ink-rgb), 0.5);
  font-family: var(--font-mono);
}

.error-msg {
  font-size: 0.75rem;
  color: var(--sakura);
}

/* Color swatches */
.color-row {
  display: flex;
  gap: 8px;
}

.color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2.5px solid transparent;
  cursor: pointer;
  transition: transform 0.15s;
}

.color-swatch.active {
  border-color: var(--ink);
  transform: scale(1.2);
}

/* Templates */
.templates-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.add-tpl-btn {
  font-size: 0.78rem;
  padding: 4px 10px;
  background: transparent;
  border: 1.5px solid rgba(var(--ink-rgb), 0.2);
  border-radius: 20px;
  cursor: pointer;
  color: rgba(var(--ink-rgb), 0.6);
}

.template-block {
  background: var(--surface);
  border-radius: var(--radius-sm);
  padding: 10px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: var(--shadow-sm);
}

.weekday-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.wd-hint {
  font-size: 0.72rem;
  color: rgba(var(--ink-rgb), 0.5);
  white-space: nowrap;
}

.wd-pills {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  flex: 1;
}

.wd-pill {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid rgba(var(--ink-rgb), 0.15);
  background: transparent;
  font-size: 0.7rem;
  cursor: pointer;
  color: rgba(var(--ink-rgb), 0.5);
  transition: all 0.12s;
}

.wd-pill.active {
  border-color: var(--sakura);
  background: var(--sakura);
  color: white;
}

.remove-tpl-btn {
  background: transparent;
  border: none;
  font-size: 0.85rem;
  color: rgba(var(--ink-rgb), 0.3);
  cursor: pointer;
  padding: 4px;
}

.remove-tpl-btn:hover {
  color: var(--sakura);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.add-item-btn {
  width: 100%;
  padding: 7px;
  border: 1.5px dashed rgba(var(--ink-rgb), 0.18);
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 0.82rem;
  color: rgba(var(--ink-rgb), 0.45);
  cursor: pointer;
  margin-top: 2px;
}

.add-item-btn:hover {
  border-color: var(--sakura);
  color: var(--sakura);
}

/* Actions */
.form-actions {
  display: flex;
  gap: 8px;
  padding-top: 4px;
}

.btn-save {
  flex: 2;
  padding: 12px;
  background: var(--sakura);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  background: transparent;
  color: rgba(var(--ink-rgb), 0.55);
  border: 1.5px solid rgba(var(--ink-rgb), 0.15);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  cursor: pointer;
}

/* Sheet animation */
.sheet-enter-active {
  transition:
    transform 0.3s cubic-bezier(0.34, 1.2, 0.64, 1),
    opacity 0.2s;
}
.sheet-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s;
}
.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
