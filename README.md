# Music Memory

A memory match game played by ear. Flip two tiles, each plays a short Spotify snippet, and pair the ones that sound the same.

Built with **Vue 3 + Vite** (v2 refactor of the original vanilla JS version).

## Run

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm test         # unit tests for the game logic
npm run build    # static site in dist/
```

Spotify only accepts loopback IPs for http redirect URIs, so open the dev server at
`http://127.0.0.1:5173` (not `localhost`). Add `http://127.0.0.1:5173/callback` to your
Spotify app's redirect URIs next to the production one.

Deploy `dist/` to any static host. `dist/callback/index.html` forwards Spotify's
`?code=…` to the app root, so no SPA rewrite rules are needed.

## Structure

```
src/
  data/tracks.js           track catalogue (uri, snippet start/duration, tags)
  lib/game.js              pure game logic: filtering, deck building, scoring (unit-tested)
  lib/spotify.js           PKCE auth, token refresh, Web API client
  lib/players.js           player names and colours
  lib/storage.js           safe localStorage/sessionStorage wrapper
  store.js                 persisted settings + toast notices
  composables/useSpotify.js  connection phase, profile, devices, snippet playback
  composables/useGame.js     game state machine, turns, persistence
  components/              TopNav, DeviceMenu, SetupGuide, GameBoard, MemoryCard,
                           SettingsModal, TagSelect, WinModal, BaseModal, AppToast
public/callback/index.html OAuth redirect target
tests/game.test.js
```

## Adding tracks

Add a line to `src/data/tracks.js`:

```js
t('<spotify track id>', startMs, durationMs, 'Artist', 'Title', ['90s', 'house']),
```

Tags are picked up automatically by the include/exclude filters.
