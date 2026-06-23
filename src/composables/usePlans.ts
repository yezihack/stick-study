import { ref, computed } from 'vue'
import { db } from '@/db'
import type { Plan } from '@/db/models'
import { todayStr } from '@/utils/date'

function daysLeft(endDate: string): number {
  const today = new Date(todayStr())
  const end = new Date(endDate)
  const diff = Math.ceil((end.getTime() - today.getTime()) / 86400000)
  return diff
}

export function usePlans() {
  const plans = ref<Plan[]>([])
  const loading = ref(false)

  const activePlans = computed(() => plans.value.filter(p => p.isActive && !p.isArchived))
  const archivedPlans = computed(() => plans.value.filter(p => p.isArchived))

  async function load() {
    loading.value = true
    const all = await db.plans.toArray()
    // createdAt is not an indexed key, so sort in JS (descending = newest first)
    plans.value = all.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    loading.value = false
  }

  async function createPlan(data: Omit<Plan, 'id' | 'createdAt' | 'isArchived'>): Promise<string> {
    const plan: Plan = {
      ...data,
      id: crypto.randomUUID(),
      isArchived: false,
      createdAt: new Date().toISOString()
    }
    await db.plans.add(plan)
    plans.value.unshift(plan)
    return plan.id
  }

  async function updatePlan(id: string, changes: Partial<Omit<Plan, 'id' | 'createdAt'>>) {
    await db.plans.update(id, changes)
    const idx = plans.value.findIndex(p => p.id === id)
    if (idx !== -1) plans.value[idx] = { ...plans.value[idx], ...changes }
  }

  async function archivePlan(id: string) {
    await updatePlan(id, {
      isActive: false,
      isArchived: true,
      archivedAt: new Date().toISOString()
    })
  }

  async function deletePlan(id: string) {
    await db.plans.delete(id)
    await db.taskTemplates.where('planId').equals(id).delete()
    plans.value = plans.value.filter(p => p.id !== id)
  }

  async function toggleActive(id: string) {
    const plan = plans.value.find(p => p.id === id)
    if (!plan) return

    if (plan.isActive) {
      // 归档：禁用 + 标记为已归档
      await updatePlan(id, {
        isActive: false,
        isArchived: true,
        archivedAt: new Date().toISOString()
      })
    } else {
      // 重新激活：启用 + 清除归档状态
      await updatePlan(id, {
        isActive: true,
        isArchived: false,
        archivedAt: undefined,
        completionRate: undefined,
        totalTasks: undefined,
        completedTasks: undefined
      })
    }
  }

  function getPlanProgress(plan: Plan): { daysLeft: number; pct: number } {
    const start = new Date(plan.startDate).getTime()
    const end = new Date(plan.endDate).getTime()
    const now = new Date(todayStr()).getTime()
    const total = end - start
    const elapsed = Math.max(0, now - start)
    const pct = total <= 0 ? 100 : Math.min(100, Math.round((elapsed / total) * 100))
    return { daysLeft: daysLeft(plan.endDate), pct }
  }

  return {
    plans,
    activePlans,
    archivedPlans,
    loading,
    load,
    createPlan,
    updatePlan,
    archivePlan,
    deletePlan,
    toggleActive,
    getPlanProgress
  }
}
