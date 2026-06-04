import { db, initializeDatabase } from '@/db'

export interface ExportPayload {
  exportedAt: string
  version: string
  data: {
    plans: unknown[]
    taskTemplates: unknown[]
    dailyLogs: unknown[]
    config: unknown
  }
}

// ── Export ──────────────────────────────────────────────────
export async function exportData(): Promise<void> {
  const [plans, taskTemplates, dailyLogs, configRows] = await Promise.all([
    db.plans.toArray(),
    db.taskTemplates.toArray(),
    db.dailyLogs.toArray(),
    db.config.toArray()
  ])

  const payload: ExportPayload = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    data: {
      plans,
      taskTemplates,
      dailyLogs,
      config: configRows[0] ?? null
    }
  }

  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const ts = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `study-checkin-backup-${ts}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Import ──────────────────────────────────────────────────
export function importData(): Promise<void> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) { resolve(); return }

      try {
        const text = await file.text()
        const payload = JSON.parse(text) as ExportPayload

        // Basic validation
        if (!payload.data || !Array.isArray(payload.data.plans)) {
          throw new Error('Invalid backup file format')
        }

        // Overwrite strategy: clear then insert
        await db.transaction('rw', [db.plans, db.taskTemplates, db.dailyLogs, db.config], async () => {
          await db.plans.clear()
          await db.taskTemplates.clear()
          await db.dailyLogs.clear()
          await db.config.clear()

          if (payload.data.plans.length) await db.plans.bulkAdd(payload.data.plans as never)
          if (payload.data.taskTemplates.length) await db.taskTemplates.bulkAdd(payload.data.taskTemplates as never)
          if (payload.data.dailyLogs.length) await db.dailyLogs.bulkAdd(payload.data.dailyLogs as never)
          if (payload.data.config) await db.config.add(payload.data.config as never)
        })

        resolve()
      } catch (err) {
        reject(err)
      }
    }

    input.click()
  })
}

// ── Clear all data ──────────────────────────────────────────
export async function clearAllData(): Promise<void> {
  await db.transaction('rw', [db.plans, db.taskTemplates, db.dailyLogs, db.config], async () => {
    await db.plans.clear()
    await db.taskTemplates.clear()
    await db.dailyLogs.clear()
    await db.config.clear()
  })
  // Re-seed default config
  await initializeDatabase()
}

// ── Storage size estimate ───────────────────────────────────
export async function estimateStorageSize(): Promise<string> {
  // Use navigator.storage.estimate() if available
  if (navigator.storage?.estimate) {
    try {
      const est = await navigator.storage.estimate()
      const used = est.usage ?? 0
      if (used > 1024 * 1024) return `${(used / 1024 / 1024).toFixed(1)} MB`
      return `${Math.round(used / 1024)} KB`
    } catch {
      // fall through to manual estimate
    }
  }

  // Fallback: rough JSON byte count
  const [plans, templates, logs] = await Promise.all([
    db.plans.toArray(),
    db.taskTemplates.toArray(),
    db.dailyLogs.toArray()
  ])
  const bytes = new TextEncoder().encode(JSON.stringify({ plans, templates, logs })).length
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}
