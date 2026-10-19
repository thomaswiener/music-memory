<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import TopNav from './components/TopNav.vue'
import SetupGuide from './components/SetupGuide.vue'
import GameBoard from './components/GameBoard.vue'
import SettingsModal from './components/SettingsModal.vue'
import WinModal from './components/WinModal.vue'
import AppToast from './components/AppToast.vue'
import NewGameConfirm from './components/NewGameConfirm.vue'
import LegalOverlay from './components/LegalOverlay.vue'
import { spotify, bootstrap, refreshDevices } from './composables/useSpotify'
import { requestNewGame, restoreOrNewGame } from './composables/useGame'
import { settings } from './store'
import { setLogLevel } from './lib/logger'
import { t } from './i18n'

const settingsOpen = ref(false)

// Legal notice: footer button, or a direct link to #impressum / #datenschutz.
const LEGAL_HASHES = { '#impressum': 'imprint', '#imprint': 'imprint', '#datenschutz': 'privacy', '#privacy': 'privacy' }
const legalOpen = ref(false)
const legalSection = ref('imprint')
function openLegal(section = 'imprint') {
  legalSection.value = section
  legalOpen.value = true
}
function closeLegal() {
  legalOpen.value = false
  if (LEGAL_HASHES[window.location.hash]) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
  }
}
const onHash = () => {
  const section = LEGAL_HASHES[window.location.hash.toLowerCase()]
  if (section) openLegal(section)
}

watch(() => settings.debug, (on) => setLogLevel(on ? 'debug' : 'info'), { immediate: true })

// Devices come and go (phone locked, desktop app closed) — recheck on return.
const onFocus = () => refreshDevices()

onMounted(async () => {
  await bootstrap()
  restoreOrNewGame()
  window.addEventListener('focus', onFocus)
  window.addEventListener('hashchange', onHash)
  onHash()
})
onBeforeUnmount(() => {
  window.removeEventListener('focus', onFocus)
  window.removeEventListener('hashchange', onHash)
})
</script>

<template>
  <TopNav @new-game="requestNewGame" @open-settings="settingsOpen = true" />

  <main class="game">
    <div v-if="spotify.phase === 'loading'" class="loading" aria-busy="true">{{ t('app.loading') }}</div>
    <SetupGuide v-else-if="spotify.phase !== 'ready'" />
    <GameBoard v-else />
  </main>

  <SettingsModal :open="settingsOpen" @close="settingsOpen = false" />
  <WinModal />
  <NewGameConfirm />
  <AppToast />

  <button type="button" class="legal-button" @click="openLegal()">
    <i class="bi bi-info-circle" aria-hidden="true" /> {{ t('legal.button') }}
  </button>
  <LegalOverlay v-model:section="legalSection" :open="legalOpen" @close="closeLegal" />
</template>

<style scoped>
.game {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100dvh - 53px);
  /* room for the fixed legal button, so it never covers content */
  padding-bottom: 56px;
  background: var(--bg);
}
.legal-button {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 40;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: var(--surface);
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.04em;
  cursor: pointer;
  box-shadow: 0 1px 4px rgb(0 0 0 / 0.06);
  transition: color 0.18s, border-color 0.18s;
}
.legal-button:hover {
  color: var(--ink);
  border-color: var(--muted);
}
.loading {
  margin-top: 30vh;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
</style>
