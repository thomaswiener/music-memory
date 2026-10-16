<script setup>
import { computed } from 'vue'
import { playerColor } from '../lib/players'

const props = defineProps({
  card: { type: Object, required: true },
  track: { type: Object, required: true },
  index: { type: Number, required: true },
  faceUp: Boolean,
  playing: Boolean,
  shake: Boolean,
  /** index of the player who solved this pair, or undefined */
  solvedBy: { type: Number, default: undefined },
  playerName: { type: String, default: '' },
  locked: Boolean,
  debug: Boolean,
})
defineEmits(['flip'])

const solved = computed(() => props.solvedBy !== undefined)
const suffix = computed(() => props.card.uri.slice(-3))
const icon = computed(() => {
  if (props.playing) return 'bi-play-fill'
  if (solved.value) return 'bi-check-lg'
  return 'bi-stop-fill'
})
const label = computed(() => {
  if (solved.value) return `${props.track.artist} – ${props.track.title}, solved by ${props.playerName}`
  if (props.playing) return `Card ${props.index + 1}, playing`
  return `Card ${props.index + 1}${props.faceUp ? ', revealed' : ''}`
})
</script>

<template>
  <button
    type="button"
    class="card"
    :class="{ flipped: faceUp, shake, solved, playing, locked }"
    :style="solved ? { '--player': playerColor(solvedBy) } : undefined"
    :aria-label="label"
    :aria-disabled="faceUp || locked"
    :title="solved || debug ? `${track.artist} – ${track.title}` : undefined"
    @click="$emit('flip')"
  >
    <span class="inner">
      <span class="face back">
        <span class="pip" />
        <small v-if="debug" class="dbg">{{ suffix }}</small>
      </span>
      <span class="face front">
        <i class="bi" :class="icon" />
        <small v-if="debug" class="dbg">{{ suffix }}</small>
      </span>
    </span>
  </button>
</template>

<style scoped>
.card {
  width: var(--card-size);
  height: var(--card-size);
  padding: 0;
  border: 0;
  background: none;
  perspective: 600px;
  cursor: pointer;
  font-size: calc(var(--card-size) * 0.33);
  color: var(--ink);
  -webkit-tap-highlight-color: transparent;
}
.card:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 3px;
  border-radius: 6px;
}
.card.flipped,
.card.locked {
  cursor: default;
}
.card.solved {
  cursor: not-allowed;
}
.inner {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.42s cubic-bezier(0.4, 0, 0.2, 1);
}
.flipped .inner {
  transform: rotateY(180deg);
}
.face {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border-radius: 6px;
  backface-visibility: hidden;
}
.back {
  background: var(--card-back);
  border: 1.5px solid var(--card-back-border);
}
.card:not(.flipped):not(.locked):hover .back {
  border-color: var(--muted);
}
.pip {
  width: 22%;
  height: 22%;
  border-radius: 50%;
  background: var(--card-pip);
}
.front {
  background: var(--surface);
  border: 1.5px solid var(--card-front-border);
  transform: rotateY(180deg);
}
.solved .front {
  background: color-mix(in srgb, var(--player) 90%, white);
  /*border-color: color-mix(in srgb, var(--player) 45%, white);*/
  color: #ffffff;
}
.playing .front i {
  animation: pulse 0.8s ease-in-out infinite alternate;
}
.dbg {
  position: absolute;
  bottom: 3px;
  right: 5px;
  font-size: 9px;
  color: var(--muted);
}
.shake {
  animation: shake 0.35s ease;
}
@keyframes shake {
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
@keyframes pulse {
  to { transform: scale(1.18); }
}
@media (prefers-reduced-motion: reduce) {
  .inner { transition: none; }
  .shake, .playing .front i { animation: none; }
}
</style>
