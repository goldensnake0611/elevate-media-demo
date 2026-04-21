'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { ChevronLeft, Download, MessageSquare, Pencil, Save } from 'lucide-react'
import SectionHeader from '@/components/SectionHeader'
import Badge from '@/components/Badge'
import { useAuth } from '@/lib/auth'
import { useDemoDb } from '@/lib/db'
import { createPdfBlob, downloadCsv } from '@/lib/export'

function money(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

type Tab = 'overview' | 'payments' | 'updates' | 'comms'
type ClientStatus = 'Active' | 'Paused' | 'At Risk'
type ClientHealth = 'green' | 'yellow' | 'red'

export default function ClientProfilePage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const { user } = useAuth()
  const { db, updateDb, appendAudit } = useDemoDb()
  const [tab, setTab] = useState<Tab>('overview')
  const [isEditing, setIsEditing] = useState(false)

  const client = db.clients.find(c => c.id === id)

  const payments = useMemo(() => db.payments.filter(p => p.clientId === id).slice().sort((a, b) => (a.date < b.date ? 1 : -1)), [db.payments, id])
  const updates = useMemo(() => db.weeklyUpdates.filter(u => u.clientId === id).slice().sort((a, b) => (a.weekOf < b.weekOf ? 1 : -1)), [db.weeklyUpdates, id])
  const comms = useMemo(() => db.comms.filter(m => m.clientId === id).slice().sort((a, b) => (a.date < b.date ? 1 : -1)), [db.comms, id])

  const [draft, setDraft] = useState(() => ({
    owner: client?.owner ?? '',
    status: client?.status ?? 'Active',
    health: client?.health ?? 'green',
    notes: client?.notes ?? '',
  }))

  if (!client) {
    return (
      <div className="space-y-4">
        <SectionHeader title="Client not found" subtitle="This client ID does not exist in the demo database." />
        <Link href="/clients" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
          <ChevronLeft size={16} /> Back to Client Hub
        </Link>
      </div>
    )
  }

  function beginEdit() {
    const current = client!
    setDraft({ owner: current.owner, status: current.status, health: current.health, notes: current.notes })
    setIsEditing(true)
  }

  function save() {
    const current = client!
    setIsEditing(false)
    updateDb(prev => {
      const next = { ...prev, clients: prev.clients.map(c => (c.id !== id ? c : { ...c, ...draft, lastUpdate: new Date().toISOString().slice(0, 10) })) }
      return next
    })

    if (draft.owner !== current.owner)
      appendAudit({
        actor: user?.email ?? 'unknown',
        module: 'Clients',
        entityId: current.id,
        entityLabel: current.name,
        field: 'owner',
        from: current.owner,
        to: draft.owner,
      })

    if (draft.status !== current.status)
      appendAudit({
        actor: user?.email ?? 'unknown',
        module: 'Clients',
        entityId: current.id,
        entityLabel: current.name,
        field: 'status',
        from: current.status,
        to: draft.status,
      })

    if (draft.health !== current.health)
      appendAudit({
        actor: user?.email ?? 'unknown',
        module: 'Clients',
        entityId: current.id,
        entityLabel: current.name,
        field: 'health',
        from: current.health,
        to: draft.health,
      })
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={client.name}
        subtitle={`${client.industry} · ${client.plan}`}
        right={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border bg-[var(--panel-strong)] px-3 py-2 text-sm hover:bg-white/8"
              onClick={() => {
                downloadCsv(`${client.name.replace(/\s+/g, '_')}_payments.csv`, payments)
              }}
            >
              <Download size={16} /> CSV
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border bg-[var(--panel-strong)] px-3 py-2 text-sm hover:bg-white/8"
              onClick={() => {
                const w = window.open('', '_blank', 'noopener,noreferrer')
                if (w) {
                  w.document.open()
                  w.document.write('<!doctype html><title>Generating…</title><body style="font-family:system-ui;margin:24px">Generating PDF…</body>')
                  w.document.close()
                }

                const lines = [
                  `Client: ${client.name}`,
                  `Plan: ${client.plan}`,
                  '',
                  'Payments:',
                  ...payments.map(p => `- ${p.date} · ${money(p.amount)} · ${p.status} · ${p.method}${p.memo ? ` · ${p.memo}` : ''}`),
                ]

                const filename = `${client.name.replace(/\s+/g, '_')}_payments.pdf`
                createPdfBlob({ title: `${client.name} — Payment History`, lines })
                  .then(blob => {
                    const url = URL.createObjectURL(blob)
                    if (w) w.location.href = url
                    else {
                      const a = document.createElement('a')
                      a.href = url
                      a.download = filename
                      document.body.appendChild(a)
                      a.click()
                      document.body.removeChild(a)
                      window.location.href = url
                    }
                    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
                  })
                  .catch(() => {
                    if (w) w.close()
                    alert('PDF export failed. Please allow pop-ups and try again.')
                  })
              }}
            >
              <Download size={16} /> PDF
            </button>
            {!isEditing ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] text-black px-3 py-2 text-sm font-semibold hover:brightness-110"
                onClick={beginEdit}
              >
                <Pencil size={16} /> Edit
              </button>
            ) : (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] text-black px-3 py-2 text-sm font-semibold hover:brightness-110"
                onClick={save}
              >
                <Save size={16} /> Save
              </button>
            )}
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-[var(--panel-strong)] p-4">
        <Link href="/clients" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
          <ChevronLeft size={16} /> Back to Client Hub
        </Link>
        <div className="flex items-center gap-2">
          {client.status === 'Active' && <Badge tone="success">Active</Badge>}
          {client.status === 'At Risk' && <Badge tone="warning">At Risk</Badge>}
          {client.status === 'Paused' && <Badge tone="danger">Paused</Badge>}
          {client.health === 'green' && <Badge tone="success">Health: Green</Badge>}
          {client.health === 'yellow' && <Badge tone="warning">Health: Yellow</Badge>}
          {client.health === 'red' && <Badge tone="danger">Health: Red</Badge>}
          <Badge tone="info">MRR {money(client.mrr)}</Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(['overview', 'payments', 'updates', 'comms'] as Tab[]).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              'rounded-xl border px-3 py-2 text-sm capitalize',
              tab === t ? 'bg-[var(--panel-strong)]' : 'bg-black/10 text-[var(--muted)] hover:bg-black/20 hover:text-[var(--foreground)]',
            ].join(' ')}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border bg-[var(--panel-strong)] p-4 space-y-4">
            <div className="text-sm font-semibold">Profile</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-[var(--muted)]">Owner</div>
                {!isEditing ? (
                  <div className="mt-1 text-sm">{client.owner}</div>
                ) : (
                  <input
                    value={draft.owner}
                    onChange={e => setDraft(d => ({ ...d, owner: e.target.value }))}
                    className="mt-1 w-full rounded-xl border bg-black/20 px-3 py-2 text-sm outline-none"
                  />
                )}
              </div>
              <div>
                <div className="text-xs text-[var(--muted)]">Next Invoice</div>
                <div className="mt-1 text-sm">{client.nextInvoiceDate}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--muted)]">Status</div>
                {!isEditing ? (
                  <div className="mt-1 text-sm">{client.status}</div>
                ) : (
                  <select
                    value={draft.status}
                      onChange={e => setDraft(d => ({ ...d, status: e.target.value as ClientStatus }))}
                    className="mt-1 w-full rounded-xl border bg-black/20 px-3 py-2 text-sm outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Paused">Paused</option>
                  </select>
                )}
              </div>
              <div>
                <div className="text-xs text-[var(--muted)]">Health</div>
                {!isEditing ? (
                  <div className="mt-1 text-sm">{client.health}</div>
                ) : (
                  <select
                    value={draft.health}
                      onChange={e => setDraft(d => ({ ...d, health: e.target.value as ClientHealth }))}
                    className="mt-1 w-full rounded-xl border bg-black/20 px-3 py-2 text-sm outline-none"
                  >
                    <option value="green">green</option>
                    <option value="yellow">yellow</option>
                    <option value="red">red</option>
                  </select>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--muted)]">Notes</div>
              {!isEditing ? (
                <div className="mt-1 text-sm text-[var(--muted)]">{client.notes}</div>
              ) : (
                <textarea
                  value={draft.notes}
                  onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))}
                  rows={4}
                  className="mt-1 w-full rounded-xl border bg-black/20 px-3 py-2 text-sm outline-none"
                />
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-[var(--panel-strong)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Quick Comms</div>
              <MessageSquare size={16} className="text-[var(--muted)]" />
            </div>
            <div className="text-xs text-[var(--muted)]">Demo reminder: No integrations in V1 — logs are manual entry.</div>
            <div className="space-y-2">
              {comms.slice(0, 5).map(m => (
                <div key={m.id} className="rounded-xl border bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold">{m.channel}</div>
                    <div className="text-xs text-[var(--muted)]">{m.date}</div>
                  </div>
                  <div className="mt-2 text-xs text-[var(--muted)]">{m.note}</div>
                </div>
              ))}
              {comms.length === 0 && <div className="text-sm text-[var(--muted)]">No comm logs yet.</div>}
            </div>
          </div>
        </div>
      )}

      {tab === 'payments' && (
        <div className="rounded-2xl border bg-[var(--panel-strong)] overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-black/30">
              <tr className="text-left text-xs text-[var(--muted)]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Memo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-white/3">
                  <td className="py-3 px-4 text-[var(--muted)]">{p.date}</td>
                  <td className="py-3 px-4">{money(p.amount)}</td>
                  <td className="py-3 px-4">
                    {p.status === 'Paid' && <Badge tone="success">Paid</Badge>}
                    {p.status === 'Pending' && <Badge tone="warning">Pending</Badge>}
                    {p.status === 'Overdue' && <Badge tone="danger">Overdue</Badge>}
                  </td>
                  <td className="py-3 px-4 text-[var(--muted)]">{p.method}</td>
                  <td className="py-3 px-4 text-[var(--muted)]">{p.memo ?? ''}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td className="py-6 px-4 text-[var(--muted)]" colSpan={5}>
                    No payments logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'updates' && (
        <div className="space-y-4">
          {updates.map(u => (
            <div key={u.id} className="rounded-2xl border bg-[var(--panel-strong)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">Week of {u.weekOf}</div>
                <Badge tone="info">Weekly Update</Badge>
              </div>
              <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-[var(--muted)]">Summary</div>
                  <div className="mt-1 text-[var(--muted)]">{u.summary}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--muted)]">Wins</div>
                  <div className="mt-1 text-[var(--muted)]">{u.wins}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--muted)]">Blockers</div>
                  <div className="mt-1 text-[var(--muted)]">{u.blockers}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--muted)]">Next Steps</div>
                  <div className="mt-1 text-[var(--muted)]">{u.nextSteps}</div>
                </div>
              </div>
            </div>
          ))}
          {updates.length === 0 && <div className="text-sm text-[var(--muted)]">No weekly updates logged yet.</div>}
        </div>
      )}

      {tab === 'comms' && (
        <div className="space-y-3">
          {comms.map(m => (
            <div key={m.id} className="rounded-2xl border bg-[var(--panel-strong)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">{m.channel}</div>
                <div className="text-xs text-[var(--muted)]">{m.date}</div>
              </div>
              <div className="mt-2 text-sm text-[var(--muted)]">{m.note}</div>
            </div>
          ))}
          {comms.length === 0 && <div className="text-sm text-[var(--muted)]">No comm logs yet.</div>}
        </div>
      )}
    </div>
  )
}
