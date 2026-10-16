<script setup>
import DeviceMenu from './DeviceMenu.vue'
import { spotify } from '../composables/useSpotify'
import { game } from '../composables/useGame'
import { settings } from '../store'

defineEmits(['new-game', 'open-settings'])
</script>

<template>
  <nav class="topnav">
    <a href="#" class="brand" title="New game" @click.prevent="$emit('new-game')">Music Memory</a>
    <template v-if="spotify.phase === 'ready'">
      <span class="sep" aria-hidden="true">|</span>
      <span class="rounds" aria-live="polite">
        <strong>{{ game.round }}</strong> {{ game.round === 1 ? 'round' : 'rounds' }}
      </span>
    </template>

    <div class="right">
      <label class="debug hide-sm" title="Show track ids on the cards">
        <input v-model="settings.debug" type="checkbox" />
        Debug
      </label>
      <DeviceMenu v-if="spotify.phase === 'ready'" />
      <button type="button" class="icon-btn" aria-label="Settings" title="Settings" @click="$emit('open-settings')">
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
  font-size: 12px;
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
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 8px;
  color: var(--muted);
  cursor: pointer;
}
@media (max-width: 480px) {
  .topnav {
    padding: 0 8px 0 16px;
    letter-spacing: 0.1em;
  }
}
</style>
