// Thin, failure-tolerant wrapper around localStorage (private mode / blocked
// storage must never break the game). Values are stored as JSON.

function store() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function load(key, fallback) {
  const raw = store()?.getItem(key)
  if (raw == null) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    // Legacy keys from v1 were written as plain strings.
    return typeof fallback === 'string' || fallback === null ? raw : fallback
  }
}

export function save(key, value) {
  try {
    if (value === undefined || value === null) store()?.removeItem(key)
    else store()?.setItem(key, JSON.stringify(value))
  } catch {
    /* quota or access errors are non-fatal */
  }
}

export function remove(...keys) {
  for (const key of keys) {
    try {
      store()?.removeItem(key)
    } catch {
      /* ignore */
    }
  }
}

export const session = {
  get: (key) => {
    try {
      return window.sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  set: (key, value) => {
    try {
      window.sessionStorage.setItem(key, value)
    } catch {
      /* ignore */
    }
  },
  remove: (key) => {
    try {
      window.sessionStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  },
}
