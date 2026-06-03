import { ref, computed } from 'vue'
import { db } from '@/db'
import type { DailyLog } from '@/db/models'

export type DayStatus = 'done' | 'partial' | 'none' | 'future'

export interface CalendarDay {
  date: string       // "YYYY-MM-DD", empty string = padding cell
  day: number        // 0 = padding
  status: DayStatus
  isToday: boolean
  isCurrentMonth: boolean
}

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function logStatus(log: DailyLog | undefined): DayStatus {
  if (!log || log.tasks.length === 0) return 'none'
  if (log.completedAt) return 'done'
  const done = log.tasks.filter(t => t.completed).length
  return done > 0 ? 'partial' : 'none'
}

export function useCalendar() {
  const today = todayStr()
  const now = new Date()

  const viewYear = ref(now.getFullYear())
  const viewMonth = ref(now.getMonth()) // 0-indexed

  // All DailyLogs for the visible month (loaded on demand)
  const monthLogs = ref<Map<string, DailyLog>>(new Map())

  // Selected day detail
  const selectedDate = ref<string | null>(null)
  const selectedLog = ref<DailyLog | null>(null)

  // ── Month navigation ─────────────────────────────────────
  function prevMonth() {
    if (viewMonth.value === 0) { viewYear.value--; viewMonth.value = 11 }
    else viewMonth.value--
    loadMonth()
  }

  function nextMonth() {
    if (viewMonth.value === 11) { viewYear.value++; viewMonth.value = 0 }
    else viewMonth.value++
    loadMonth()
  }

  // ── Load logs for current view month ─────────────────────
  async function loadMonth() {
    const y = viewYear.value
    const m = viewMonth.value
    const from = toDateStr(y, m, 1)
    // last day of month
    const lastDay = new Date(y, m + 1, 0).getDate()
    const to = toDateStr(y, m, lastDay)

    const logs = await db.dailyLogs
      .where('date')
      .between(from, to, true, true)
      .toArray()

    const map = new Map<string, DailyLog>()
    for (const l of logs) map.set(l.date, l)
    monthLogs.value = map
  }

  // ── Calendar grid (7 cols × 6 rows) ──────────────────────
  const calendarDays = computed((): CalendarDay[] => {
    const y = viewYear.value
    const m = viewMonth.value
    const firstWeekday = new Date(y, m, 1).getDay() // 0=Sun
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const cells: CalendarDay[] = []

    // Leading padding
    for (let i = 0; i < firstWeekday; i++) {
      cells.push({ date: '', day: 0, status: 'future', isToday: false, isCurrentMonth: false })
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = toDateStr(y, m, d)
      const isFuture = dateStr > today
      const log = monthLogs.value.get(dateStr)
      cells.push({
        date: dateStr,
        day: d,
        status: isFuture ? 'future' : logStatus(log),
        isToday: dateStr === today,
        isCurrentMonth: true
      })
    }

    // Trailing padding to fill 42 cells
    while (cells.length < 42) {
      cells.push({ date: '', day: 0, status: 'future', isToday: false, isCurrentMonth: false })
    }

    return cells
  })

  // ── Month label ───────────────────────────────────────────
  const monthLabel = computed(() => {
    return { year: viewYear.value, month: viewMonth.value + 1 }
  })

  // ── Monthly stats ─────────────────────────────────────────
  const monthStats = computed(() => {
    let done = 0
    let partial = 0
    const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = toDateStr(viewYear.value, viewMonth.value, d)
      if (dateStr > today) break
      const log = monthLogs.value.get(dateStr)
      const s = logStatus(log)
      if (s === 'done') done++
      else if (s === 'partial') partial++
    }

    const pastDays = calendarDays.value.filter(
      c => c.isCurrentMonth && c.date <= today && c.date !== ''
    ).length

    return {
      done,
      partial,
      rate: pastDays > 0 ? Math.round((done / pastDays) * 100) : 0
    }
  })

  // ── Streak (cross-month, looks at all logs) ──────────────
  const streak = ref(0)

  async function calcStreak() {
    let count = 0
    const cursor = new Date(today)

    for (let i = 0; i < 365; i++) {
      const dateStr = cursor.toISOString().slice(0, 10)
      const log = await db.dailyLogs
        .where('date').equals(dateStr)
        .first()

      if (!log || !log.completedAt) {
        // Today without completedAt still counts ongoing streak
        if (dateStr === today) { cursor.setDate(cursor.getDate() - 1); continue }
        break
      }
      count++
      cursor.setDate(cursor.getDate() - 1)
    }
    streak.value = count
  }

  // ── Recent history (last 10 completed days) ───────────────
  const recentLogs = ref<DailyLog[]>([])

  async function loadRecent() {
    const all = await db.dailyLogs
      .where('completedAt')
      .notEqual('')
      .reverse()
      .limit(10)
      .toArray()
    // filter out nulls (Dexie returns null-indexed too)
    recentLogs.value = all.filter(l => l.completedAt !== null)
  }

  // ── Day detail ────────────────────────────────────────────
  async function selectDay(date: string) {
    if (!date) return
    selectedDate.value = date
    selectedLog.value = await db.dailyLogs.where('date').equals(date).first() ?? null
  }

  function closeDetail() {
    selectedDate.value = null
    selectedLog.value = null
  }

  // ── Init ─────────────────────────────────────────────────
  async function load() {
    await Promise.all([loadMonth(), calcStreak(), loadRecent()])
  }

  return {
    viewYear,
    viewMonth,
    monthLabel,
    calendarDays,
    monthStats,
    streak,
    recentLogs,
    selectedDate,
    selectedLog,
    load,
    prevMonth,
    nextMonth,
    selectDay,
    closeDetail
  }
}
