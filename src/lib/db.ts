'use client'

import { useCallback, useMemo } from 'react'
import { DEMO_DB, type Database } from '@/lib/demoData'
import { useLocalStorageState } from '@/lib/storage'
import { AuditEntry } from '@/lib/types'

const DB_KEY = 'elevate_db_v1'
const AUDIT_KEY = 'elevate_audit_v1'

function uuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

export function useDemoDb() {
  const { value: db, setValue: setDb } = useLocalStorageState<Database>(DB_KEY, DEMO_DB)
  const { value: audit, setValue: setAudit } = useLocalStorageState<AuditEntry[]>(AUDIT_KEY, [])

  const appendAudit = useCallback(
    (entry: Omit<AuditEntry, 'id' | 'at'>) => {
      setAudit(prev => [{ id: uuid(), at: Date.now(), ...entry }, ...prev].slice(0, 500))
    },
    [setAudit]
  )

  const updateDb = useCallback(
    (updater: (prev: Database) => Database) => {
      setDb(prev => updater(prev))
    },
    [setDb]
  )

  const api = useMemo(() => ({ db, updateDb, audit, appendAudit }), [db, updateDb, audit, appendAudit])
  return api
}
