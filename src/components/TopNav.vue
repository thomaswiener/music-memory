<script setup>
import DeviceMenu from './DeviceMenu.vue'
import { spotify } from '../composables/useSpotify'
import { game } from '../composables/useGame'
import { settings } from '../store'
import { t } from '../i18n'

defineEmits(['new-game', 'open-settings'])
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
      <label class="debug hide-sm" :title="t('nav.debugTitle')">
        <input v-model="settings.debug" type="checkbox" role="switch" />
        <span class="switch" aria-hidden="true" />
        <span class="label">{{ t('nav.debug') }}</span>
      </label>
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
.debug {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 8px;
  color: var(--muted);
  cursor: pointer;
  user-select: none;
}
/* Native checkbox stays for keyboard + screen readers, visually replaced by the switch. */
.debug input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  margin: 0;
}
.switch {
  position: relative;
  flex: none;
  width: 30px;
  height: 18px;
  border-radius: 999px;
  background: var(--line-strong);
  transition: background 0.18s ease;
}
.switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--surface);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.25);
  transition: transform 0.18s ease;
}
.debug input:checked + .switch {
  background: var(--link);
}
.debug input:checked + .switch::after {
  transform: translateX(12px);
}
.debug input:checked ~ .label {
  color: var(--ink);
}
.debug input:focus-visible + .switch {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  .switch,
  .switch::after {
    transition: none;
  }
}
@media (max-width: 480px) {
  .topnav {
    padding: 0 8px 0 16px;
    letter-spacing: 0.1em;
  }
}
</style>
