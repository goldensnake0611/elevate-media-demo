'use client'

import { Trash2 } from 'lucide-react'
import SectionHeader from '@/components/SectionHeader'
import Badge from '@/components/Badge'
import { useAuth } from '@/lib/auth'
import { useDemoDb } from '@/lib/db'

const KEYS_TO_RESET = [
  'elevate_db_v1',
  'elevate_audit_v1',
  'elevate_auth_v1',
  'selected_scan_tokens_v1',
]

export default function SettingsPage() {
  const { user } = useAuth()
  const { audit } = useDemoDb()

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Settings"
        subtitle="Demo controls, audit trail, and notes on how the production build would work."
        right={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border bg-[var(--panel-strong)] px-3 py-2 text-sm hover:bg-white/8"
            onClick={() => {
              KEYS_TO_RESET.forEach(k => {
                try {
                  localStorage.removeItem(k)
                } catch {}
              })
              window.location.href = '/login'
            }}
          >
            <Trash2 size={16} /> Reset demo
          </button>
        }
      />

      <div className="rounded-2xl border bg-[var(--panel-strong)] p-4">
        <div className="text-sm font-semibold">Current session</div>
        <div className="mt-2 text-sm text-[var(--muted)]">
          Logged in as <span className="font-semibold text-[var(--foreground)]">{user?.email}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Badge tone="info">Role: {user?.role}</Badge>
          <Badge tone="default">Manual-entry V1 (no integrations)</Badge>
          <Badge tone="default">Local demo storage</Badge>
        </div>
      </div>

      <div className="rounded-2xl border bg-[var(--panel-strong)] p-4">
        <div className="text-sm font-semibold">Audit trail (demo)</div>
        <div className="text-xs text-[var(--muted)]">Key changes are tracked for review. In production this would be immutable and stored in the database.</div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-black/30">
              <tr className="text-left text-xs text-[var(--muted)]">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Field</th>
                <th className="py-3 px-4">From → To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {audit.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 px-4 text-[var(--muted)]">
                    No audit entries yet. Try moving a lead stage, saving a standup, or editing a client profile.
                  </td>
                </tr>
              )}
              {audit.slice(0, 50).map(a => (
                <tr key={a.id} className="hover:bg-white/3">
                  <td className="py-3 px-4 text-[var(--muted)]">{new Date(a.at).toLocaleString()}</td>
                  <td className="py-3 px-4">{a.actor}</td>
                  <td className="py-3 px-4 text-[var(--muted)]">{a.module}</td>
                  <td className="py-3 px-4 font-semibold">{a.entityLabel}</td>
                  <td className="py-3 px-4 text-[var(--muted)]">{a.field}</td>
                  <td className="py-3 px-4 text-[var(--muted)]">
                    {(a.from ?? '—')} → {(a.to ?? '—')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border bg-[var(--panel-strong)] p-4">
        <div className="text-sm font-semibold">Production build notes</div>
        <div className="mt-2 text-sm text-[var(--muted)] space-y-2">
          <div>- Auth: email/password + role-based access (e.g., NextAuth/Auth.js or custom JWT) with RBAC.</div>
          <div>- Database: Postgres + Prisma, full CRUD for all modules, plus immutable audit log tables.</div>
          <div>- Notifications: stored rules + scheduled jobs, in-app notification center, optional email/WhatsApp in V2.</div>
          <div>- Exports: server-side CSV/PDF generation for consistent formatting.</div>
        </div>
      </div>
    </div>
  )
}

