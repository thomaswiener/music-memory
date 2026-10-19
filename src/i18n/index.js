// Tiny i18n layer: reactive locale, t() with {param} interpolation and
// plural forms (via Intl.PluralRules). All texts live in ./translations.js.

import { reactive, watch } from 'vue'
import translations from './translations'
import { load, save } from '../lib/storage'

export const LANGUAGES = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
]
const SUPPORTED = LANGUAGES.map((l) => l.code)
const FALLBACK = 'en'
const STORAGE_KEY = 'mm:locale'

function detectLocale() {
  const stored = load(STORAGE_KEY, null)
  if (SUPPORTED.includes(stored)) return stored
  const preferred = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : []
  for (const tag of preferred) {
    const base = String(tag ?? '').toLowerCase().split('-')[0]
    if (SUPPORTED.includes(base)) return base
  }
  return FALLBACK
}

export const i18n = reactive({ locale: detectLocale() })

watch(
  () => i18n.locale,
  (locale) => {
    save(STORAGE_KEY, locale)
    if (typeof document !== 'undefined') document.documentElement.lang = locale
  },
  { immediate: true },
)

function lookup(locale, key) {
  let node = translations[locale]
  for (const part of key.split('.')) {
    if (node == null || typeof node !== 'object') return undefined
    node = node[part]
  }
  return node
}

const pluralRules = {}
function pluralForm(locale, count) {
  pluralRules[locale] ??= new Intl.PluralRules(locale)
  return pluralRules[locale].select(Number(count) || 0)
}

function interpolate(message, params) {
  return message.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match))
}

/**
 * Translate `key` (dot path) for the current locale, falling back to English,
 * then to the key itself. A message given as { one, other, … } picks its
 * plural form from `params.count`. Placeholders without a param stay as-is,
 * so <I18nT> can fill them with markup.
 */
export function t(key, params = {}) {
  const locale = i18n.locale
  let message = lookup(locale, key) ?? lookup(FALLBACK, key)
  if (message && typeof message === 'object') {
    message = message[pluralForm(locale, params.count)] ?? message.other
  }
  if (typeof message !== 'string') return key
  return interpolate(message, params)
}

/** Display name for a track tag; tags without a translation show as-is. */
export function tagLabel(tag) {
  const label = lookup(i18n.locale, `tags.${tag}`) ?? lookup(FALLBACK, `tags.${tag}`)
  return typeof label === 'string' ? label : tag
}

/** User-facing text for an error: translated if it carries an i18n key. */
export function errorText(err) {
  if (!err) return ''
  if (err.i18nKey) return t(`errors.${err.i18nKey}`, err.params ?? {})
  return err.message ?? String(err)
}

/** "A, B and C" in the current language. */
export function joinNames(names) {
  return new Intl.ListFormat(i18n.locale, { style: 'long', type: 'conjunction' }).format(names)
}
