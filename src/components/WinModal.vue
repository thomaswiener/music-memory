<script setup>
import { computed, ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import { game, won, winners, scores, newGame } from '../composables/useGame'
import { joinNames } from '../lib/game'

const dismissed = ref(false)
watch(won, (w) => {
  if (w) dismissed.value = false
})

const multiplayer = computed(() => scores.value.length > 1)
const title = computed(() => {
  if (!multiplayer.value) return '🎉 You won!'
  const names = winners.value.map((w) => w.name)
  return names.length > 1 ? `🤝 ${joinNames(names)} tie!` : `🎉 ${names[0]} wins!`
})
const moves = computed(() => `${game.round} ${game.round === 1 ? 'move' : 'moves'}`)

function playAgain() {
  dismissed.value = true
  newGame()
}
</script>

<template>
  <BaseModal :open="won && !dismissed" :title="title" variant="dialog" @close="dismissed = true">
    <p class="msg">
      <template v-if="multiplayer">
        {{ winners.length > 1 ? 'Shared victory' : 'Most pairs' }} with
        <strong>{{ winners[0].solved }}</strong> pairs, game finished in <strong>{{ moves }}</strong>.
      </template>
      <template v-else>Congratulations, you beat the game in <strong>{{ moves }}</strong>.</template>
    </p>
    <ol v-if="multiplayer" class="ranking">
      <li v-for="p in [...scores].sort((a, b) => b.solved - a.solved)" :key="p.index">
        <span>{{ p.name }}</span><strong>{{ p.solved }}</strong>
      </li>
    </ol>
    <button type="button" class="btn primary big" @click="playAgain">Play again</button>
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
