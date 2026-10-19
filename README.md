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
  i18n/translations.js     all UI texts (de, en, fr, es)
  i18n/index.js            t(), language detection and switch
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

## Translations

All UI text lives in `src/i18n/translations.js`, one block per language
(`de`, `en`, `fr`, `es`). The app starts in the browser's language (falling back
to English) and remembers the choice made under Settings → Language.

- Use texts in components with `t('settings.title')`; parameters fill
  `{placeholders}`: `t('device.playingOn', { name })`.
- Plurals are written as `{ one: '…', other: '…' }` and picked from `count`:
  `t('count.pairs', { count: 3 })`.
- Sentences containing a link or emphasis use `<I18nT k="…">` with a named slot
  per placeholder, so word order can differ per language.
- To add a language, copy the `en` block, translate it and add it to
  `LANGUAGES` in `src/i18n/index.js`. `npm test` checks that every language has
  the same keys and placeholders as English.
