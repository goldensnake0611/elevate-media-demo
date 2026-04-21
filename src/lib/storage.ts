'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

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

  const getSnapshot = useCallback((): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(key)
  }, [key])

  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null)

  const value = useMemo(() => {
    const parsed = safeJsonParse<T>(raw)
    return parsed !== null ? parsed : initialValue
  }, [initialValue, raw])

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prevRaw = typeof window === 'undefined' ? null : localStorage.getItem(key)
      const prevParsed = safeJsonParse<T>(prevRaw)
      const prev = prevParsed !== null ? prevParsed : initialValue
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
      const nextRaw = JSON.stringify(resolved)
      try {
        if (typeof window === 'undefined') return
        if (prevRaw === nextRaw) return
        localStorage.setItem(key, nextRaw)
      } catch {}
      emitKey(key)
    },
    [initialValue, key]
  )

  return { value, setValue }
}
