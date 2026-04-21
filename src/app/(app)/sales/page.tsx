'use client'

import { useMemo, useState } from 'react'
import { ArrowRightLeft, Download, Plus, Target } from 'lucide-react'
import SectionHeader from '@/components/SectionHeader'
import Badge from '@/components/Badge'
import RoleGuard from '@/components/RoleGuard'
import { useAuth } from '@/lib/auth'
import { useDemoDb } from '@/lib/db'
import { downloadCsv } from '@/lib/export'
import { LeadStage, OutreachLog } from '@/lib/types'

const stages: LeadStage[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost']

function money(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function uuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

export default function SalesPage() {
  const { user } = useAuth()
  const { db, updateDb, appendAudit } = useDemoDb()
  const [showAddOutreach, setShowAddOutreach] = useState(false)
  const leads = db.leads

  const pipelineByStage = useMemo(() => {
    const map = new Map<LeadStage, typeof leads>()
    for (const s of stages) map.set(s, [])
    for (const l of leads) map.get(l.stage)?.push(l)
    for (const s of stages) map.set(s, (map.get(s) || []).slice().sort((a, b) => b.value - a.value))
    return map
  }, [leads])

  const today = new Date().toISOString().slice(0, 10)
  const outreachToday = db.outreach.filter(o => o.date === today).length

  const [outreachDraft, setOutreachDraft] = useState<Omit<OutreachLog, 'id'>>({
    date: today,
    owner: user?.name ?? 'Team',
    channel: 'Email',
    prospect: '',
    outcome: 'No Reply',
    note: '',
  })

  return (
    <RoleGuard allow={['CEO', 'SALES']}>
      <div className="space-y-6">
        <SectionHeader
          title="Sales Tracker"
          subtitle="Daily outreach log, lead pipeline, and lightweight performance analytics."
          right={
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-xl border bg-[var(--panel-strong)] px-3 py-2 text-sm">
                <Target size={16} /> Today: <span className="font-semibold">{outreachToday}</span>/5
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border bg-[var(--panel-strong)] px-3 py-2 text-sm hover:bg-white/8"
                onClick={() => downloadCsv('outreach.csv', db.outreach)}
              >
                <Download size={16} /> Export CSV
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] text-black px-3 py-2 text-sm font-semibold hover:brightness-110"
                onClick={() => setShowAddOutreach(v => !v)}
              >
                <Plus size={16} /> Log outreach
              </button>
            </div>
          }
        />

        {showAddOutreach && (
          <div className="rounded-2xl border bg-[var(--panel-strong)] p-4">
            <div className="text-sm font-semibold">New outreach entry</div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
              <input
                className="rounded-xl border bg-black/20 px-3 py-2 text-sm outline-none"
                value={outreachDraft.date}
                onChange={e => setOutreachDraft(d => ({ ...d, date: e.target.value }))}
                placeholder="YYYY-MM-DD"
              />
              <select
                className="rounded-xl border bg-black/20 px-3 py-2 text-sm outline-none"
                value={outreachDraft.channel}
                onChange={e => setOutreachDraft(d => ({ ...d, channel: e.target.value as OutreachLog['channel'] }))}
              >
                <option value="Email">Email</option>
                <option value="DM">DM</option>
                <option value="Call">Call</option>
              </select>
              <input
                className="rounded-xl border bg-black/20 px-3 py-2 text-sm outline-none md:col-span-2"
                value={outreachDraft.prospect}
                onChange={e => setOutreachDraft(d => ({ ...d, prospect: e.target.value }))}
                placeholder="Prospect / Company"
              />
              <select
                className="rounded-xl border bg-black/20 px-3 py-2 text-sm outline-none"
                value={outreachDraft.outcome}
                onChange={e => setOutreachDraft(d => ({ ...d, outcome: e.target.value as OutreachLog['outcome'] }))}
              >
                <option value="No Reply">No Reply</option>
                <option value="Replied">Replied</option>
                <option value="Booked">Booked</option>
                <option value="Not Fit">Not Fit</option>
              </select>
            </div>
            <textarea
              className="mt-3 w-full rounded-xl border bg-black/20 px-3 py-2 text-sm outline-none"
              value={outreachDraft.note}
              onChange={e => setOutreachDraft(d => ({ ...d, note: e.target.value }))}
              placeholder="Notes"
              rows={3}
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border bg-black/20 px-3 py-2 text-sm hover:bg-black/30"
                onClick={() => setShowAddOutreach(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-[var(--accent)] text-black px-3 py-2 text-sm font-semibold hover:brightness-110"
                onClick={() => {
                  if (!outreachDraft.prospect.trim()) return
                  const entry: OutreachLog = { id: uuid(), ...outreachDraft, owner: user?.name ?? outreachDraft.owner }
                  updateDb(prev => ({ ...prev, outreach: [entry, ...prev.outreach] }))
                  appendAudit({
                    actor: user?.email ?? 'unknown',
                    module: 'Sales',
                    entityId: entry.id,
                    entityLabel: entry.prospect,
                    field: 'outreach',
                    from: '',
                    to: `${entry.channel} · ${entry.outcome}`,
                  })
                  setOutreachDraft(d => ({ ...d, prospect: '', note: '' }))
                  setShowAddOutreach(false)
                }}
              >
                Save
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl border bg-[var(--panel-strong)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Lead Pipeline</div>
              <div className="text-xs text-[var(--muted)]">Move leads between stages to track follow-ups and forecasting.</div>
            </div>
            <div className="inline-flex items-center gap-2 text-xs text-[var(--muted)]">
              <ArrowRightLeft size={14} /> Drag-and-drop in V2; select menu in demo
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-6 gap-3">
            {stages.map(stage => {
              const items = pipelineByStage.get(stage) || []
              const total = items.reduce((sum, l) => sum + l.value, 0)
              return (
                <div key={stage} className="rounded-2xl border bg-black/15 p-3 min-h-[160px]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{stage}</div>
                    <Badge tone={stage === 'Won' ? 'success' : stage === 'Lost' ? 'danger' : 'default'}>{items.length}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-[var(--muted)]">{money(total)}</div>

                  <div className="mt-3 space-y-2">
                    {items.map(l => (
                      <div key={l.id} className="rounded-xl border bg-[var(--panel)] p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div style={{ minWidth: 0 }}>
                            <div className="text-sm font-semibold truncate">{l.company}</div>
                            <div className="text-xs text-[var(--muted)] truncate">{l.name} · {l.owner}</div>
                          </div>
                          <div className="text-xs font-semibold">{money(l.value)}</div>
                        </div>
                        <div className="mt-2 text-xs text-[var(--muted)]">Next follow-up: {l.nextFollowUp}</div>
                        <select
                          className="mt-3 w-full rounded-xl border bg-black/20 px-2 py-2 text-xs outline-none"
                          value={l.stage}
                          onChange={e => {
                            const nextStage = e.target.value as LeadStage
                            updateDb(prev => ({ ...prev, leads: prev.leads.map(x => (x.id === l.id ? { ...x, stage: nextStage } : x)) }))
                            appendAudit({
                              actor: user?.email ?? 'unknown',
                              module: 'Sales',
                              entityId: l.id,
                              entityLabel: l.company,
                              field: 'stage',
                              from: l.stage,
                              to: nextStage,
                            })
                          }}
                        >
                          {stages.map(s => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                    {items.length === 0 && <div className="text-xs text-[var(--muted)]">No leads.</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border bg-[var(--panel-strong)] overflow-x-auto">
          <div className="p-4">
            <div className="text-sm font-semibold">Daily Outreach Log</div>
            <div className="text-xs text-[var(--muted)]">Manual entry in V1; exportable for reporting.</div>
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-black/30">
              <tr className="text-left text-xs text-[var(--muted)]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Prospect</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {db.outreach.slice(0, 30).map(o => (
                <tr key={o.id} className="hover:bg-white/3">
                  <td className="py-3 px-4 text-[var(--muted)]">{o.date}</td>
                  <td className="py-3 px-4">{o.owner}</td>
                  <td className="py-3 px-4 text-[var(--muted)]">{o.channel}</td>
                  <td className="py-3 px-4 font-semibold">{o.prospect}</td>
                  <td className="py-3 px-4">
                    {o.outcome === 'Booked' && <Badge tone="success">Booked</Badge>}
                    {o.outcome === 'Replied' && <Badge tone="info">Replied</Badge>}
                    {o.outcome === 'No Reply' && <Badge tone="default">No Reply</Badge>}
                    {o.outcome === 'Not Fit' && <Badge tone="warning">Not Fit</Badge>}
                  </td>
                  <td className="py-3 px-4 text-[var(--muted)]">{o.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RoleGuard>
  )
}
