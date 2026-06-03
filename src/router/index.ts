import { createRouter, createWebHistory } from 'vue-router'
import Today from '@/pages/Today.vue'
import Calendar from '@/pages/Calendar.vue'
import Stats from '@/pages/Stats.vue'
import Plans from '@/pages/Plans.vue'
import Settings from '@/pages/Settings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/today'
    },
    {
      path: '/today',
      name: 'today',
      component: Today
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: Calendar
    },
    {
      path: '/stats',
      name: 'stats',
      component: Stats
    },
    {
      path: '/plans',
      name: 'plans',
      component: Plans
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    }
  ]
})

export default router
