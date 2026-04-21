'use client'

import { createContext, ReactNode, useCallback, useContext, useMemo } from 'react'
import { useLocalStorageState } from '@/lib/storage'

export type Role = 'CEO' | 'SALES' | 'OPS'

export type User = {
  email: string
  role: Role
  name: string
}

type AuthState = {
  user: User | null
  login: (params: { email: string; password: string }) => Promise<{ ok: true } | { ok: false; error: string }>
  logout: () => void
}

const AUTH_STORAGE_KEY = 'elevate_auth_v1'

const AuthContext = createContext<AuthState | null>(null)

function getRoleForEmail(email: string): Role {
  const e = email.toLowerCase()
  if (e.includes('ceo') || e.includes('founder')) return 'CEO'
  if (e.includes('sales')) return 'SALES'
  if (e.includes('ops') || e.includes('operation')) return 'OPS'
  return 'CEO'
}

function getNameForEmail(email: string): string {
  const prefix = email.split('@')[0] || 'User'
  const words = prefix
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(w => w.slice(0, 1).toUpperCase() + w.slice(1))
  return words.join(' ') || 'User'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { value: user, setValue: setUser } = useLocalStorageState<User | null>(AUTH_STORAGE_KEY, null)

  const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
    if (!email.trim()) return { ok: false as const, error: 'Email is required.' }
    if (!password.trim()) return { ok: false as const, error: 'Password is required.' }

    const role = getRoleForEmail(email)
    const nextUser: User = {
      email,
      role,
      name: getNameForEmail(email),
    }

    setUser(nextUser)
    return { ok: true as const }
  }, [setUser])

  const logout = useCallback(() => {
    setUser(null)
  }, [setUser])

  const value = useMemo<AuthState>(() => ({ user, login, logout }), [user, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
