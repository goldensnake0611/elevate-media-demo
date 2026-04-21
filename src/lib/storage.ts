'use client'

import { useCallback, useSyncExternalStore } from 'react'

export function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function storageEventName(key: string) {
  return `local-storage:${key}`
}

function emitKey(key: string) {
  try {
    window.dispatchEvent(new Event(storageEventName(key)))
  } catch {}
}

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const getSnapshot = useCallback((): T => {
    if (typeof window === 'undefined') return initialValue
    const parsed = safeJsonParse<T>(localStorage.getItem(key))
    return parsed !== null ? parsed : initialValue
  }, [initialValue, key])

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === 'undefined') return () => {}

      const onStorage = (e: StorageEvent) => {
        if (!e.key || e.key === key) onStoreChange()
      }
      const onLocal = () => onStoreChange()

      window.addEventListener('storage', onStorage)
      window.addEventListener(storageEventName(key), onLocal)
      return () => {
        window.removeEventListener('storage', onStorage)
        window.removeEventListener(storageEventName(key), onLocal)
      }
    },
    [key]
  )

  const value = useSyncExternalStore(subscribe, getSnapshot, () => initialValue)

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = getSnapshot()
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
      try {
        localStorage.setItem(key, JSON.stringify(resolved))
      } catch {}
      emitKey(key)
    },
    [getSnapshot, key]
  )

  return { value, setValue }
}
