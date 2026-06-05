<template>
  <nav class="bottom-nav">
    <router-link
      v-for="item in navItems"
      :key="item.name"
      :to="item.path"
      class="nav-item"
      :class="{ active: currentRoute === item.name }"
    >
      <span class="nav-icon" v-html="icons[item.name]"></span>
      <span class="nav-label">{{ t(item.label) }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()

const currentRoute = computed(() => route.name as string)

const navItems = [
  { name: 'today', path: '/today', label: 'nav.today' },
  { name: 'calendar', path: '/calendar', label: 'nav.calendar' },
  { name: 'stats', path: '/stats', label: 'nav.stats' },
  { name: 'plans', path: '/plans', label: 'nav.plans' },
  { name: 'settings', path: '/settings', label: 'nav.settings' }
]

const icons: Record<string, string> = {
  // 今日：四角星 sparkle
  today: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c.4 4.5 3.5 7.6 8 8-4.5.4-7.6 3.5-8 8-.4-4.5-3.5-7.6-8-8 4.5-.4 7.6-3.5 8-8z"/></svg>`,
  // 日历：分栏方块
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><line x1="12" y1="4.5" x2="12" y2="19.5"/></svg>`,
  // 统计：波浪线
  stats: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M8 3c-3 3-3 6 0 9s3 6 0 9"/></svg>`,
  // 计划：三横线
  plans: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><line x1="5" y1="7" x2="19" y2="7"/><line x1="5" y1="12" x2="19" y2="12"/><line x1="5" y1="17" x2="19" y2="17"/></svg>`,
  // 设置：圆中点
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/></svg>`
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: var(--paper, #f4f0e8);
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid rgba(var(--ink-rgb), 0.1);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: rgba(var(--ink-rgb), 0.6);
  transition: color 0.2s;
  padding: 8px 12px;
  min-width: 64px;
}

.nav-item:hover {
  color: var(--sakura, #c0544a);
}

.nav-item.active {
  color: var(--sakura, #c0544a);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 26px;
}

.nav-icon :deep(svg) {
  width: 24px;
  height: 24px;
}

.nav-label {
  font-size: 12px;
  font-weight: 500;
}
</style>
