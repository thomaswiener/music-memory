<script setup>
import { computed, ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import { game, won, winners, scores, newGame } from '../composables/useGame'
import { t, joinNames } from '../i18n'
import I18nT from '../i18n/I18nT'

const dismissed = ref(false)
watch(won, (w) => {
  if (w) dismissed.value = false
})

const multiplayer = computed(() => scores.value.length > 1)
const title = computed(() => {
  if (!multiplayer.value) return t('win.titleSolo')
  const names = winners.value.map((w) => w.name)
  return names.length > 1 ? t('win.titleTie', { names: joinNames(names) }) : t('win.titleWinner', { name: names[0] })
})
const moves = computed(() => t('count.moves', { count: game.round }))
const pairs = computed(() => t('win.pairs', { count: winners.value[0]?.solved ?? 0 }))

function playAgain() {
  dismissed.value = true
  newGame()
}
</script>

<template>
  <BaseModal :open="won && !dismissed" :title="title" variant="dialog" @close="dismissed = true">
    <p class="msg">
      <I18nT :k="!multiplayer ? 'win.solo' : winners.length > 1 ? 'win.shared' : 'win.winner'">
        <template #pairs><strong>{{ pairs }}</strong></template>
        <template #moves><strong>{{ moves }}</strong></template>
      </I18nT>
    </p>
    <ol v-if="multiplayer" class="ranking">
      <li v-for="p in [...scores].sort((a, b) => b.solved - a.solved)" :key="p.index">
        <span>{{ p.name }}</span><strong>{{ p.solved }}</strong>
      </li>
    </ol>
    <button type="button" class="btn primary big" @click="playAgain">{{ t('win.playAgain') }}</button>
  </BaseModal>
</template>

<style scoped>
.msg {
  margin: 0 0 1rem;
  color: var(--muted);
  font-size: 14px;
}
.msg strong {
  color: var(--ink);
}
.ranking {
  margin: 0 0 0.5rem;
  padding: 0;
  list-style: none;
  font-size: 13px;
}
.ranking li {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid var(--line);
}
.big {
  margin-top: 1rem;
  font-size: 1rem;
  padding: 0.6rem 1.4rem;
}
</style>
