// Snippet timing measured against what the device reports, not wall-clock time.
//
// `PUT /me/player/play` returns as soon as Spotify accepts the command; the
// device may need anywhere from ~200 ms to several seconds to actually start.
// A timer started at that point cuts the snippet short by exactly that lag.
// Instead we (1) poll the player state until the device is audibly playing the
// track, and (2) pause based on the reported track position.
//
// Everything is injected (getState/sleep/now) so the logic is unit-testable.

export const POLL_INTERVAL_MS = 300
export const START_TIMEOUT_MS = 5000
/** Progress must move this far past the seek target before we call it "playing". */
export const START_MARGIN_MS = 50
/** Wake up this long before the computed end to re-check the position. */
export const EARLY_WAKE_MS = 400
/** Max position re-checks before pausing (guards against endless top-ups). */
export const MAX_CHECKS = 3

/** True if the player state shows `uri` playing (handles track relinking). */
export function isPlayingTrack(state, uri) {
  if (!state?.is_playing || !state.item) return false
  return state.item.uri === uri || state.item.linked_from?.uri === uri
}

/**
 * Polls until the device is playing `uri` past `startMs`.
 * Resolves to `{ progressMs, at }` (position and local time it was observed),
 * or `null` on timeout / when `shouldContinue()` turns false.
 */
export async function waitForPlayback(
  { getState, sleep, now = Date.now },
  uri,
  startMs,
  { timeoutMs = START_TIMEOUT_MS, intervalMs = POLL_INTERVAL_MS, shouldContinue = () => true } = {},
) {
  const deadline = now() + timeoutMs
  while (now() < deadline) {
    if (!shouldContinue()) return null
    const state = await getState()
    const at = now()
    if (isPlayingTrack(state, uri) && state.progress_ms > startMs + START_MARGIN_MS) {
      return { progressMs: state.progress_ms, at }
    }
    await sleep(intervalMs)
  }
  return null
}

/**
 * Waits until the device has played up to `endMs`, starting from an observed
 * position. Re-checks the reported progress shortly before the end and tops
 * up if playback stalled. Returns early if the track stops or changes.
 */
export async function waitUntilPosition(
  { getState, sleep, now = Date.now },
  uri,
  endMs,
  observed,
  { shouldContinue = () => true } = {},
) {
  let { progressMs, at } = observed
  for (let check = 0; check < MAX_CHECKS; check++) {
    const position = progressMs + (now() - at)
    const remaining = endMs - position
    if (remaining <= 0) return
    // Last check: sleep the full remainder, no further correction.
    const isLast = check === MAX_CHECKS - 1
    await sleep(isLast || remaining <= EARLY_WAKE_MS ? remaining : remaining - EARLY_WAKE_MS)
    if (isLast || remaining <= EARLY_WAKE_MS || !shouldContinue()) return

    const state = await getState()
    if (!isPlayingTrack(state, uri)) return // paused elsewhere or track changed
    progressMs = state.progress_ms
    at = now()
  }
}
