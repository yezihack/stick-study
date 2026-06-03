import { ref } from 'vue'
import { db } from '@/db'
import type { TaskTemplate, TaskItem } from '@/db/models'
import { TaskType } from '@/db/models'

export function useTaskTemplate(planId: string) {
  const templates = ref<TaskTemplate[]>([])

  async function load() {
    templates.value = await db.taskTemplates.where('planId').equals(planId).toArray()
  }

  function newItem(): TaskItem {
    return {
      id: crypto.randomUUID(),
      type: TaskType.QUESTIONS,
      count: 10,
      unit: 'questions',
      description: ''
    }
  }

  async function addTemplate(weekdays: number[] = []): Promise<TaskTemplate> {
    const tpl: TaskTemplate = {
      id: crypto.randomUUID(),
      planId,
      weekdays,
      items: [newItem()]
    }
    await db.taskTemplates.add(tpl)
    templates.value.push(tpl)
    return tpl
  }

  async function updateTemplate(id: string, changes: Partial<TaskTemplate>) {
    await db.taskTemplates.update(id, changes)
    const idx = templates.value.findIndex(t => t.id === id)
    if (idx !== -1) templates.value[idx] = { ...templates.value[idx], ...changes }
  }

  async function deleteTemplate(id: string) {
    await db.taskTemplates.delete(id)
    templates.value = templates.value.filter(t => t.id !== id)
  }

  // Mutate items array of a template (no extra DB call needed — caller calls saveTemplate)
  function addItem(tplId: string): void {
    const tpl = templates.value.find(t => t.id === tplId)
    if (tpl) tpl.items.push(newItem())
  }

  function removeItem(tplId: string, itemId: string): void {
    const tpl = templates.value.find(t => t.id === tplId)
    if (tpl) tpl.items = tpl.items.filter(i => i.id !== itemId)
  }

  async function saveTemplate(id: string) {
    const tpl = templates.value.find(t => t.id === id)
    if (tpl) await db.taskTemplates.update(id, { items: tpl.items, weekdays: tpl.weekdays })
  }

  // Delete all templates for this plan (used when deleting plan)
  async function deleteAll() {
    await db.taskTemplates.where('planId').equals(planId).delete()
    templates.value = []
  }

  return {
    templates,
    load,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    addItem,
    removeItem,
    saveTemplate,
    deleteAll,
    newItem
  }
}
