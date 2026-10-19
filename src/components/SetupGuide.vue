<script setup>
import { ref } from 'vue'
import { settings } from '../store'
import { spotify, connect } from '../composables/useSpotify'
import { redirectUri } from '../lib/spotify'
import { t, errorText } from '../i18n'
import I18nT from '../i18n/I18nT'

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
      <p>{{ t('setup.connectIntro') }}</p>
      <p v-if="spotify.error" class="error" role="alert">{{ errorText(spotify.error) }}</p>
      <button type="button" class="btn primary" @click="connect">
        <i class="bi bi-spotify" /> {{ t('setup.connect') }}
      </button>
      <button type="button" class="link" @click="settings.clientId = ''">{{ t('setup.otherClientId') }}</button>
    </template>

    <template v-else>
      <h1>Music Memory</h1>
      <p>{{ t('setup.intro') }}</p>
      <p>
        <strong>{{ t('setup.requirements') }}</strong> {{ t('setup.setupOnce') }}
      </p>

      <ol class="steps">
        <li>
          <I18nT k="setup.step1">
            <template #dashboard>
              <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener">{{ t('setup.dashboard') }}</a>
            </template>
          </I18nT>
        </li>
        <li>
          <I18nT k="setup.step2"><template #createApp><em>Create app</em></template></I18nT>
        </li>
        <li>
          {{ t('setup.step3') }}
          <!-- Spotify's form labels, kept in English to match the dashboard -->
          <dl>
            <dt>App name</dt><dd>music-memory</dd>
            <dt>App description</dt><dd>music-memory</dd>
            <dt>Redirect URI</dt>
            <dd class="uri">
              <code>{{ uri }}</code>
              <button type="button" class="link" @click="copyUri">{{ copied ? t('setup.copied') : t('setup.copy') }}</button>
            </dd>
            <dt>APIs used</dt><dd>Web API, Web Playback SDK</dd>
          </dl>
        </li>
        <li>
          <I18nT k="setup.step4"><template #save><em>Save</em></template></I18nT>
        </li>
        <li>
          <I18nT k="setup.step5"><template #clientId><em>Client ID</em></template></I18nT>
        </li>
      </ol>

      <form class="client-form" @submit.prevent="saveAndConnect">
        <label for="client-id">{{ t('setup.clientIdLabel') }}</label>
        <div class="row">
          <input
            id="client-id"
            v-model="clientId"
            class="field"
            autocomplete="off"
            spellcheck="false"
            :placeholder="t('setup.placeholder')"
            required
          />
          <button type="submit" class="btn primary">{{ t('setup.saveConnect') }}</button>
        </div>
      </form>
      <p v-if="spotify.error" class="error" role="alert">{{ errorText(spotify.error) }}</p>
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
