/**
 * 归档计划管理 Composable
 */

import { ref, onMounted } from 'vue'
import type { Plan } from '@/db/models'
import { getArchivedPlans, archivePlan, archiveExpiredPlans } from '@/utils/archivePlans'

export function useArchive() {
  const archivedPlans = ref<Plan[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 加载归档计划列表
   */
  async function loadArchivedPlans() {
    loading.value = true
    error.value = null

    try {
      archivedPlans.value = await getArchivedPlans()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载归档计划失败'
      console.error('Failed to load archived plans:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * 手动归档指定计划
   */
  async function archivePlanById(planId: string) {
    loading.value = true
    error.value = null

    try {
      await archivePlan(planId)
      await loadArchivedPlans() // 重新加载列表
    } catch (e) {
      error.value = e instanceof Error ? e.message : '归档计划失败'
      console.error('Failed to archive plan:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * 检查并归档所有过期计划
   */
  async function checkAndArchiveExpired() {
    loading.value = true
    error.value = null

    try {
      const count = await archiveExpiredPlans()
      if (count > 0) {
        await loadArchivedPlans() // 重新加载列表
      }
      return count
    } catch (e) {
      error.value = e instanceof Error ? e.message : '归档过期计划失败'
      console.error('Failed to archive expired plans:', e)
      return 0
    } finally {
      loading.value = false
    }
  }

  /**
   * 格式化完成率为百分比字符串
   */
  function formatCompletionRate(rate?: number): string {
    if (rate === undefined) return '0.0%'
    return `${(rate * 100).toFixed(1)}%`
  }

  /**
   * 获取计划的完成统计文本
   */
  function getCompletionStats(plan: Plan): string {
    if (!plan.totalTasks || !plan.completedTasks) {
      return '无数据'
    }
    return `${plan.completedTasks} / ${plan.totalTasks}`
  }

  // 组件挂载时自动加载
  onMounted(() => {
    loadArchivedPlans()
  })

  return {
    archivedPlans,
    loading,
    error,
    loadArchivedPlans,
    archivePlanById,
    checkAndArchiveExpired,
    formatCompletionRate,
    getCompletionStats
  }
}
