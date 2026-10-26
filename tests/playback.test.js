import { describe, expect, it } from 'vitest'
import { isPlayingTrack, waitForPlayback, waitForStop, waitUntilPosition } from '../src/lib/playback'

const URI = 'spotify:track:abc'

/**
 * Simulated device + clock. The device starts playing at `startAt` (local ms)
 * from position `seek`, optionally stalling for `stallMs` at `stallAt` (track ms).
 */
function fakeDevice({ startAt = 0, seek = 30_000, stallAt = Infinity, stallMs = 0, uri = URI } = {}) {
  let clock = 0
  const position = () => {
    if (clock < startAt) return seek
    const raw = seek + (clock - startAt)
    return raw <= stallAt ? raw : Math.max(stallAt, raw - stallMs)
  }
  const polls = []
  return {
    deps: {
      now: () => clock,
      sleep: async (ms) => {
        clock += ms
      },
      getState: async () => {
        polls.push(clock)
        const playing = clock >= startAt
        return { is_playing: playing, progress_ms: position(), item: { uri } }
      },
    },
    position,
    clock: () => clock,
    polls,
  }
}

describe('isPlayingTrack', () => {
  it('requires is_playing and a matching uri', () => {
    expect(isPlayingTrack(null, URI)).toBe(false)
    expect(isPlayingTrack({ is_playing: false, item: { uri: URI } }, URI)).toBe(false)
    expect(isPlayingTrack({ is_playing: true, item: { uri: 'spotify:track:x' } }, URI)).toBe(false)
    expect(isPlayingTrack({ is_playing: true, item: { uri: URI } }, URI)).toBe(true)
  })
  it('accepts relinked tracks', () => {
    const state = { is_playing: true, item: { uri: 'spotify:track:other', linked_from: { uri: URI } } }
    expect(isPlayingTrack(state, URI)).toBe(true)
  })
})

describe('waitForPlayback', () => {
  it('waits until the device actually plays past the seek position', async () => {
    const dev = fakeDevice({ startAt: 1800, seek: 30_000 })
    const started = await waitForPlayback(dev.deps, URI, 30_000)
    expect(started).not.toBeNull()
    expect(started.at).toBeGreaterThanOrEqual(1800)
    expect(started.progressMs).toBeGreaterThan(30_050)
  })

  it('does not accept "is_playing" while progress is still at the seek target', async () => {
    let clock = 0
    const deps = {
      now: () => clock,
      sleep: async (ms) => {
        clock += ms
      },
      getState: async () => ({ is_playing: true, progress_ms: clock < 900 ? 30_000 : 30_000 + clock - 900, item: { uri: URI } }),
    }
    const started = await waitForPlayback(deps, URI, 30_000)
    expect(started.at).toBeGreaterThanOrEqual(900)
  })

  it('times out when the device never starts', async () => {
    const dev = fakeDevice({ startAt: Infinity })
    expect(await waitForPlayback(dev.deps, URI, 0, { timeoutMs: 2000 })).toBeNull()
    expect(dev.clock()).toBeGreaterThanOrEqual(2000)
  })

  it('stops polling when the turn is cancelled', async () => {
    const dev = fakeDevice({ startAt: Infinity })
    let alive = true
    const p = waitForPlayback(dev.deps, URI, 0, { shouldContinue: () => alive })
    alive = false
    expect(await p).toBeNull()
  })
})

describe('snippet timing end to end', () => {
  const SEEK = 30_000
  const DURATION = 10_000

  async function run(device) {
    const started = await waitForPlayback(device.deps, URI, SEEK)
    await waitUntilPosition(device.deps, URI, SEEK + DURATION, started)
    return device.position() - SEEK // how much of the snippet was actually heard
  }

  it.each([0, 400, 2500, 4500])('plays the full snippet with %i ms start lag', async (lag) => {
    const heard = await run(fakeDevice({ startAt: lag, seek: SEEK }))
    expect(heard).toBeGreaterThanOrEqual(DURATION)
    expect(heard).toBeLessThan(DURATION + 100)
  })

  it('tops up when playback stalls mid-snippet', async () => {
    const heard = await run(fakeDevice({ startAt: 500, seek: SEEK, stallAt: SEEK + 3000, stallMs: 1200 }))
    expect(heard).toBeGreaterThanOrEqual(DURATION)
    expect(heard).toBeLessThan(DURATION + 100)
  })

  it('returns early if the track changes', async () => {
    const dev = fakeDevice({ startAt: 0, seek: SEEK })
    const started = await waitForPlayback(dev.deps, URI, SEEK)
    const before = dev.clock()
    dev.deps.getState = async () => ({ is_playing: true, progress_ms: 0, item: { uri: 'spotify:track:other' } })
    await waitUntilPosition(dev.deps, URI, SEEK + DURATION, started)
    expect(dev.clock() - before).toBeLessThan(DURATION)
  })
})

describe('waitForStop', () => {
  /** Device that keeps reporting `uri` playing until local time `pausedAt`. */
  function pausingDevice(pausedAt) {
    let clock = 0
    return {
      deps: {
        now: () => clock,
        sleep: async (ms) => {
          clock += ms
        },
        getState: async () => ({ is_playing: clock < pausedAt, progress_ms: 40_000, item: { uri: URI } }),
      },
      clock: () => clock,
    }
  }

  it('holds until the device reports the pause', async () => {
    const dev = pausingDevice(1100)
    expect(await waitForStop(dev.deps, URI)).toBe(true)
    expect(dev.clock()).toBeGreaterThanOrEqual(1100)
  })

  it('returns immediately when already stopped', async () => {
    const dev = pausingDevice(0)
    expect(await waitForStop(dev.deps, URI)).toBe(true)
    expect(dev.clock()).toBe(0)
  })

  it('treats another track or no active player as stopped', async () => {
    const other = { now: () => 0, sleep: async () => {}, getState: async () => ({ is_playing: true, item: { uri: 'spotify:track:x' } }) }
    expect(await waitForStop(other, URI)).toBe(true)
    const none = { now: () => 0, sleep: async () => {}, getState: async () => null }
    expect(await waitForStop(none, URI)).toBe(true)
  })

  it('gives up after the timeout', async () => {
    const dev = pausingDevice(Infinity)
    expect(await waitForStop(dev.deps, URI, { timeoutMs: 1000 })).toBe(false)
    expect(dev.clock()).toBeGreaterThanOrEqual(1000)
  })

  it('stops waiting when the turn is cancelled', async () => {
    const dev = pausingDevice(Infinity)
    expect(await waitForStop(dev.deps, URI, { shouldContinue: () => false })).toBe(false)
  })
})
