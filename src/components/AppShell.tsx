'use client'

import { ReactNode, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Building2, CreditCard, LayoutDashboard, LogOut, Menu, Settings, Sparkles, Target, UsersRound } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useDemoDb } from '@/lib/db'
import { getAlerts } from '@/lib/notifications'

type NavItem = {
  href: string
  label: string
  icon: ReactNode
  roles: Array<'CEO' | 'SALES' | 'OPS'>
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { db } = useDemoDb()
  const [mobileOpen, setMobileOpen] = useState(false)

  const alerts = useMemo(() => getAlerts(db), [db])

  const nav: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, roles: ['CEO', 'SALES', 'OPS'] },
    { href: '/clients', label: 'Client Hub', icon: <Building2 size={18} />, roles: ['CEO', 'SALES', 'OPS'] },
    { href: '/sales', label: 'Sales Tracker', icon: <Target size={18} />, roles: ['CEO', 'SALES'] },
    { href: '/finance', label: 'Finance', icon: <CreditCard size={18} />, roles: ['CEO'] },
    { href: '/ops', label: 'Team & Tasks', icon: <UsersRound size={18} />, roles: ['CEO', 'OPS'] },
    { href: '/settings', label: 'Settings', icon: <Settings size={18} />, roles: ['CEO', 'SALES', 'OPS'] },
  ]

  const visibleNav = nav.filter(i => (user ? i.roles.includes(user.role) : false))

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/' || pathname?.startsWith('/dashboard')
    return pathname?.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-[var(--panel)] hover:bg-[var(--panel-strong)]"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle navigation"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-wide">Elevate Media</div>
                <div className="text-xs text-[var(--muted)]">Internal Agency OS — Demo</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard#alerts"
              className="relative inline-flex h-10 items-center gap-2 rounded-xl border bg-[var(--panel)] px-3 hover:bg-[var(--panel-strong)]"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="hidden sm:inline text-sm">Alerts</span>
              {alerts.length > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-xs font-semibold text-black">
                  {alerts.length}
                </span>
              )}
            </Link>
            <div className="hidden sm:flex items-center gap-3 rounded-xl border bg-[var(--panel)] px-3 h-10">
              <div className="text-sm">
                <span className="font-semibold">{user?.name ?? 'User'}</span>
                <span className="text-[var(--muted)]"> · {user?.role}</span>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl border bg-[var(--panel)] px-3 hover:bg-[var(--panel-strong)]"
              onClick={() => {
                logout()
                router.replace('/login')
              }}
            >
              <LogOut size={18} />
              <span className="hidden sm:inline text-sm">Logout</span>
            </button>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
          <aside
            className={[
              'rounded-2xl border bg-[var(--panel)] p-3 lg:block',
              mobileOpen ? 'block' : 'hidden',
            ].join(' ')}
          >
            <nav className="flex flex-col gap-1">
              {visibleNav.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                    isActive(item.href)
                      ? 'bg-[var(--panel-strong)] text-[var(--foreground)] border border-[var(--border)]'
                      : 'text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]',
                  ].join(' ')}
                >
                  <span className="text-[var(--foreground)]">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          <main className="rounded-2xl border bg-[var(--panel)] p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

