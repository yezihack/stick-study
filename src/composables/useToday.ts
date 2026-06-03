import { ref, computed } from 'vue'
import { db } from '@/db'
import type { DailyLog, TaskLog, Plan, TaskTemplate } from '@/db/models'

// Format today as "YYYY-MM-DD"
function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function useToday() {
  const dailyLog = ref<DailyLog | null>(null)
  const activePlans = ref<Plan[]>([])
  const templates = ref<TaskTemplate[]>([])
  const loading = ref(true)

  // ── Derived ─────────────────────────────────────────────
  const tasks = computed(() => dailyLog.value?.tasks ?? [])

  const totalCount = computed(() => tasks.value.length)
  const doneCount = computed(() => tasks.value.filter(t => t.completed).length)
  const progressPct = computed(() =>
    totalCount.value === 0 ? 0 : Math.round((doneCount.value / totalCount.value) * 100)
  )
  const isAllDone = computed(
    () => totalCount.value > 0 && doneCount.value === totalCount.value
  )

  // ── Streak ───────────────────────────────────────────────
  const streak = ref(0)

  async function calcStreak(): Promise<number> {
    const today = todayStr()
    let count = 0
    let cursor = new Date(today)

    // Walk backwards day by day
    for (let i = 0; i < 365; i++) {
      const dateStr = cursor.toISOString().slice(0, 10)
      // Skip today itself — it may not be completed yet
      if (dateStr !== today) {
        const log = await db.dailyLogs
          .where('date')
          .equals(dateStr)
          .and(l => l.completedAt !== null)
          .first()
        if (!log) break
      }
      // Only count today if already completed
      if (dateStr === today) {
        const todayLog = await db.dailyLogs
          .where('date')
          .equals(today)
          .and(l => l.completedAt !== null)
          .first()
        if (todayLog) count++
      } else {
        count++
      }
      cursor.setDate(cursor.getDate() - 1)
    }
    return count
  }

  // ── Generate tasks from templates ────────────────────────
  function buildTasksFromTemplates(plans: Plan[], tpls: TaskTemplate[]): TaskLog[] {
    const today = new Date()
    const weekday = today.getDay() // 0=Sun … 6=Sat
    const logs: TaskLog[] = []

    for (const plan of plans) {
      // Find matching template for today's weekday
      const matching = tpls
        .filter(t => t.planId === plan.id)
        .find(t => t.weekdays.length === 0 || t.weekdays.includes(weekday))

      if (!matching) continue

      for (const item of matching.items) {
        logs.push({
          taskItemId: item.id,
          isTemp: false,
          completed: false,
          completedTime: null
        })
      }
    }
    return logs
  }

  // ── Init / load ──────────────────────────────────────────
  async function load() {
    loading.value = true
    const today = todayStr()

    // Load active plans (Dexie stores booleans as-is, filter in JS)
    activePlans.value = await db.plans.filter(p => p.isActive).toArray()

    // Load templates for those plans
    const planIds = activePlans.value.map(p => p.id)
    templates.value =
      planIds.length > 0
        ? await db.taskTemplates.where('planId').anyOf(planIds).toArray()
        : []

    // Find or create today's log
    let log = await db.dailyLogs.where('date').equals(today).first()

    if (!log) {
      const generatedTasks = buildTasksFromTemplates(activePlans.value, templates.value)
      // Use first active plan id, or empty string if none
      const primaryPlanId = activePlans.value[0]?.id ?? ''
      const newLog: DailyLog = {
        id: crypto.randomUUID(),
        date: today,
        planId: primaryPlanId,
        tasks: generatedTasks,
        note: '',
        completedAt: null
      }
      await db.dailyLogs.add(newLog)
      log = newLog
    }

    dailyLog.value = log
    streak.value = await calcStreak()
    loading.value = false
  }

  // ── Toggle task completion ────────────────────────────────
  async function toggleTask(taskItemId: string) {
    if (!dailyLog.value) return

    const tasks = dailyLog.value.tasks.map(t => {
      if (t.taskItemId !== taskItemId) return t
      return {
        ...t,
        completed: !t.completed,
        completedTime: !t.completed ? new Date().toISOString() : null
      }
    })

    const allDone = tasks.every(t => t.completed)
    const completedAt = allDone ? new Date().toISOString() : null

    // Optimistic update
    dailyLog.value = { ...dailyLog.value, tasks, completedAt }

    await db.dailyLogs.update(dailyLog.value.id, { tasks, completedAt })

    if (allDone) streak.value = await calcStreak()
  }

  // ── Add temporary task ────────────────────────────────────
  async function addTempTask(description: string) {
    if (!dailyLog.value || !description.trim()) return

    const tempTask: TaskLog = {
      taskItemId: crypto.randomUUID(),
      isTemp: true,
      tempDescription: description.trim(),
      completed: false,
      completedTime: null
    }

    const tasks = [...dailyLog.value.tasks, tempTask]
    dailyLog.value = { ...dailyLog.value, tasks }
    await db.dailyLogs.update(dailyLog.value.id, { tasks })
  }

  // ── Save note ────────────────────────────────────────────
  async function saveNote(note: string) {
    if (!dailyLog.value) return
    dailyLog.value = { ...dailyLog.value, note }
    await db.dailyLogs.update(dailyLog.value.id, { note })
  }

  // ── Resolve task label ────────────────────────────────────
  function getTaskItem(taskItemId: string) {
    for (const tpl of templates.value) {
      const item = tpl.items.find(i => i.id === taskItemId)
      if (item) return item
    }
    return null
  }

  return {
    // state
    loading,
    dailyLog,
    activePlans,
    // derived
    tasks,
    totalCount,
    doneCount,
    progressPct,
    isAllDone,
    streak,
    // methods
    load,
    toggleTask,
    addTempTask,
    saveNote,
    getTaskItem
  }
}
