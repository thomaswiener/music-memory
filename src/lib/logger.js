const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 }
let threshold = LEVELS.info

export function setLogLevel(level) {
  threshold = LEVELS[level] ?? LEVELS.info
}

const emit = (level) => (...args) => {
  if (LEVELS[level] >= threshold) console[level]('[music-memory]', ...args)
}

export const log = {
  debug: emit('debug'),
  info: emit('info'),
  warn: emit('warn'),
  error: emit('error'),
}
