import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * Static health endpoint for uptime checks (Pingdom etc.). GitHub Pages has no
 * server code, so the build emits files instead:
 *   /health       → health.html (Pages serves /foo from foo.html, 200, no redirect)
 *   /health.json  → status + build info, to verify which commit is live
 * Unknown paths return 404.html with status 404, so these must be real files.
 */
function healthEndpoint() {
  return {
    name: 'health-endpoint',
    apply: 'build',
    generateBundle() {
      const info = {
        status: 'ok',
        commit: process.env.GITHUB_SHA ?? 'local',
        builtAt: new Date().toISOString(),
      }
      this.emitFile({ type: 'asset', fileName: 'health.json', source: `${JSON.stringify(info, null, 2)}\n` })
      this.emitFile({
        type: 'asset',
        fileName: 'health.html',
        source:
          '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex">' +
          `<title>ok</title>ok ${info.commit} ${info.builtAt}\n`,
      })
    },
  }
}

export default defineConfig({
  plugins: [vue(), healthEndpoint()],
  // Spotify only accepts loopback IPs (not "localhost") as http redirect URIs.
  server: { host: '127.0.0.1', port: 5173 },
  preview: { host: '127.0.0.1', port: 4173 },
  test: { environment: 'node' },
})
