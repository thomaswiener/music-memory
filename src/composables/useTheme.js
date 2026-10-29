// App theme: follows the OS colour scheme until the user toggles, then sticks
// to the explicit choice (persisted in localStorage).

import { computed, ref, watchEffect } from 'vue'
import { load, save } from '../lib/storage'
import { THEME_COLORS, THEME_KEY, otherTheme, resolveTheme } from '../lib/theme'

const media = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-color-scheme: dark)')
  : null

/** 'light' | 'dark' | null (null = follow the OS) */
const choice = ref(load(THEME_KEY, null))
const systemDark = ref(media?.matches ?? false)
media?.addEventListener?.('change', (e) => {
  systemDark.value = e.matches
})

export const theme = computed(() => resolveTheme(choice.value, systemDark.value))

export function toggleTheme() {
  choice.value = otherTheme(theme.value)
  save(THEME_KEY, choice.value)
}

if (typeof document !== 'undefined') {
  watchEffect(() => {
    document.documentElement.dataset.theme = theme.value
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme.value])
  })
}
