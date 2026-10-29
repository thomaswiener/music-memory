<script setup>
import DeviceMenu from './DeviceMenu.vue'
import LanguageMenu from './LanguageMenu.vue'
import { spotify } from '../composables/useSpotify'
import { game } from '../composables/useGame'
import { settings } from '../store'
import { theme, toggleTheme } from '../composables/useTheme'
import { computed } from 'vue'
import { t } from '../i18n'

defineEmits(['new-game', 'open-settings'])

const themeLabel = computed(() => t(theme.value === 'dark' ? 'nav.lightMode' : 'nav.darkMode'))
</script>

<template>
  <nav class="topnav">
    <a href="#" class="brand" :title="t('nav.newGame')" @click.prevent="$emit('new-game')">Music Memory</a>
    <template v-if="spotify.phase === 'ready'">
      <span class="sep" aria-hidden="true">|</span>
      <span class="rounds" aria-live="polite">
        <strong>{{ game.round }}</strong> {{ t('nav.rounds', { count: game.round }) }}
      </span>
    </template>

    <div class="right">
      <button
        type="button"
        class="icon-btn debug hide-sm"
        :class="{ on: settings.debug }"
        :aria-pressed="settings.debug"
        :aria-label="t('nav.debug')"
        :title="t('nav.debugTitle')"
        @click="settings.debug = !settings.debug"
      >
        <i :class="settings.debug ? 'bi bi-bug-fill' : 'bi bi-bug'" />
      </button>
      <button
        type="button"
        class="icon-btn"
        :aria-label="themeLabel"
        :title="themeLabel"
        @click="toggleTheme"
      >
        <i :class="theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon'" />
      </button>
      <LanguageMenu />
      <DeviceMenu v-if="spotify.phase === 'ready'" />
      <button type="button" class="icon-btn" :aria-label="t('nav.settings')" :title="t('nav.settings')" @click="$emit('open-settings')">
        <i class="bi bi-sliders" />
      </button>
    </div>
  </nav>
</template>

<style scoped>
.topnav {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  padding: 0 20px;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
  font-size: 14px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.brand,
.rounds {
  white-space: nowrap;
}
.brand {
  font-weight: 500;
  color: var(--ink);
  text-decoration: none;
}
.brand:hover {
  text-decoration: underline;
}
.sep,
.rounds {
  color: var(--muted);
}
.rounds strong {
  color: var(--ink);
  font-weight: 500;
}
.right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}
.debug.on {
  color: var(--link);
}
@media (max-width: 480px) {
  .topnav {
    gap: 8px;
    padding: 0 6px 0 16px;
    font-size: 13px;
    letter-spacing: 0.08em;
  }
  .right {
    gap: 0;
  }
  /* four icon buttons (theme, language, device, settings) need to fit on a phone */
  .right :deep(.icon-btn) {
    width: 34px;
  }
}
@media (max-width: 360px) {
  .sep {
    display: none;
  }
}
@media (max-width: 340px) {
  .topnav {
    font-size: 12px;
    letter-spacing: 0.04em;
  }
}
</style>
