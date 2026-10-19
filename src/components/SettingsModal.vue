<script setup>
import { computed, reactive, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import TagSelect from './TagSelect.vue'
import { settings } from '../store'
import { TAGS, TRACKS } from '../data/tracks'
import { BOARD_SIZES, filterTracks, parseBoardSize } from '../lib/game'
import { playerColor, defaultPlayerName, normalizePlayers } from '../lib/players'
import { spotify, disconnect } from '../composables/useSpotify'
import { newGame } from '../composables/useGame'
import { t, i18n, LANGUAGES } from '../i18n'

const props = defineProps({ open: Boolean })
const emit = defineEmits(['close'])

// Edit a draft; nothing changes until "Apply and reset".
const draft = reactive({ players: [], include: [], exclude: [], boardSize: '4x4', clientId: '' })

watch(
  () => props.open,
  (open) => {
    if (!open) return
    const copy = JSON.parse(JSON.stringify(settings))
    Object.assign(draft, {
      players: copy.players,
      include: copy.include,
      exclude: copy.exclude,
      boardSize: copy.boardSize,
      clientId: copy.clientId,
    })
  },
  { immediate: true },
)

const pool = computed(() => filterTracks(TRACKS, draft.include, draft.exclude).length)
const boardHint = computed(() => {
  const dims = parseBoardSize(draft.boardSize)
  const pairs = dims ? Math.min(dims.pairs, pool.value) : pool.value
  if (pool.value === 0) return t('settings.hintNone')
  const shrunk = dims && pool.value < dims.pairs
  return t(shrunk ? 'settings.hintShrunk' : 'settings.hint', {
    tracks: t('count.tracks', { count: pool.value }),
    pairs: t('count.pairs', { count: pairs }),
    cards: t('count.cards', { count: pairs * 2 }),
  })
})

const addPlayer = () => draft.players.push({ name: defaultPlayerName(draft.players.length) })
const removePlayer = (i) => draft.players.splice(i, 1)

function apply() {
  settings.players = normalizePlayers(draft.players)
  settings.include = [...draft.include]
  settings.exclude = [...draft.exclude]
  settings.boardSize = draft.boardSize
  const clientId = draft.clientId.trim()
  if (clientId !== settings.clientId) settings.clientId = clientId
  newGame()
  emit('close')
}
</script>

<template>
  <BaseModal :open="open" :title="t('settings.title')" @close="emit('close')">
    <form class="settings" @submit.prevent="apply">
      <fieldset>
        <legend>{{ t('settings.players') }}</legend>
        <ul class="players">
          <li v-for="(player, i) in draft.players" :key="i">
            <span class="dot" :style="{ background: playerColor(i) }" />
            <input
              v-model="player.name"
              class="field"
              :aria-label="t('settings.playerName', { n: i + 1 })"
              :placeholder="defaultPlayerName(i)"
              maxlength="24"
            />
            <button
              type="button"
              class="icon-btn danger"
              :disabled="draft.players.length === 1"
              :aria-label="t('settings.removePlayer', { name: player.name || defaultPlayerName(i) })"
              @click="removePlayer(i)"
            >
              <i class="bi bi-trash3" />
            </button>
          </li>
        </ul>
        <button type="button" class="link" @click="addPlayer"><i class="bi bi-plus-lg" /> {{ t('settings.addPlayer') }}</button>
      </fieldset>

      <div class="grid">
        <div>
          <span class="label">{{ t('settings.include') }}</span>
          <TagSelect v-model="draft.include" :options="TAGS" :disabled-options="draft.exclude" :placeholder="t('settings.includeAll')" />
        </div>
        <div>
          <span class="label">{{ t('settings.exclude') }}</span>
          <TagSelect v-model="draft.exclude" :options="TAGS" :disabled-options="draft.include" :placeholder="t('settings.excludeNone')" />
        </div>
        <div>
          <label class="label" for="board-size">{{ t('settings.boardSize') }}</label>
          <select id="board-size" v-model="draft.boardSize" class="field">
            <option v-for="size in BOARD_SIZES" :key="size" :value="size">
              {{ size === 'auto' ? t('settings.boardAuto') : size.replace('x', ' × ') }}
            </option>
          </select>
        </div>
        <div>
          <label class="label" for="language">{{ t('settings.language') }}</label>
          <select id="language" v-model="i18n.locale" class="field">
            <option v-for="lang in LANGUAGES" :key="lang.code" :value="lang.code" :lang="lang.code">{{ lang.label }}</option>
          </select>
        </div>
        <div class="span-2">
          <label class="label" for="settings-client-id">
            {{ t('settings.clientId') }}
            <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener">{{ t('settings.dashboard') }}</a>
          </label>
          <input id="settings-client-id" v-model="draft.clientId" class="field" autocomplete="off" spellcheck="false" />
        </div>
      </div>
      <p class="hint" :class="{ warn: pool === 0 }">{{ boardHint }}</p>

      <div class="actions">
        <button type="submit" class="btn primary" :disabled="pool === 0">{{ t('settings.apply') }}</button>
      </div>
    </form>

    <section v-if="spotify.profile" class="profile">
      <h3>{{ t('settings.loggedInAs') }}</h3>
      <div class="who">
        <img
          v-if="spotify.profile.images?.[0]?.url"
          :src="spotify.profile.images[0].url"
          alt=""
          width="40"
          height="40"
        />
        <dl>
          <dt>{{ t('settings.name') }}</dt><dd>{{ spotify.profile.display_name }}</dd>
          <dt>{{ t('settings.userId') }}</dt><dd>{{ spotify.profile.id }}</dd>
          <dt v-if="spotify.profile.email">{{ t('settings.email') }}</dt><dd v-if="spotify.profile.email">{{ spotify.profile.email }}</dd>
          <dt>{{ t('settings.profile') }}</dt>
          <dd>
            <a :href="spotify.profile.external_urls?.spotify" target="_blank" rel="noopener">{{ spotify.profile.uri }}</a>
          </dd>
        </dl>
      </div>
      <button type="button" class="link danger" @click="disconnect(); emit('close')">{{ t('settings.logout') }}</button>
    </section>
  </BaseModal>
</template>

<style scoped>
.settings {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
fieldset {
  border: 0;
  margin: 0;
  padding: 0;
}
legend,
.label,
h3 {
  display: block;
  margin-bottom: 6px;
  font-size: 15px;
  font-weight: 600;
}
.label a {
  margin-left: 6px;
  font-weight: 400;
  font-size: 14px;
}
.players {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 8px;
  margin: 0 0 8px;
  padding: 0;
  list-style: none;
}
.players li {
  display: flex;
  align-items: center;
  gap: 8px;
}
.players .dot {
  flex: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.players .field {
  flex: 1;
  min-width: 0;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.span-2 {
  grid-column: span 2;
}
@media (max-width: 560px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .span-2 {
    grid-column: auto;
  }
}
.hint {
  margin: -0.5rem 0 0;
  font-size: 14px;
  color: var(--muted);
}
.hint.warn {
  color: var(--danger);
}
/* Shared .btn/.link are 13px; settings uses +2px. */
.settings :is(.btn, .link),
.profile .link {
  font-size: 15px;
}
.actions {
  display: flex;
  justify-content: flex-end;
}
.profile {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--line);
  font-size: 15px;
}
.who {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.who img {
  border-radius: 50%;
  object-fit: cover;
}
dl {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 2px 12px;
  margin: 0;
}
dt {
  color: var(--muted);
}
dd {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
