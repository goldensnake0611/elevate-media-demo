'use client'

import { ReactNode } from 'react'
import { useAuth, type Role } from '@/lib/auth'

export default function RoleGuard({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return null
  if (!allow.includes(user.role)) {
    return (
      <div className="rounded-2xl border bg-[var(--panel-strong)] p-6">
        <div className="text-lg font-semibold">Access restricted</div>
        <div className="mt-2 text-sm text-[var(--muted)]">Your role does not have access to this module in the demo.</div>
      </div>
    )
  }
  return children
}

