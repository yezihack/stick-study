import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import type { ThemeMode } from '@/db/models'

/**
 * Apply a resolved dark/light theme to both the web view and the native
 * status bar.
 *
 * - Web: toggles the `.dark` class on <html>, which flips the CSS variables.
 * - Native (Android/iOS): switches the status bar icon style so the clock /
 *   battery icons stay readable. In dark mode the bar background is dark, so we
 *   need light icons (Style.Dark = light content); in light mode, dark icons.
 */
export async function applyTheme(dark: boolean): Promise<void> {
  document.documentElement.classList.toggle('dark', dark)

  if (!Capacitor.isNativePlatform()) return

  try {
    // Capacitor's Style naming is counter-intuitive:
    //   Style.Dark  -> light text/icons (for dark backgrounds)
    //   Style.Light -> dark text/icons  (for light backgrounds)
    await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light })
    await StatusBar.setBackgroundColor({ color: dark ? '#1a1f1a' : '#f4f0e8' })
  } catch (error) {
    // setBackgroundColor throws on devices using edge-to-edge (Android 15+);
    // the style change still applies, so this is non-fatal.
    console.warn('Failed to set status bar appearance:', error)
  }
}

/** Whether the OS currently prefers a dark color scheme. */
export function systemPrefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

// Tracks the active system listener so 'auto' mode can react to OS changes
// and so switching away from 'auto' can tear it down again.
let mediaQuery: MediaQueryList | null = null
let mediaListener: ((e: MediaQueryListEvent) => void) | null = null

function stopWatchingSystem(): void {
  if (mediaQuery && mediaListener) {
    mediaQuery.removeEventListener('change', mediaListener)
  }
  mediaQuery = null
  mediaListener = null
}

/**
 * Apply a theme mode. In 'auto' the resolved theme follows the OS preference
 * and keeps reacting to system changes until the mode is switched away.
 */
export async function applyThemeMode(mode: ThemeMode): Promise<void> {
  stopWatchingSystem()

  if (mode === 'auto') {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaListener = (e) => {
      void applyTheme(e.matches)
    }
    mediaQuery.addEventListener('change', mediaListener)
    await applyTheme(mediaQuery.matches)
    return
  }

  await applyTheme(mode === 'dark')
}
