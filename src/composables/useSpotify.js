// App-level Spotify state: connection phase, profile, devices, playback.

import { computed, reactive, watch } from 'vue'
import * as sp from '../lib/spotify'
import { settings, notify } from '../store'
import { log } from '../lib/logger'
import { sleep } from '../lib/sleep'
import { waitForPlayback, waitForStop, waitUntilPosition } from '../lib/playback'
import { errorText } from '../i18n'

export const spotify = reactive({
  /** 'loading' | 'setup' (no client ID) | 'login' (no session) | 'ready' */
  phase: 'loading',
  profile: null,
  devices: [],
  /** last login/session error (a SpotifyError), shown on the connect screen */
  error: null,
})

const api = sp.createClient(() => settings.clientId)

export const deviceActive = computed(
  () => !!settings.deviceId && spotify.devices.some((d) => d.id === settings.deviceId),
)

function nextPhase() {
  if (!settings.clientId) return 'setup'
  return sp.hasSession() ? 'ready' : 'login'
}

// A different client ID invalidates the existing session.
watch(
  () => settings.clientId,
  (id, previous) => {
    if (id === previous || spotify.phase === 'loading') return
    disconnect()
  },
)

export async function bootstrap() {
  const params = new URLSearchParams(window.location.search)
  if (params.has('code') || params.has('error')) {
    try {
      await sp.completeLogin(settings.clientId, params)
    } catch (err) {
      log.warn('login failed', err)
      spotify.error = err
    } finally {
      // Drop ?code from the address bar so a reload doesn't replay it.
      window.history.replaceState(null, '', import.meta.env.BASE_URL)
    }
  }

  spotify.phase = nextPhase()
  if (spotify.phase === 'ready') await Promise.all([loadProfile(), refreshDevices()])
}

export function connect() {
  spotify.error = null
  return sp.beginLogin(settings.clientId)
}

/** `error` (optional) is shown on the connect screen, e.g. why the session ended. */
export function disconnect(error = null) {
  sp.clearSession()
  spotify.profile = null
  spotify.devices = []
  spotify.error = error
  spotify.phase = nextPhase()
}

/** Central error handler: session loss sends the user back to "connect". */
export function handleError(err) {
  log.error(err)
  if (err?.status === 401) {
    disconnect(err)
    return
  }
  notify(errorText(err), 'error')
}

async function loadProfile() {
  try {
    spotify.profile = await api.me()
  } catch (err) {
    handleError(err)
  }
}

let devicesInFlight = null
export function refreshDevices() {
  if (spotify.phase !== 'ready') return Promise.resolve()
  devicesInFlight ??= api
    .devices()
    .then((devices) => {
      spotify.devices = devices
      if (!devices.some((d) => d.id === settings.deviceId)) {
        settings.deviceId = (devices.find((d) => d.is_active) ?? devices[0])?.id ?? null
      }
    })
    .catch(handleError)
    .finally(() => {
      devicesInFlight = null
    })
  return devicesInFlight
}

export function selectDevice(id) {
  settings.deviceId = id
}

/**
 * Plays `track` from its snippet start for its snippet length, then pauses.
 * `keepPlaying` lets the last pair of the game play on as a victory tune.
 */
export async function playSnippet(track, { keepPlaying = false, shouldContinue = () => true } = {}) {
  if (!deviceActive.value) await refreshDevices()
  if (!settings.deviceId) {
    throw new sp.SpotifyError('noDevice', { status: 404, code: 'no_device' })
  }
  try {
    await api.play(settings.deviceId, track.context_uri, track.uri, track.start)
  } catch (err) {
    if (err.status === 404) {
      settings.deviceId = null
      refreshDevices()
    }
    throw err
  }
  await waitForSnippetEnd(track, shouldContinue)
  if (keepPlaying || !shouldContinue()) return
  await stopPlayback()
  // Keep the caller's turn lock until the device has really paused; otherwise
  // the next card's play request can be overtaken by this late pause.
  const stopped = await waitForStop({ getState: playbackStateOrNull, sleep }, track.uri, { shouldContinue })
  if (!stopped && shouldContinue()) log.warn('pause not confirmed by device', track.uri)
}

/**
 * Times the snippet from confirmed playback on the device rather than from the
 * play request, so device start-up lag doesn't eat into the snippet.
 * Falls back to a plain timer if the device never reports playback.
 */
async function waitForSnippetEnd(track, shouldContinue) {
  const deps = { getState: playbackStateOrNull, sleep }
  const started = await waitForPlayback(deps, track.uri, track.start, { shouldContinue })
  if (!shouldContinue()) return
  if (!started) {
    log.warn('playback start not confirmed, falling back to timer', track.uri)
    await sleep(track.duration)
    return
  }
  log.debug('playback confirmed at', started.progressMs, 'ms')
  await waitUntilPosition(deps, track.uri, track.start + track.duration, started, { shouldContinue })
}

/** A failed state poll shouldn't abort the turn; treat it as "not playing yet". */
async function playbackStateOrNull() {
  try {
    return await api.playbackState()
  } catch (err) {
    log.debug('playback state poll failed', err)
    return null
  }
}

export async function stopPlayback() {
  if (spotify.phase !== 'ready' || !settings.deviceId) return
  // Pausing an already paused player returns 403 — harmless, ignore.
  await api.pause(settings.deviceId).catch((err) => log.debug('pause ignored', err))
}
