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
  if (pool.value === 0) return 'No tracks match these filters.'
  const shrunk = dims && pool.value < dims.pairs ? ` (board shrinks: only ${pool.value} tracks match)` : ''
  return `${pool.value} tracks match → ${pairs} pairs, ${pairs * 2} cards${shrunk}`
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
  <BaseModal :open="open" title="Settings" @close="emit('close')">
    <form class="settings" @submit.prevent="apply">
      <fieldset>
        <legend>Players</legend>
        <ul class="players">
          <li v-for="(player, i) in draft.players" :key="i">
            <span class="dot" :style="{ background: playerColor(i) }" />
            <input
              v-model="player.name"
              class="field"
              :aria-label="`Player ${i + 1} name`"
              :placeholder="defaultPlayerName(i)"
              maxlength="24"
            />
            <button
              type="button"
              class="icon-btn danger"
              :disabled="draft.players.length === 1"
              :aria-label="`Remove ${player.name || defaultPlayerName(i)}`"
              @click="removePlayer(i)"
            >
              <i class="bi bi-trash3" />
            </button>
          </li>
        </ul>
        <button type="button" class="link" @click="addPlayer"><i class="bi bi-plus-lg" /> Add player</button>
      </fieldset>

      <div class="grid">
        <div>
          <span class="label">Include (genres/decades)</span>
          <TagSelect v-model="draft.include" :options="TAGS" :disabled-options="draft.exclude" placeholder="All tracks" />
        </div>
        <div>
          <span class="label">Exclude</span>
          <TagSelect v-model="draft.exclude" :options="TAGS" :disabled-options="draft.include" placeholder="Nothing excluded" />
        </div>
        <div>
          <label class="label" for="board-size">Board size</label>
          <select id="board-size" v-model="draft.boardSize" class="field">
            <option v-for="size in BOARD_SIZES" :key="size" :value="size">
              {{ size === 'auto' ? 'Auto (all matching tracks)' : size.replace('x', ' × ') }}
            </option>
          </select>
        </div>
        <div>
          <label class="label" for="settings-client-id">
            Spotify Client ID
            <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener">Dashboard</a>
          </label>
          <input id="settings-client-id" v-model="draft.clientId" class="field" autocomplete="off" spellcheck="false" />
        </div>
      </div>
      <p class="hint" :class="{ warn: pool === 0 }">{{ boardHint }}</p>

      <div class="actions">
        <button type="submit" class="btn primary" :disabled="pool === 0">Apply and reset</button>
      </div>
    </form>

    <section v-if="spotify.profile" class="profile">
      <h3>Logged in as</h3>
      <div class="who">
        <img
          v-if="spotify.profile.images?.[0]?.url"
          :src="spotify.profile.images[0].url"
          alt=""
          width="40"
          height="40"
        />
        <dl>
          <dt>Name</dt><dd>{{ spotify.profile.display_name }}</dd>
          <dt>User ID</dt><dd>{{ spotify.profile.id }}</dd>
          <dt v-if="spotify.profile.email">Email</dt><dd v-if="spotify.profile.email">{{ spotify.profile.email }}</dd>
          <dt>Profile</dt>
          <dd>
            <a :href="spotify.profile.external_urls?.spotify" target="_blank" rel="noopener">{{ spotify.profile.uri }}</a>
          </dd>
        </dl>
      </div>
      <button type="button" class="link danger" @click="disconnect(); emit('close')">Log out</button>
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
@media (max-width: 560px) {
  .grid {
    grid-template-columns: 1fr;
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
