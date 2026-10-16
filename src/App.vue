<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import TopNav from './components/TopNav.vue'
import SetupGuide from './components/SetupGuide.vue'
import GameBoard from './components/GameBoard.vue'
import SettingsModal from './components/SettingsModal.vue'
import WinModal from './components/WinModal.vue'
import AppToast from './components/AppToast.vue'
import { spotify, bootstrap, refreshDevices } from './composables/useSpotify'
import { newGame, restoreOrNewGame } from './composables/useGame'
import { settings } from './store'
import { setLogLevel } from './lib/logger'

const settingsOpen = ref(false)

watch(() => settings.debug, (on) => setLogLevel(on ? 'debug' : 'info'), { immediate: true })

// Devices come and go (phone locked, desktop app closed) — recheck on return.
const onFocus = () => refreshDevices()

onMounted(async () => {
  await bootstrap()
  restoreOrNewGame()
  window.addEventListener('focus', onFocus)
})
onBeforeUnmount(() => window.removeEventListener('focus', onFocus))
</script>

<template>
  <TopNav @new-game="newGame" @open-settings="settingsOpen = true" />

  <main class="game">
    <div v-if="spotify.phase === 'loading'" class="loading" aria-busy="true">Loading…</div>
    <SetupGuide v-else-if="spotify.phase !== 'ready'" />
    <GameBoard v-else />
  </main>

  <SettingsModal :open="settingsOpen" @close="settingsOpen = false" />
  <WinModal />
  <AppToast />
</template>

<style scoped>
.game {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100dvh - 53px);
  background: var(--bg);
}
.loading {
  margin-top: 30vh;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
</style>
