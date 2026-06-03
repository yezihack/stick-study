import { ref, computed } from 'vue'
import { db } from '@/db'
import type { DailyLog } from '@/db/models'
import { TaskType } from '@/db/models'

export type RangeKey = 'week' | 'month' | 'all'

export interface WeekDay {
  label: string   // e.g. "Mon"
  date: string    // "YYYY-MM-DD"
  count: number   // completed tasks
  isToday: boolean
}

export interface TypeStat {
  type: TaskType
  count: number
  pct: number
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function offsetDate(base: Date, days: number): string {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function useStats() {
  const range = ref<RangeKey>('week')
  const allLogs = ref<DailyLog[]>([])
  const loading = ref(true)

  async function load() {
    loading.value = true
    allLogs.value = await db.dailyLogs.toArray()
    loading.value = false
  }

  // ── Filter logs by range ──────────────────────────────────
  const filteredLogs = computed(() => {
    const today = new Date()
    const todayISO = todayStr()

    if (range.value === 'all') return allLogs.value

    if (range.value === 'week') {
      const weekday = today.getDay() // 0=Sun
      const monday = offsetDate(today, -(weekday === 0 ? 6 : weekday - 1))
      const sunday = offsetDate(today, weekday === 0 ? 0 : 7 - weekday)
      return allLogs.value.filter(l => l.date >= monday && l.date <= sunday)
    }

    // month
    const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
    return allLogs.value.filter(l => l.date >= monthStart && l.date <= todayISO)
  })

  // ── Totals ────────────────────────────────────────────────
  const totalTasks = computed(() =>
    filteredLogs.value.reduce((sum, l) => sum + l.tasks.filter(t => t.completed).length, 0)
  )

  const totalDays = computed(() =>
    filteredLogs.value.filter(l => l.tasks.some(t => t.completed)).length
  )

  // ── Current week bar chart data ───────────────────────────
  const weekData = computed((): WeekDay[] => {
    const today = new Date()
    const todayISO = todayStr()
    const weekday = today.getDay() // 0=Sun
    // Start from Monday
    const mondayOffset = weekday === 0 ? -6 : 1 - weekday
    const days: WeekDay[] = []

    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + mondayOffset + i)
      const dateStr = d.toISOString().slice(0, 10)
      const log = allLogs.value.find(l => l.date === dateStr)
      const count = log ? log.tasks.filter(t => t.completed).length : 0
      days.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dateStr,
        count,
        isToday: dateStr === todayISO
      })
    }
    return days
  })

  // ── Task type distribution ────────────────────────────────
  const typeStats = computed((): TypeStat[] => {
    const counts: Record<string, number> = {}

    for (const log of filteredLogs.value) {
      for (const task of log.tasks) {
        if (!task.completed || task.isTemp) continue
        // Look up item type from templates is expensive; use stored taskItemId prefix not available.
        // We'll count by looking up templates separately — but to keep composable self-contained,
        // we rely on all DailyLogs carrying taskItemId that we match against templates.
        // For now aggregate as 'custom' for temp; real types need template lookup done in load().
        counts['custom'] = (counts['custom'] ?? 0) + 1
      }
    }

    const total = Object.values(counts).reduce((s, v) => s + v, 0)
    return Object.entries(counts).map(([type, count]) => ({
      type: type as TaskType,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0
    }))
  })

  // ── Type stats with real types (richer version) ───────────
  const richTypeStats = ref<TypeStat[]>([])

  async function buildTypeStats() {
    const templates = await db.taskTemplates.toArray()
    // Build taskItemId → type map
    const itemTypeMap = new Map<string, TaskType>()
    for (const tpl of templates) {
      for (const item of tpl.items) {
        itemTypeMap.set(item.id, item.type)
      }
    }

    const logs = range.value === 'all'
      ? allLogs.value
      : filteredLogs.value

    const counts: Partial<Record<TaskType, number>> = {}
    for (const log of logs) {
      for (const task of log.tasks) {
        if (!task.completed) continue
        const type = task.isTemp
          ? TaskType.CUSTOM
          : (itemTypeMap.get(task.taskItemId) ?? TaskType.CUSTOM)
        counts[type] = (counts[type] ?? 0) + 1
      }
    }

    const total = Object.values(counts).reduce((s, v) => s + (v ?? 0), 0)
    richTypeStats.value = (Object.entries(counts) as [TaskType, number][]).map(
      ([type, count]) => ({
        type,
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0
      })
    ).sort((a, b) => b.count - a.count)
  }

  async function setRange(r: RangeKey) {
    range.value = r
    await buildTypeStats()
  }

  async function loadAll() {
    await load()
    await buildTypeStats()
  }

  return {
    range,
    loading,
    totalTasks,
    totalDays,
    weekData,
    typeStats,
    richTypeStats,
    setRange,
    load: loadAll
  }
}
