const STORAGE_KEY = 'contentbloom_history'
const MAX_HISTORY_ITEMS = 50

export function saveContentHistory(item) {
  try {
    const existing = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]'
    )

    const history = Array.isArray(existing) ? existing : []

    const entry = {
      id: globalThis.crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      ...item,
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([entry, ...history].slice(0, MAX_HISTORY_ITEMS))
    )

    return entry
  } catch {
    return null
  }
}

export function updateContentHistoryItem(id, updates) {
  try {
    const history = getContentHistory()
    const index = history.findIndex((item) => item.id === id)
    if (index === -1) {
      return saveContentHistory({ id, ...updates })
    }
    history[index] = {
      ...history[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    return history[index]
  } catch {
    return null
  }
}

export function getContentHistory() {
  try {
    const history = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]'
    )

    return Array.isArray(history) ? history : []
  } catch {
    return []
  }
}

export function deleteContentHistoryItem(id) {
  try {
    const history = getContentHistory().filter((item) => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    return history
  } catch {
    return getContentHistory()
  }
}

export function clearContentHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage may be unavailable in private or restricted browsing contexts.
  }
}
