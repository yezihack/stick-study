<template>
  <div class="page-plans">
    <header class="plans-header">
      <h1 class="page-title">{{ t('plans.title') }}</h1>
      <button class="new-btn" @click="openCreate">{{ t('plans.newPlan') }}</button>
    </header>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>

    <template v-else>
      <!-- Active plans -->
      <section v-if="activePlans.length > 0" class="plans-section">
        <h2 class="section-label">{{ t('plans.active') }}</h2>
        <div class="plans-list">
          <PlanCard
            v-for="plan in activePlans"
            :key="plan.id"
            :plan="plan"
            :templates="templatesByPlan[plan.id]"
            @edit="openEdit"
            @toggle="toggleActive"
          />
        </div>
      </section>

      <!-- Archived plans -->
      <section v-if="archivedPlans.length > 0" class="plans-section">
        <h2 class="section-label">{{ t('plans.archived') }}</h2>
        <div class="plans-list archived">
          <PlanCard
            v-for="plan in archivedPlans"
            :key="plan.id"
            :plan="plan"
            :templates="templatesByPlan[plan.id]"
            @edit="openEdit"
            @toggle="toggleActive"
          />
        </div>
      </section>

      <!-- Empty state -->
      <div v-if="plans.length === 0" class="empty-state">
        <span class="empty-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5z" />
            <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z" />
          </svg>
        </span>
        <p class="empty-title">{{ t('plans.noPlans') }}</p>
        <p class="empty-sub">{{ t('plans.noPlansSub') }}</p>
        <button class="cta-btn" @click="openCreate">{{ t('plans.newPlan') }}</button>
      </div>
    </template>

    <!-- Plan form modal -->
    <PlanForm
      :show="showForm"
      :editing-plan="editingPlan"
      :editing-templates="editingTemplates"
      @cancel="closeForm"
      @save="handleSave"
    />

    <!-- Archive confirm dialog -->
    <Transition name="fade">
      <div v-if="confirmArchiveId" class="confirm-overlay" @click.self="confirmArchiveId = null">
        <div class="confirm-dialog">
          <p>{{ t('plans.form.archiveConfirm') }}</p>
          <div class="confirm-actions">
            <button class="btn-confirm-yes" @click="doArchive">{{ t('common.confirm') }}</button>
            <button class="btn-confirm-no" @click="confirmArchiveId = null">
              {{ t('common.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, toRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import PlanCard from '@/components/PlanCard.vue'
import PlanForm from '@/components/PlanForm.vue'
import { usePlans } from '@/composables/usePlans'
import { db } from '@/db'
import type { Plan, TaskTemplate } from '@/db/models'

const { t } = useI18n()

const {
  plans,
  activePlans,
  archivedPlans,
  loading,
  load,
  createPlan,
  updatePlan,
  toggleActive: doToggle,
  archivePlan
} = usePlans()

// ── Form state ───────────────────────────────────────────
const showForm = ref(false)
const editingPlan = ref<Plan | null>(null)
const editingTemplates = ref<TaskTemplate[]>([])
const confirmArchiveId = ref<string | null>(null)

// ── Templates per plan (for card sub-task display) ───────
const templatesByPlan = ref<Record<string, TaskTemplate[]>>({})

async function loadTemplates() {
  const all = await db.taskTemplates.toArray()
  const map: Record<string, TaskTemplate[]> = {}
  for (const tpl of all) {
    ;(map[tpl.planId] ??= []).push(tpl)
  }
  templatesByPlan.value = map
}

function openCreate() {
  editingPlan.value = null
  editingTemplates.value = []
  showForm.value = true
}

async function openEdit(plan: Plan) {
  editingPlan.value = plan
  editingTemplates.value = await db.taskTemplates.where('planId').equals(plan.id).toArray()
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

// ── Save handler ────────────────────────────────────────
async function handleSave(
  planData: Omit<Plan, 'id' | 'createdAt'>,
  tplData: Omit<TaskTemplate, 'id' | 'planId'>[]
) {
  if (editingPlan.value) {
    // Update existing plan
    await updatePlan(editingPlan.value.id, planData)
    const planId = editingPlan.value.id

    // Replace templates: delete old ones, insert new ones
    await db.taskTemplates.where('planId').equals(planId).delete()
    for (const tpl of tplData) {
      await db.taskTemplates.add({
        id: crypto.randomUUID(),
        planId,
        // Strip Vue reactive proxies — IndexedDB can't structured-clone them
        weekdays: toRaw(tpl.weekdays).slice(),
        items: toRaw(tpl.items).map(i => ({ ...toRaw(i) }))
      })
    }
  } else {
    // Create new plan
    const planId = await createPlan(planData)
    for (const tpl of tplData) {
      await db.taskTemplates.add({
        id: crypto.randomUUID(),
        planId,
        // Strip Vue reactive proxies — IndexedDB can't structured-clone them
        weekdays: toRaw(tpl.weekdays).slice(),
        items: toRaw(tpl.items).map(i => ({ ...toRaw(i) }))
      })
    }
  }
  await loadTemplates()
  closeForm()
}

// ── Toggle active ────────────────────────────────────────
async function toggleActive(id: string) {
  const plan = plans.value.find(p => p.id === id)
  if (!plan) return
  if (plan.isActive) {
    // Archiving — show confirm
    confirmArchiveId.value = id
  } else {
    // Re-activating — no confirm needed
    await doToggle(id)
  }
}

async function doArchive() {
  if (confirmArchiveId.value) {
    await archivePlan(confirmArchiveId.value)
    confirmArchiveId.value = null
  }
}

onMounted(async () => {
  await load()
  await loadTemplates()
})
</script>

<style scoped>
.page-plans {
  padding: 1.5rem 1rem;
  padding-bottom: calc(var(--nav-height) + 1rem);
  max-width: 480px;
  margin: 0 auto;
}

.plans-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.page-title {
  font-size: 1.4rem;
  color: var(--ink);
  margin: 0;
}

.new-btn {
  padding: 8px 16px;
  background: var(--sakura);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 3rem 0;
  color: rgba(var(--ink-rgb), 0.4);
  font-size: 0.9rem;
}

.plans-section {
  margin-bottom: 1.5rem;
}

.section-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gold);
  margin: 0 0 0.6rem;
}

.plans-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.plans-list.archived {
  opacity: 0.65;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  display: flex;
  justify-content: center;
  margin: 0 0 0.75rem;
  color: rgba(var(--ink-rgb), 0.25);
}
.empty-icon svg {
  width: 56px;
  height: 56px;
}
.empty-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--ink);
  margin: 0 0 0.25rem;
}
.empty-sub {
  font-size: 0.85rem;
  color: rgba(var(--ink-rgb), 0.5);
  margin: 0 0 1.25rem;
}

.cta-btn {
  padding: 10px 24px;
  background: var(--sakura);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
}

/* Archive confirm */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 400;
  padding: 1rem;
}

.confirm-dialog {
  background: var(--surface);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  max-width: 320px;
  width: 100%;
  box-shadow: var(--shadow-md);
}

.confirm-dialog p {
  font-size: 0.9rem;
  color: var(--ink);
  margin: 0 0 1rem;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 8px;
}

.btn-confirm-yes {
  flex: 1;
  padding: 10px;
  background: var(--sakura);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-confirm-no {
  flex: 1;
  padding: 10px;
  background: transparent;
  border: 1.5px solid rgba(var(--ink-rgb), 0.15);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  cursor: pointer;
  color: rgba(var(--ink-rgb), 0.6);
}

/* Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
