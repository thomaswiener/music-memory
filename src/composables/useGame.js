// Game state machine: deck, turns, scoring, persistence.

import { computed, reactive, ref, watch } from 'vue'
import { TRACKS, TRACK_BY_URI } from '../data/tracks'
import { buildDeck, filterTracks, leaders } from '../lib/game'
import { load, save } from '../lib/storage'
import { sleep } from '../lib/sleep'
import { settings, notify } from '../store'
import { playSnippet, stopPlayback, handleError } from './useSpotify'
import { t } from '../i18n'

const SAVE_KEY = 'mm:game'
const REVEAL_MS = 350 // beat after the 2nd snippet before judging the pair
const MISMATCH_MS = 650 // shake, then flip back

export const game = reactive({
  cards: [],
  columns: 4,
  round: 0,
  currentPlayer: 0,
  /** uri → index of the player who solved it */
  solvedBy: {},
  // transient (not persisted)
  selection: [],
  playing: null,
  mismatch: [],
  busy: false,
})

// Bumped on every new game so in-flight async turns from the old game stop.
let epoch = 0

export const totalPairs = computed(() => game.cards.length / 2)
export const solvedPairs = computed(() => Object.keys(game.solvedBy).length)
export const won = computed(() => game.cards.length > 0 && solvedPairs.value === totalPairs.value)

export const scores = computed(() =>
  settings.players.map((player, index) => ({
    ...player,
    index,
    solved: Object.values(game.solvedBy).filter((p) => p === index).length,
  })),
)
export const winners = computed(() => leaders(scores.value))

export const isFaceUp = (card) => game.selection.includes(card.id) || card.uri in game.solvedBy
export const trackOf = (card) => TRACK_BY_URI.get(card.uri)

/** True while the "start a new game?" dialog is open. */
export const confirmingNewGame = ref(false)

/**
 * New game from the nav / board button. Asks first if a game is in
 * progress; a fresh or finished board is replaced straight away.
 */
export function requestNewGame() {
  if (!won.value) confirmingNewGame.value = true
  else newGame()
}

export function newGame() {
  confirmingNewGame.value = false
  epoch++
  stopPlayback()
  const pool = filterTracks(TRACKS, settings.include, settings.exclude)
  const deck = buildDeck(pool, settings.boardSize)
  Object.assign(game, {
    cards: deck.cards,
    columns: deck.columns,
    round: 0,
    currentPlayer: 0,
    solvedBy: {},
    selection: [],
    playing: null,
    mismatch: [],
    busy: false,
  })
  if (deck.pairs === 0) notify(t('notice.noTracks'), 'error', 0)
  else if (deck.pairs < deck.requestedPairs) {
    notify(t('notice.boardShrunk', { count: deck.pairs }))
  }
}

/** Resume a game after reload if it is still consistent with current settings. */
export function restoreOrNewGame() {
  const saved = load(SAVE_KEY, null)
  const valid =
    saved &&
    Array.isArray(saved.cards) &&
    saved.cards.length > 0 &&
    saved.cards.every((c) => TRACK_BY_URI.has(c?.uri) && typeof c.id === 'string') &&
    saved.currentPlayer < settings.players.length &&
    Object.values(saved.solvedBy ?? {}).every((p) => p < settings.players.length)

  if (!valid) return newGame()
  Object.assign(game, {
    cards: saved.cards,
    columns: saved.columns || Math.ceil(Math.sqrt(saved.cards.length)),
    round: saved.round || 0,
    currentPlayer: saved.currentPlayer || 0,
    solvedBy: saved.solvedBy || {},
  })
}

watch(
  () => [game.cards, game.columns, game.round, game.currentPlayer, game.solvedBy],
  () =>
    save(SAVE_KEY, {
      cards: game.cards,
      columns: game.columns,
      round: game.round,
      currentPlayer: game.currentPlayer,
      solvedBy: game.solvedBy,
    }),
  { deep: true },
)

export async function flip(card) {
  if (game.busy || won.value || isFaceUp(card)) return

  const turn = epoch
  const alive = () => turn === epoch
  const remainingCards = game.cards.length - solvedPairs.value * 2
  const isFinalPair = game.selection.length === 1 && remainingCards === 2

  game.busy = true
  game.selection.push(card.id)
  game.playing = card.id

  try {
    await playSnippet(trackOf(card), { keepPlaying: isFinalPair, shouldContinue: alive })
  } catch (err) {
    if (!alive()) return
    // Playback failed: put the card back so the turn isn't lost.
    game.selection = game.selection.filter((id) => id !== card.id)
    game.playing = null
    game.busy = false
    handleError(err)
    return
  }
  if (!alive()) return
  game.playing = null

  if (game.selection.length < 2) {
    game.busy = false
    return
  }

  await sleep(REVEAL_MS)
  if (!alive()) return
  await resolvePair()
}

async function resolvePair() {
  const turn = epoch
  const [a, b] = game.selection.map((id) => game.cards.find((c) => c.id === id))
  game.round++

  if (a.uri === b.uri) {
    game.solvedBy[a.uri] = game.currentPlayer // match: same player goes again
  } else {
    game.mismatch = [a.id, b.id]
    await sleep(MISMATCH_MS)
    if (turn !== epoch) return
    game.mismatch = []
    game.currentPlayer = (game.currentPlayer + 1) % settings.players.length
  }
  game.selection = []
  game.busy = false
}
