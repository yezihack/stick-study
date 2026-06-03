<template>
  <nav class="bottom-nav">
    <router-link
      v-for="item in navItems"
      :key="item.name"
      :to="item.path"
      class="nav-item"
      :class="{ active: currentRoute === item.name }"
    >
      <span class="nav-icon">{{ item.icon }}</span>
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
  { name: 'today', path: '/today', icon: '📝', label: 'nav.today' },
  { name: 'calendar', path: '/calendar', icon: '📅', label: 'nav.calendar' },
  { name: 'stats', path: '/stats', icon: '📊', label: 'nav.stats' },
  { name: 'plans', path: '/plans', icon: '📚', label: 'nav.plans' },
  { name: 'settings', path: '/settings', icon: '⚙️', label: 'nav.settings' }
]
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
  border-top: 1px solid rgba(26, 31, 26, 0.1);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: rgba(26, 31, 26, 0.6);
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
  font-size: 24px;
}

.nav-label {
  font-size: 12px;
  font-weight: 500;
}
</style>
