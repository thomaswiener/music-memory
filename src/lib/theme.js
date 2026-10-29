// Light/dark theme resolution. The pre-paint copy of this logic lives inline in
// index.html (so the page never flashes the wrong theme); keep the two in sync.

export const THEME_KEY = 'mm:theme'
export const THEMES = ['light', 'dark']

/** Browser UI colour (address bar etc.) per theme; matches --bg in main.css. */
export const THEME_COLORS = { light: '#f5f4f0', dark: '#141517' }

/** An explicit user choice wins; otherwise follow the OS setting. */
export function resolveTheme(stored, prefersDark) {
  if (THEMES.includes(stored)) return stored
  return prefersDark ? 'dark' : 'light'
}

export const otherTheme = (theme) => (theme === 'dark' ? 'light' : 'dark')
