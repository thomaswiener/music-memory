import { describe, expect, it } from 'vitest'
import { buildDeck, filterTracks, joinNames, leaders, parseBoardSize, shuffle } from '../src/lib/game'
import { defaultPlayerName, normalizePlayers, playerColor } from '../src/lib/players'
import { TRACKS, TAGS } from '../src/data/tracks'

const track = (id, tags) => ({ uri: `spotify:track:${id}`, tags })
const sample = [track('a', ['90s', 'house']), track('b', ['80s']), track('c', ['90s', 'explicit']), track('d', ['deutsch'])]

describe('parseBoardSize', () => {
  it('parses dimensions and pairs', () => {
    expect(parseBoardSize('4x8')).toEqual({ cols: 4, rows: 8, pairs: 16 })
  })
  it('returns null for auto/invalid', () => {
    expect(parseBoardSize('auto')).toBeNull()
    expect(parseBoardSize(undefined)).toBeNull()
  })
})

describe('filterTracks', () => {
  it('keeps everything without filters', () => {
    expect(filterTracks(sample)).toHaveLength(4)
  })
  it('include matches any tag', () => {
    expect(filterTracks(sample, ['90s', '80s']).map((t) => t.uri.at(-1))).toEqual(['a', 'b', 'c'])
  })
  it('exclude wins over include', () => {
    expect(filterTracks(sample, ['90s'], ['explicit']).map((t) => t.uri.at(-1))).toEqual(['a'])
  })
})

describe('shuffle', () => {
  it('is a permutation and does not mutate input', () => {
    const input = [1, 2, 3, 4, 5]
    const out = shuffle(input)
    expect(out.sort()).toEqual([1, 2, 3, 4, 5])
    expect(input).toEqual([1, 2, 3, 4, 5])
  })
})

describe('buildDeck', () => {
  it('creates exactly two cards per picked track with unique ids', () => {
    const deck = buildDeck(TRACKS, '4x4')
    expect(deck.cards).toHaveLength(16)
    expect(deck.columns).toBe(4)
    expect(new Set(deck.cards.map((c) => c.id)).size).toBe(16)
    const counts = {}
    for (const c of deck.cards) counts[c.uri] = (counts[c.uri] ?? 0) + 1
    expect(Object.values(counts).every((n) => n === 2)).toBe(true)
  })
  it('shrinks the board when not enough tracks match', () => {
    const deck = buildDeck(sample, '8x8')
    expect(deck.pairs).toBe(4)
    expect(deck.requestedPairs).toBe(32)
    expect(deck.cards).toHaveLength(8)
    expect(deck.columns).toBe(3)
  })
  it('auto uses all tracks', () => {
    expect(buildDeck(sample, 'auto').pairs).toBe(4)
  })
})

describe('scoring helpers', () => {
  it('finds leaders including ties', () => {
    const scores = [{ name: 'A', solved: 3 }, { name: 'B', solved: 5 }, { name: 'C', solved: 5 }]
    expect(leaders(scores).map((s) => s.name)).toEqual(['B', 'C'])
  })
  it('joins names', () => {
    expect(joinNames(['A'])).toBe('A')
    expect(joinNames(['A', 'B', 'C'])).toBe('A, B and C')
  })
})

describe('players', () => {
  it('names players A, B, … Z, AA', () => {
    expect(defaultPlayerName(0)).toBe('Player A')
    expect(defaultPlayerName(25)).toBe('Player Z')
    expect(defaultPlayerName(26)).toBe('Player AA')
  })
  it('always has a colour, even past the palette', () => {
    expect(playerColor(20)).toMatch(/^hsl/)
  })
  it('normalizes empty / bad player lists', () => {
    expect(normalizePlayers(null)).toEqual([{ name: 'Player A' }])
    expect(normalizePlayers([{ name: '  ' }, { name: 'Ann' }])).toEqual([{ name: 'Player A' }, { name: 'Ann' }])
  })
})

describe('catalogue', () => {
  it('has unique, valid track URIs and sane snippets', () => {
    expect(new Set(TRACKS.map((t) => t.uri)).size).toBe(TRACKS.length)
    for (const t of TRACKS) {
      expect(t.uri).toMatch(/^spotify:track:[A-Za-z0-9]{22}$/)
      expect(t.duration).toBeGreaterThan(1000)
      expect(t.tags.length).toBeGreaterThan(0)
    }
    expect(TAGS).toContain('deutsch')
  })
})
