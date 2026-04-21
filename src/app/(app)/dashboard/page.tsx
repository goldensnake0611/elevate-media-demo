'use client'

import Link from 'next/link'
import { ArrowRight, CalendarDays, DollarSign, TrendingUp, TriangleAlert } from 'lucide-react'
import SectionHeader from '@/components/SectionHeader'
import StatCard from '@/components/StatCard'
import Badge from '@/components/Badge'
import { useDemoDb } from '@/lib/db'
import { getAlerts } from '@/lib/notifications'

function money(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function DashboardPage() {
  const { db } = useDemoDb()
  const alerts = getAlerts(db)

  const activeClients = db.clients.filter(c => c.status === 'Active')
  const mrr = activeClients.reduce((sum, c) => sum + c.mrr, 0)
  const overdue = db.payments.filter(p => p.status === 'Overdue').reduce((sum, p) => sum + p.amount, 0)
  const pipelineValue = db.leads.filter(l => l.stage === 'Qualified' || l.stage === 'Proposal').reduce((sum, l) => sum + l.value, 0)

  return (
    <div className="space-y-8">
      <SectionHeader
        title="CEO Dashboard"
        subtitle="A focused snapshot of client health, revenue, sales activity, and operational alerts."
        right={
          <Link
            href="/clients"
            className="inline-flex items-center gap-2 rounded-xl border bg-[var(--panel-strong)] px-3 py-2 text-sm hover:bg-white/8"
          >
            Open Client Hub <ArrowRight size={16} />
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Active MRR" value={money(mrr)} hint={`${activeClients.length} active clients`} icon={<DollarSign size={18} />} />
        <StatCard label="Sales Pipeline" value={money(pipelineValue)} hint="Qualified + Proposal" icon={<TrendingUp size={18} />} />
        <StatCard
          label="Overdue Payments"
          value={money(overdue)}
          hint={overdue > 0 ? 'Immediate attention recommended' : 'None flagged'}
          icon={<TriangleAlert size={18} />}
        />
      </div>

      <div id="alerts" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border bg-[var(--panel-strong)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Client Health</div>
              <div className="text-xs text-[var(--muted)]">Color-coded overview across the book of business</div>
            </div>
            <Link href="/clients" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
              View all
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[var(--muted)]">
                  <th className="py-2 pr-4">Client</th>
                  <th className="py-2 pr-4">Owner</th>
                  <th className="py-2 pr-4">Health</th>
                  <th className="py-2 pr-4">MRR</th>
                  <th className="py-2 pr-4">Next Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {db.clients.map(c => (
                  <tr key={c.id} className="hover:bg-white/3">
                    <td className="py-3 pr-4">
                      <Link href={`/clients/${c.id}`} className="font-semibold hover:underline">
                        {c.name}
                      </Link>
                      <div className="text-xs text-[var(--muted)]">{c.plan}</div>
                    </td>
                    <td className="py-3 pr-4 text-[var(--muted)]">{c.owner}</td>
                    <td className="py-3 pr-4">
                      {c.health === 'green' && <Badge tone="success">Healthy</Badge>}
                      {c.health === 'yellow' && <Badge tone="warning">Watch</Badge>}
                      {c.health === 'red' && <Badge tone="danger">At Risk</Badge>}
                    </td>
                    <td className="py-3 pr-4">{money(c.mrr)}</td>
                    <td className="py-3 pr-4 text-[var(--muted)]">{c.nextInvoiceDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border bg-[var(--panel-strong)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Alerts</div>
              <div className="text-xs text-[var(--muted)]">Auto-generated reminders and risks</div>
            </div>
            <div className="inline-flex items-center gap-2 text-xs text-[var(--muted)]">
              <CalendarDays size={14} /> Today
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {alerts.length === 0 ? (
              <div className="text-sm text-[var(--muted)]">No alerts right now.</div>
            ) : (
              alerts.map(a => (
                <div key={a.id} className="rounded-2xl border bg-black/20 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        {a.level === 'critical' && <Badge tone="danger">Critical</Badge>}
                        {a.level === 'warning' && <Badge tone="warning">Warning</Badge>}
                        {a.level === 'info' && <Badge tone="info">Info</Badge>}
                        <div className="text-sm font-semibold">{a.title}</div>
                      </div>
                      <div className="mt-2 text-xs text-[var(--muted)]">{a.detail}</div>
                    </div>
                    {a.cta && (
                      <Link href={a.cta.href} className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
                        {a.cta.label}
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

