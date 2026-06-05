import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

/**
 * Apply the dark/light theme to both the web view and the native status bar.
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
