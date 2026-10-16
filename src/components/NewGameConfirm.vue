<script setup>
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'
import { confirmingNewGame, newGame, game, solvedPairs, totalPairs } from '../composables/useGame'

const progress = computed(
  () => `${solvedPairs.value} of ${totalPairs.value} pairs found in ${game.round} ${game.round === 1 ? 'round' : 'rounds'}`,
)
const cancel = () => (confirmingNewGame.value = false)
</script>

<template>
  <BaseModal :open="confirmingNewGame" title="Start a new game?" variant="dialog" @close="cancel">
    <p class="msg">The current game ({{ progress }}) will be lost.</p>
    <div class="actions">
      <button type="button" class="btn secondary" @click="cancel">Keep playing</button>
      <button type="button" class="btn primary" @click="newGame">New game</button>
    </div>
  </BaseModal>
</template>

<style scoped>
.msg {
  margin: 0 0 1.5rem;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.5;
}
.actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}
.btn {
  font-size: 15px;
  padding: 0.55rem 1.2rem;
}
.secondary {
  background: var(--surface);
  border-color: var(--line-strong);
  color: var(--ink);
}
.secondary:hover {
  background: var(--hover);
}
</style>
