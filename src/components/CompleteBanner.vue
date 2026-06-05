<template>
  <Transition name="banner">
    <div v-if="show" class="complete-banner" role="status">
      <div class="banner-inner">
        <span class="banner-icon">🎉</span>
        <div class="banner-text">
          <p class="banner-title">{{ t('today.allDone') }}</p>
          <p class="banner-sub">{{ t('today.allDoneSub', { days: streak }) }}</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{ show: boolean; streak: number }>()
const { t } = useI18n()
</script>

<style scoped>
.complete-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
  padding: 0 16px;
  padding-top: env(safe-area-inset-top, 0);
}

.banner-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--moss);
  color: white;
  padding: 14px 20px;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  box-shadow: var(--shadow-md);
}

.banner-icon {
  font-size: 1.6rem;
  flex-shrink: 0;
}

.banner-title {
  font-size: 1rem;
  font-weight: 700;
  font-family: var(--font-serif);
  margin: 0;
}

.banner-sub {
  font-size: 0.82rem;
  opacity: 0.88;
  margin: 2px 0 0;
}

/* Slide-down enter / fade-up leave */
.banner-enter-active {
  transition:
    transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.25s ease;
}
.banner-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}
.banner-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}
.banner-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
