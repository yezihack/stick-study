/**
 * 计划归档工具
 * 自动检测过期计划并归档，计算完成率
 */

import { db } from '@/db'
import type { Plan } from '@/db/models'

/**
 * 检查并归档所有过期的计划
 * @returns 被归档的计划数量
 */
export async function archiveExpiredPlans(): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = formatDate(today)

  // 查找所有未归档且已过期的计划
  const expiredPlans = await db.plans
    .where('isArchived')
    .equals(0) // Dexie uses 0/1 for boolean in queries
    .and((plan) => {
      return plan.endDate < todayStr
    })
    .toArray()

  let archivedCount = 0

  for (const plan of expiredPlans) {
    await archivePlan(plan.id)
    archivedCount++
  }

  if (archivedCount > 0) {
    console.log(`✅ Archived ${archivedCount} expired plan(s)`)
  }

  return archivedCount
}

/**
 * 归档指定计划并计算完成统计
 * @param planId 计划ID
 */
export async function archivePlan(planId: string): Promise<void> {
  const plan = await db.plans.get(planId)
  if (!plan) {
    console.warn(`⚠️ Plan ${planId} not found`)
    return
  }

  // 如果已归档，跳过
  if (plan.isArchived) {
    return
  }

  // 计算完成率
  const stats = await calculatePlanCompletion(planId, plan.startDate, plan.endDate)

  // 更新计划状态
  await db.plans.update(planId, {
    isActive: false,
    isArchived: true,
    archivedAt: new Date().toISOString(),
    completionRate: stats.completionRate,
    totalTasks: stats.totalTasks,
    completedTasks: stats.completedTasks
  })

  console.log(
    `📦 Archived plan "${plan.name}" - Completion: ${(stats.completionRate * 100).toFixed(1)}% (${stats.completedTasks}/${stats.totalTasks})`
  )
}

/**
 * 计算计划的完成统计
 * @param planId 计划ID
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 完成统计信息
 */
async function calculatePlanCompletion(
  planId: string,
  startDate: string,
  endDate: string
): Promise<{
  totalTasks: number
  completedTasks: number
  completionRate: number
}> {
  // 获取该计划在时间范围内的所有日志
  const dailyLogs = await db.dailyLogs
    .where('planId')
    .equals(planId)
    .and((log) => {
      return log.date >= startDate && log.date <= endDate
    })
    .toArray()

  let totalTasks = 0
  let completedTasks = 0

  // 遍历所有日志，统计任务完成情况
  for (const log of dailyLogs) {
    for (const task of log.tasks) {
      totalTasks++
      if (task.completed) {
        completedTasks++
      }
    }
  }

  // 计算完成率（避免除以零）
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0

  return {
    totalTasks,
    completedTasks,
    completionRate
  }
}

/**
 * 获取所有归档的计划（按归档时间倒序）
 * @returns 归档计划列表
 */
export async function getArchivedPlans(): Promise<Plan[]> {
  return await db.plans
    .where('isArchived')
    .equals(1)
    .reverse()
    .sortBy('archivedAt')
}

/**
 * 获取活跃计划（未归档且未过期）
 * @returns 活跃计划列表
 */
export async function getActivePlans(): Promise<Plan[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = formatDate(today)

  return await db.plans
    .where('isArchived')
    .equals(0)
    .and((plan) => {
      return plan.endDate >= todayStr
    })
    .toArray()
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
