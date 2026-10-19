import { t } from '../i18n'

const PALETTE = [
    '#373F51',
    '#008DD5',
    '#DFBBB1',
    '#E43F6F',
    '#89B6A5',
    '#FFCF9C',
    '#B96D40',
    '#3B1C32',
]

// Fixed palette for the first eight players, golden-angle hues after that,
// so any number of players gets a distinct colour.
export function playerColor(index) {
  return PALETTE[index] ?? `hsl(${Math.round((index * 137.508) % 360)} 65% 45%)`
}

export function defaultPlayerName(index) {
  let name = ''
  let n = index
  do {
    name = String.fromCharCode(65 + (n % 26)) + name
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return t('settings.defaultPlayer', { letter: name })
}

export function normalizePlayers(players) {
  const list = Array.isArray(players) ? players : []
  const cleaned = list
    .map((player, i) => ({ name: String(player?.name ?? '').trim() || defaultPlayerName(i) }))
  return cleaned.length ? cleaned : [{ name: defaultPlayerName(0) }]
}
