import { beforeEach, describe, expect, it } from 'vitest'
import translations from '../src/i18n/translations'
import { i18n, t, tagLabel, errorText, joinNames, LANGUAGES } from '../src/i18n'
import { SpotifyError } from '../src/lib/spotify'
import { defaultPlayerName } from '../src/lib/players'

const PLURAL_FORMS = new Set(['zero', 'one', 'two', 'few', 'many', 'other'])
const isPlural = (node) =>
  node && typeof node === 'object' && Object.keys(node).every((k) => PLURAL_FORMS.has(k)) && 'other' in node

/** { 'a.b': 'text' | { one, other } } */
function flatten(node, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string' || isPlural(value)) out[path] = value
    else flatten(value, path, out)
  }
  return out
}
const placeholders = (msg) =>
  [...new Set((typeof msg === 'string' ? [msg] : Object.values(msg)).flatMap((m) => m.match(/\{\w+\}/g) ?? []))].sort()

const en = flatten(translations.en)

// Start every test in English, whatever the machine's locale is.
beforeEach(() => {
  i18n.locale = 'en'
})

describe('translations', () => {
  it('offers exactly the languages in the switch', () => {
    expect(Object.keys(translations).sort()).toEqual(LANGUAGES.map((l) => l.code).sort())
  })

  for (const locale of Object.keys(translations)) {
    it(`${locale}: has every key from en, and no extra keys`, () => {
      expect(Object.keys(flatten(translations[locale])).sort()).toEqual(Object.keys(en).sort())
    })

    it(`${locale}: uses the same {placeholders} as en`, () => {
      const msgs = flatten(translations[locale])
      for (const [key, msg] of Object.entries(en)) {
        expect(placeholders(msgs[key]), `${locale} ${key}`).toEqual(placeholders(msg))
      }
    })

    it(`${locale}: plural messages are plural everywhere`, () => {
      const msgs = flatten(translations[locale])
      for (const [key, msg] of Object.entries(en)) {
        expect(isPlural(msgs[key]), `${locale} ${key}`).toBe(isPlural(msg))
      }
    })
  }
})

describe('t()', () => {
  it('interpolates params and picks plural forms', () => {
    expect(t('count.pairs', { count: 1 })).toBe('1 pair')
    expect(t('count.pairs', { count: 8 })).toBe('8 pairs')
    i18n.locale = 'de'
    expect(t('count.moves', { count: 12 })).toBe('12 Zügen')
    expect(t('device.playingOn', { name: 'Mac' })).toBe('Wiedergabe auf Mac')
  })

  it('leaves unknown placeholders for <I18nT> slots', () => {
    expect(t('setup.step2')).toBe('Click {createApp}.')
  })

  it('falls back to the key when missing', () => {
    expect(t('does.not.exist')).toBe('does.not.exist')
  })

  it('translates tags, keeping unknown ones', () => {
    i18n.locale = 'fr'
    expect(tagLabel('deutsch')).toBe('allemand')
    expect(tagLabel('90s')).toBe('90s')
  })

  it('translates Spotify errors by key', () => {
    const err = new SpotifyError('requestFailed', { status: 500, params: { status: 500 } })
    expect(errorText(err)).toBe('Spotify request failed (500).')
    i18n.locale = 'es'
    expect(errorText(err)).toBe('La solicitud a Spotify falló (500).')
    expect(errorText(new Error('plain'))).toBe('plain')
  })

  it('joins names per language', () => {
    expect(joinNames(['A', 'B', 'C'])).toBe('A, B, and C')
    i18n.locale = 'de'
    expect(joinNames(['A', 'B', 'C'])).toBe('A, B und C')
  })

  it('names default players per language', () => {
    expect(defaultPlayerName(0)).toBe('Player A')
    i18n.locale = 'fr'
    expect(defaultPlayerName(1)).toBe('Joueur B')
  })
})
