<script setup>
import MemoryCard from './MemoryCard.vue'
import {
  game, scores, solvedPairs, totalPairs, isFaceUp, trackOf, flip, newGame,
} from '../composables/useGame'
import { settings } from '../store'
import { playerColor } from '../lib/players'
</script>

<template>
  <section class="board-wrap">
    <ul class="stats" aria-label="Scores">
      <li
        v-for="p in scores"
        :key="p.index"
        :class="{ active: p.index === game.currentPlayer && scores.length > 1 }"
        :style="{ '--player': playerColor(p.index) }"
        :aria-current="p.index === game.currentPlayer && scores.length > 1 ? 'true' : undefined"
      >
        <span class="dot" />
        {{ p.name }} <strong>{{ p.solved }}</strong>
      </li>
      <li class="pairs">pairs <strong>{{ solvedPairs }}/{{ totalPairs }}</strong></li>
    </ul>

    <div class="board" :style="{ '--cols': game.columns }">
      <MemoryCard
        v-for="(card, i) in game.cards"
        :key="card.id"
        :card="card"
        :track="trackOf(card)"
        :index="i"
        :face-up="isFaceUp(card)"
        :playing="game.playing === card.id"
        :shake="game.mismatch.includes(card.id)"
        :solved-by="game.solvedBy[card.uri]"
        :player-name="settings.players[game.solvedBy[card.uri]]?.name ?? ''"
        :locked="game.busy"
        :debug="settings.debug"
        @flip="flip(card)"
      />
    </div>

    <button type="button" class="reset" @click="newGame">New game</button>
  </section>
</template>

<style scoped>
.board-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  padding: 32px 16px 48px;
  width: 100%;
}
.stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 24px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 15px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted-2);
}
.stats li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px 4px;
  /* Transparent until active, so the row doesn't shift between turns. */
  border-top: 1px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}
.stats strong {
  color: var(--ink);
  font-weight: 500;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--player);
}
.stats li.active {
  color: var(--ink);
  border-top-color: var(--player);
}
.board {
  /* Cards shrink to fit narrow screens instead of overflowing. */
  --gap: 10px;
  --card-size: min(72px, calc((100vw - 32px - (var(--cols) - 1) * var(--gap)) / var(--cols)));
  display: grid;
  grid-template-columns: repeat(var(--cols), var(--card-size));
  gap: var(--gap);
}
@media (max-width: 480px) {
  .board { --gap: 6px; }
}
.reset {
  border: 0;
  background: none;
  padding: 4px;
  font: inherit;
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted-2);
  cursor: pointer;
  transition: color 0.18s;
}
.reset:hover {
  color: var(--ink);
}
</style>
