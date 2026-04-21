'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'
import SectionHeader from '@/components/SectionHeader'
import Badge from '@/components/Badge'
import { useDemoDb } from '@/lib/db'
import { downloadCsv } from '@/lib/export'

function money(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function ClientsPage() {
  const { db } = useDemoDb()
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase()
    const list = query
      ? db.clients.filter(c => c.name.toLowerCase().includes(query) || c.owner.toLowerCase().includes(query) || c.plan.toLowerCase().includes(query))
      : db.clients
    return list.slice().sort((a, b) => b.mrr - a.mrr)
  }, [db.clients, q])

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Client Hub"
        subtitle="Full profiles, payment history, performance updates, and communication logs."
        right={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border bg-[var(--panel-strong)] px-3 py-2 text-sm hover:bg-white/8"
            onClick={() => {
              const data = rows.map(c => ({
                id: c.id,
                name: c.name,
                status: c.status,
                health: c.health,
                plan: c.plan,
                owner: c.owner,
                mrr: c.mrr,
                nextInvoiceDate: c.nextInvoiceDate,
                lastUpdate: c.lastUpdate,
              }))
              downloadCsv('clients.csv', data)
            }}
          >
            <Download size={16} /> Export CSV
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-2xl border bg-black/20 px-3 py-2 max-w-lg">
          <Search size={16} className="text-[var(--muted)]" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
            placeholder="Search clients, owner, plan…"
          />
        </div>
        <div className="text-sm text-[var(--muted)]">{rows.length} clients</div>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-[var(--panel-strong)]">
        <table className="min-w-full text-sm">
          <thead className="bg-black/30">
            <tr className="text-left text-xs text-[var(--muted)]">
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Owner</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Health</th>
              <th className="py-3 px-4">MRR</th>
              <th className="py-3 px-4">Next Invoice</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map(c => (
              <tr key={c.id} className="hover:bg-white/3">
                <td className="py-3 px-4">
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-[var(--muted)]">{c.plan}</div>
                </td>
                <td className="py-3 px-4 text-[var(--muted)]">{c.owner}</td>
                <td className="py-3 px-4">
                  {c.status === 'Active' && <Badge tone="success">Active</Badge>}
                  {c.status === 'At Risk' && <Badge tone="warning">At Risk</Badge>}
                  {c.status === 'Paused' && <Badge tone="danger">Paused</Badge>}
                </td>
                <td className="py-3 px-4">
                  {c.health === 'green' && <Badge tone="success">Green</Badge>}
                  {c.health === 'yellow' && <Badge tone="warning">Yellow</Badge>}
                  {c.health === 'red' && <Badge tone="danger">Red</Badge>}
                </td>
                <td className="py-3 px-4">{money(c.mrr)}</td>
                <td className="py-3 px-4 text-[var(--muted)]">{c.nextInvoiceDate}</td>
                <td className="py-3 px-4 text-right">
                  <Link
                    href={`/clients/${c.id}`}
                    className="inline-flex items-center gap-2 rounded-xl border bg-black/20 px-3 py-2 text-xs hover:bg-black/30"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

