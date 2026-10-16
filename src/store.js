// Persisted user settings + transient notifications.

import { reactive, watch } from 'vue'
import { load, save, remove } from './lib/storage'
import { normalizePlayers } from './lib/players'
import { BOARD_SIZES } from './lib/game'

function migrateLegacy() {
  // v1 stored the client ID under a bare key; everything else is reset.
  const legacy = load('client_id', '')
  if (legacy && legacy !== 'null') save('mm:client_id', legacy)
  remove(
    'client_id', 'access_token', 'refresh_token', 'expires_at', 'verifier', 'rounds',
    'current_player_index', 'device_id', 'filter_tags', 'filter_tags_excluded', 'players',
    'player_stats', 'boardsize', 'shuffled_cards',
  )
}
migrateLegacy()

const asStringArray = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [])

export const settings = reactive({
  clientId: String(load('mm:client_id', '') ?? '').trim(),
  players: normalizePlayers(load('mm:players', null)),
  include: asStringArray(load('mm:include', [])),
  exclude: asStringArray(load('mm:exclude', [])),
  boardSize: BOARD_SIZES.includes(load('mm:board_size', '')) ? load('mm:board_size', '') : '4x4',
  deviceId: load('mm:device_id', null),
  debug: load('mm:debug', false) === true,
})

const persisted = {
  clientId: 'mm:client_id',
  players: 'mm:players',
  include: 'mm:include',
  exclude: 'mm:exclude',
  boardSize: 'mm:board_size',
  deviceId: 'mm:device_id',
  debug: 'mm:debug',
}
for (const [field, key] of Object.entries(persisted)) {
  watch(() => settings[field], (value) => save(key, value), { deep: true })
}

// ----------------------------------------------------------- notices ----

export const notice = reactive({ message: '', kind: 'info', id: 0 })
let noticeTimer

export function notify(message, kind = 'info', ms = 6000) {
  clearTimeout(noticeTimer)
  Object.assign(notice, { message, kind, id: notice.id + 1 })
  if (ms) noticeTimer = setTimeout(dismissNotice, ms)
}

export function dismissNotice() {
  clearTimeout(noticeTimer)
  notice.message = ''
}
