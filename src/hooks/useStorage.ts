// Chrome storage API — three hooks: session, local, sync.
// https://developer.chrome.com/docs/extensions/reference/api/storage#example-session
//
// All use the same API: [value, setValue] = useStorage(key, defaultValue).
// Export `useStorage` as an alias for whichever option you pick.
//
// Example (same for session, local, and sync — only the backend differs):
//
//   const [formData, setFormData] = useStorage<{ query: string }>('my-tab-form', { query: '' })
//
//   // Read
//   <input value={formData.query} onChange={e => setFormData({ ...formData, query: e.target.value })} />
//
//   // Write (persists to storage and updates state)
//   setFormData({ query: 'new value' })
//
// session — in-memory; cleared when extension reloads or browser restarts. Per-session state (e.g. form drafts).
// local   — persisted on device; ~10 MB. Settings, larger data. Cleared when extension is removed.
// sync    — synced across Chrome when user is signed in; ~100 KB total, 8 KB per item. User preferences.

import { useEffect, useState } from 'react'

// ── chrome.storage.session ───────────────────────────────────────────────────

export const useStorageSession = <T>(key: string, defaultValue: T): [T, (value: T) => void] => {
  const [state, setState] = useState<T>(defaultValue)

  useEffect(() => {
    chrome.storage.session.get(key).then(result => {
      if (result[key] !== undefined) {
        setState(result[key] as T)
      }
    })
  }, [key])

  useEffect(() => {
    const handleChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string
    ) => {
      if (area === 'session' && key in changes) {
        setState(changes[key].newValue as T)
      }
    }
    chrome.storage.onChanged.addListener(handleChange)
    return () => chrome.storage.onChanged.removeListener(handleChange)
  }, [key])

  const setValue = (value: T) => {
    setState(value)
    chrome.storage.session.set({ [key]: value })
  }

  return [state, setValue]
}

// ── chrome.storage.local ─────────────────────────────────────────────────────

export const useStorageLocal = <T>(key: string, defaultValue: T): [T, (value: T) => void] => {
  const [state, setState] = useState<T>(defaultValue)

  useEffect(() => {
    chrome.storage.local.get(key).then(result => {
      if (result[key] !== undefined) {
        setState(result[key] as T)
      }
    })
  }, [key])

  useEffect(() => {
    const handleChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string
    ) => {
      if (area === 'local' && key in changes) {
        setState(changes[key].newValue as T)
      }
    }
    chrome.storage.onChanged.addListener(handleChange)
    return () => chrome.storage.onChanged.removeListener(handleChange)
  }, [key])

  const setValue = (value: T) => {
    setState(value)
    chrome.storage.local.set({ [key]: value })
  }

  return [state, setValue]
}

// ── chrome.storage.sync ──────────────────────────────────────────────────────

export const useStorageSync = <T>(key: string, defaultValue: T): [T, (value: T) => void] => {
  const [state, setState] = useState<T>(defaultValue)

  useEffect(() => {
    chrome.storage.sync.get(key).then(result => {
      if (result[key] !== undefined) {
        setState(result[key] as T)
      }
    })
  }, [key])

  useEffect(() => {
    const handleChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string
    ) => {
      if (area === 'sync' && key in changes) {
        setState(changes[key].newValue as T)
      }
    }
    chrome.storage.onChanged.addListener(handleChange)
    return () => chrome.storage.onChanged.removeListener(handleChange)
  }, [key])

  const setValue = (value: T) => {
    setState(value)
    chrome.storage.sync.set({ [key]: value })
  }

  return [state, setValue]
}

// ── Active export — change this alias to switch storage backend ───────────────
export { useStorageSession as useStorage }
