import { LocalNotifications } from '@capacitor/local-notifications'
import type { AppConfig } from '@/db/models'

// ── Request permission ──────────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const result = await LocalNotifications.requestPermissions()
    return result.display === 'granted'
  } catch (err) {
    console.error('Failed to request notification permission:', err)
    return false
  }
}

// ── Check permission status ─────────────────────────────────
export async function checkNotificationPermission(): Promise<boolean> {
  try {
    const result = await LocalNotifications.checkPermissions()
    return result.display === 'granted'
  } catch (err) {
    console.error('Failed to check notification permission:', err)
    return false
  }
}

// ── Schedule daily reminder ─────────────────────────────────
export async function scheduleDailyReminder(config: AppConfig, message: string): Promise<void> {
  if (!config.reminderEnabled || !config.reminderTime) return

  try {
    // Cancel any existing reminder first
    await cancelDailyReminder()

    const hasPermission = await checkNotificationPermission()
    if (!hasPermission) {
      const granted = await requestNotificationPermission()
      if (!granted) {
        console.warn('Notification permission denied')
        return
      }
    }

    // Parse reminder time (HH:mm)
    const [hours, minutes] = config.reminderTime.split(':').map(Number)

    // Calculate next reminder time
    const now = new Date()
    const scheduledTime = new Date()
    scheduledTime.setHours(hours, minutes, 0, 0)

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1,
          title: '学習打卡',
          body: message,
          schedule: {
            at: scheduledTime,
            allowWhileIdle: true,
            repeats: true,
            every: 'day'
          },
          sound: undefined,
          smallIcon: 'ic_stat_icon_config_sample'
        }
      ]
    })
  } catch (err) {
    console.error('Failed to schedule reminder:', err)
  }
}

// ── Cancel daily reminder ───────────────────────────────────
export async function cancelDailyReminder(): Promise<void> {
  try {
    const pending = await LocalNotifications.getPending()
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications })
    }
  } catch (err) {
    console.error('Failed to cancel reminder:', err)
  }
}

// ── Get localized reminder message ──────────────────────────
export function getLocalizedReminderMessage(language: string): string {
  const messages: Record<string, string> = {
    'zh-CN': '今日还未打卡，坚持学习吧！',
    en: "Don't forget your daily check-in!",
    ja: '今日の打刻を忘れずに！'
  }
  return messages[language] || messages['zh-CN']
}
