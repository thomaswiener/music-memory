// Pure game logic — no DOM, no Spotify, no storage. Unit-tested.

export const BOARD_SIZES = ['auto', '4x4', '4x8', '8x8', '12x12', '16x16']

export function parseBoardSize(size) {
  const match = /^(\d+)x(\d+)$/.exec(size ?? '')
  if (!match) return null // "auto"
  const cols = Number(match[1])
  const rows = Number(match[2])
  return { cols, rows, pairs: Math.floor((cols * rows) / 2) }
}

/** Include = keep tracks with ANY selected tag (none selected = all). Exclude wins. */
export function filterTracks(tracks, include = [], exclude = []) {
  const inc = new Set(include)
  const exc = new Set(exclude)
  return tracks.filter(
    (track) =>
      (inc.size === 0 || track.tags.some((tag) => inc.has(tag))) &&
      !track.tags.some((tag) => exc.has(tag)),
  )
}

/** Unbiased Fisher–Yates (v1 used sort(() => Math.random() - .5), which is biased). */
export function shuffle(items, random = Math.random) {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Pick tracks for the board, duplicate them into pairs and shuffle.
 * If fewer tracks match than the board needs, the board shrinks instead of
 * containing gaps, and the result reports it.
 */
export function buildDeck(tracks, boardSize, random = Math.random) {
  const dims = parseBoardSize(boardSize)
  const requestedPairs = dims ? dims.pairs : tracks.length
  const picked = shuffle(tracks, random).slice(0, requestedPairs)
  const cards = shuffle(
    picked.flatMap((track) => [0, 1].map((copy) => ({ id: `${track.uri}#${copy}`, uri: track.uri }))),
    random,
  )
  const fullBoard = dims && picked.length === requestedPairs
  const columns = fullBoard ? dims.cols : Math.max(1, Math.ceil(Math.sqrt(cards.length)))
  return { cards, columns, pairs: picked.length, requestedPairs }
}

/** Players with the highest score; several on a tie. */
export function leaders(scores) {
  const best = Math.max(0, ...scores.map((s) => s.solved))
  return scores.filter((s) => s.solved === best)
}
