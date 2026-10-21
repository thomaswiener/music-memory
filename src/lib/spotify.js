// Spotify Authorization Code + PKCE flow and a minimal Web API client.
// Docs: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow

import { load, save, remove, session } from './storage'

const AUTHORIZE_URL = 'https://accounts.spotify.com/authorize'
const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const API_URL = 'https://api.spotify.com/v1'
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-read-playback-state',
  'user-modify-playback-state',
]

const TOKEN_KEY = 'mm:token'
const VERIFIER_KEY = 'mm:pkce_verifier'
const STATE_KEY = 'mm:pkce_state'
const REFRESH_MARGIN_MS = 60_000

/**
 * Carries an i18n key (see `errors.*` in src/i18n/translations.js) instead of
 * display text, so the UI shows it in the current language via errorText().
 */
export class SpotifyError extends Error {
  constructor(i18nKey, { status = 0, code = '', params = {} } = {}) {
    super(i18nKey)
    this.name = 'SpotifyError'
    this.i18nKey = i18nKey
    this.params = params
    this.status = status
    this.code = code
  }
}

/** Derived from where the app is served, so it works on prod and on http://127.0.0.1:5173. */
export function redirectUri() {
  return `${window.location.origin}${import.meta.env.BASE_URL}callback`
}

// ---------------------------------------------------------------- PKCE ----

function randomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  // Cryptographically secure (v1 used Math.random for the verifier).
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

async function codeChallenge(verifier) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function beginLogin(clientId) {
  const verifier = randomString(128)
  const state = randomString(24)
  session.set(VERIFIER_KEY, verifier)
  session.set(STATE_KEY, state)

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri(),
    scope: SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: await codeChallenge(verifier),
    state,
  })
  window.location.assign(`${AUTHORIZE_URL}?${params}`)
}

/** Handles the ?code=…&state=… (or ?error=…) Spotify sends back. */
export async function completeLogin(clientId, params) {
  const verifier = session.get(VERIFIER_KEY)
  const expectedState = session.get(STATE_KEY)
  session.remove(VERIFIER_KEY)
  session.remove(STATE_KEY)

  const error = params.get('error')
  if (error) {
    throw error === 'access_denied'
      ? new SpotifyError('loginCancelled', { code: error })
      : new SpotifyError('loginFailed', { code: error, params: { detail: error } })
  }
  if (!verifier || !expectedState || params.get('state') !== expectedState) {
    throw new SpotifyError('loginUnverified', { code: 'state_mismatch' })
  }

  storeToken(
    await tokenRequest({
      client_id: clientId,
      grant_type: 'authorization_code',
      code: params.get('code'),
      redirect_uri: redirectUri(),
      code_verifier: verifier,
    }),
  )
}

// -------------------------------------------------------------- tokens ----

async function tokenRequest(body) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.access_token) {
    throw new SpotifyError('tokenFailed', {
      status: res.status === 400 ? 401 : res.status, // invalid_grant ⇒ treat as logged out
      code: data.error || 'token_error',
      params: { detail: data.error_description || data.error || res.status },
    })
  }
  return data
}

function storeToken(data) {
  const previous = load(TOKEN_KEY, null)
  save(TOKEN_KEY, {
    accessToken: data.access_token,
    // Spotify may or may not rotate the refresh token.
    refreshToken: data.refresh_token ?? previous?.refreshToken ?? null,
    expiresAt: Date.now() + data.expires_in * 1000,
  })
}

export const hasSession = () => Boolean(load(TOKEN_KEY, null)?.refreshToken)

export function clearSession() {
  remove(TOKEN_KEY)
}

let refreshInFlight = null

/** Returns a valid access token, refreshing at most once concurrently. */
export async function getAccessToken(clientId) {
  const token = load(TOKEN_KEY, null)
  if (!token?.accessToken) throw new SpotifyError('notConnected', { status: 401, code: 'no_session' })
  if (Date.now() < token.expiresAt - REFRESH_MARGIN_MS) return token.accessToken
  if (!token.refreshToken) throw new SpotifyError('sessionExpired', { status: 401, code: 'no_refresh' })

  refreshInFlight ??= tokenRequest({
    client_id: clientId,
    grant_type: 'refresh_token',
    refresh_token: token.refreshToken,
  })
    .then((data) => {
      storeToken(data)
      return data.access_token
    })
    .finally(() => {
      refreshInFlight = null
    })
  return refreshInFlight
}

// ----------------------------------------------------------------- API ----

/** Maps an API failure to an i18n key + params (texts in translations.js). */
function errorKey(status, apiMessage, reason) {
  if (status === 401) return ['sessionExpired']
  if (status === 403 && reason === 'PREMIUM_REQUIRED') return ['premiumRequired']
  if (status === 403) return apiMessage ? ['refusedDetail', { detail: apiMessage }] : ['refused']
  if (status === 404) return ['noActiveDevice']
  if (status === 429) return ['rateLimited']
  return apiMessage ? ['apiError', { detail: apiMessage }] : ['requestFailed', { status }]
}

export function createClient(getClientId) {
  async function request(method, path, { query, body } = {}) {
    const token = await getAccessToken(getClientId())
    const url = new URL(API_URL + path)
    for (const [k, v] of Object.entries(query ?? {})) if (v != null) url.searchParams.set(k, v)

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const text = await res.text()
    let data = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }

    if (!res.ok) {
      if (res.status === 401) clearSession()
      const reason = data?.error?.reason ?? ''
      const [key, params] = errorKey(res.status, data?.error?.message, reason)
      throw new SpotifyError(key, { status: res.status, code: reason, params })
    }
    return data
  }

  return {
    me: () => request('GET', '/me'),
    devices: async () => (await request('GET', '/me/player/devices'))?.devices ?? [],
    play: (deviceId, context_uri, uri, positionMs = 0) =>
      request('PUT', '/me/player/play', {
        query: { device_id: deviceId },
        body: {
          context_uri: context_uri,
          offset: { uri: uri },
          position_ms: positionMs
        },
      }),
    pause: (deviceId) => request('PUT', '/me/player/pause', { query: { device_id: deviceId } }),
  }
}
