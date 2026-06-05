// Local-time date helpers.
//
// NOTE: `new Date().toISOString()` returns the date in UTC, which is wrong for
// "today" in non-UTC timezones (e.g. in UTC+8 it stays on yesterday until 08:00
// local). All day-boundary logic must use these local-time helpers so a day
// runs 00:00–24:00 in the user's local time.

/** Local date formatted as "YYYY-MM-DD". */
export function todayStr(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Add `n` days to a "YYYY-MM-DD" string, returning a "YYYY-MM-DD" (local). */
export function offsetDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return todayStr(new Date(y, m - 1, d + n))
}
