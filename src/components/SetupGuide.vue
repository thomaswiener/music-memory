<script setup>
import { ref } from 'vue'
import { settings } from '../store'
import { spotify, connect } from '../composables/useSpotify'
import { redirectUri } from '../lib/spotify'

const clientId = ref(settings.clientId)
const copied = ref(false)
const uri = redirectUri()

async function copyUri() {
  try {
    await navigator.clipboard.writeText(uri)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    /* clipboard unavailable — the URI is still selectable */
  }
}

function saveAndConnect() {
  const id = clientId.value.trim()
  if (!id) return
  settings.clientId = id
  connect()
}
</script>

<template>
  <section class="onboarding">
    <!-- Client ID known, just no session: one-click reconnect -->
    <template v-if="spotify.phase === 'login'">
      <h1>Music Memory</h1>
      <p>Connect your Spotify account to start playing.</p>
      <p v-if="spotify.error" class="error" role="alert">{{ spotify.error }}</p>
      <button type="button" class="btn primary" @click="connect">
        <i class="bi bi-spotify" /> Connect Spotify
      </button>
      <button type="button" class="link" @click="settings.clientId = ''">Use a different Client ID</button>
    </template>

    <template v-else>
      <h1>Music Memory</h1>
      <p>
        A memory match game played by ear: flip two tiles, each plays a short music snippet, and pair the
        ones that sound the same. It turns visual recall into a test of musical memory.
      </p>
      <p>
        <strong>It needs your own Spotify app and Spotify Premium, and plays music on a device connected to
        your account.</strong> Set it up once:
      </p>

      <ol class="steps">
        <li>
          Open the <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener">Spotify Developer Dashboard</a>
          and log in.
        </li>
        <li>Click <em>Create app</em>.</li>
        <li>
          Fill in:
          <dl>
            <dt>App name</dt><dd>music-memory</dd>
            <dt>App description</dt><dd>music-memory</dd>
            <dt>Redirect URI</dt>
            <dd class="uri">
              <code>{{ uri }}</code>
              <button type="button" class="link" @click="copyUri">{{ copied ? 'copied' : 'copy' }}</button>
            </dd>
            <dt>APIs used</dt><dd>Web API and Web Playback SDK</dd>
          </dl>
        </li>
        <li>Accept the terms and click <em>Save</em>.</li>
        <li>
          Open the app, copy its <em>Client ID</em> and paste it below. You'll then log in with your Spotify
          account. Keep Spotify open on a device so there's somewhere to play.
        </li>
      </ol>

      <form class="client-form" @submit.prevent="saveAndConnect">
        <label for="client-id">Spotify Client ID</label>
        <div class="row">
          <input
            id="client-id"
            v-model="clientId"
            class="field"
            autocomplete="off"
            spellcheck="false"
            placeholder="e.g. 1a2b3c4d5e6f…"
            required
          />
          <button type="submit" class="btn primary">Save &amp; connect</button>
        </div>
      </form>
      <p v-if="spotify.error" class="error" role="alert">{{ spotify.error }}</p>
    </template>
  </section>
</template>

<style scoped>
.onboarding {
  width: min(640px, 100%);
  padding: 48px 16px;
  line-height: 1.6;
  font-size: 14px;
}
h1 {
  margin: 0 0 1rem;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted);
}
.steps {
  counter-reset: step;
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
}
.steps > li {
  counter-increment: step;
  position: relative;
  padding: 0 0 1rem 2.5rem;
}
.steps > li::before {
  content: counter(step);
  position: absolute;
  left: 0;
  top: 0;
  width: 1.75rem;
  height: 1.75rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--card-back);
  font-size: 12px;
}
dl {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 2px 16px;
  margin: 0.5rem 0 0;
  font-size: 13px;
}
dt {
  color: var(--muted);
}
dd {
  margin: 0;
  min-width: 0;
}
.uri {
  display: flex;
  gap: 8px;
  align-items: baseline;
}
code {
  overflow-wrap: anywhere;
  background: var(--card-back);
  padding: 1px 6px;
  border-radius: 4px;
}
.client-form label {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 600;
}
.row {
  display: flex;
  gap: 8px;
}
.row .field {
  flex: 1;
  min-width: 0;
}
.btn .bi {
  margin-right: 6px;
}
.link {
  display: block;
  margin-top: 1rem;
}
.uri .link {
  display: inline;
  margin: 0;
}
@media (max-width: 480px) {
  .row {
    flex-direction: column;
  }
  dl {
    grid-template-columns: 1fr;
  }
  dd {
    margin-bottom: 6px;
  }
}
</style>
