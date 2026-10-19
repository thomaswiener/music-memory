<script setup>
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'
import { confirmingNewGame, newGame, game, solvedPairs, totalPairs } from '../composables/useGame'
import { t } from '../i18n'

const progress = computed(
  () =>
    t('confirm.progress', {
      found: solvedPairs.value,
      total: totalPairs.value,
      rounds: t('count.rounds', { count: game.round }),
    }),
)
const cancel = () => (confirmingNewGame.value = false)
</script>

<template>
  <BaseModal :open="confirmingNewGame" :title="t('confirm.title')" variant="dialog" @close="cancel">
    <p class="msg">{{ t('confirm.message', { progress }) }}</p>
    <div class="actions">
      <button type="button" class="btn secondary" @click="cancel">{{ t('confirm.keep') }}</button>
      <button type="button" class="btn primary" @click="newGame">{{ t('confirm.confirm') }}</button>
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
