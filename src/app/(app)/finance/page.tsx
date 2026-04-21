'use client'

import { useMemo } from 'react'
import { Download, TrendingUp } from 'lucide-react'
import SectionHeader from '@/components/SectionHeader'
import Badge from '@/components/Badge'
import RoleGuard from '@/components/RoleGuard'
import { useDemoDb } from '@/lib/db'
import { createPdfBlob, downloadCsv } from '@/lib/export'

function money(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function FinancePage() {
  const { db } = useDemoDb()

  const byClient = useMemo(() => {
    return db.clients.map(c => {
      const payments = db.payments.filter(p => p.clientId === c.id)
      const paid = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0)
      const overdue = payments.filter(p => p.status === 'Overdue').reduce((sum, p) => sum + p.amount, 0)
      const pending = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0)
      return { client: c, paid, overdue, pending }
    })
  }, [db.clients, db.payments])

  const monthlyRevenueProjection = db.clients.filter(c => c.status === 'Active').reduce((sum, c) => sum + c.mrr, 0)
  const monthlyExpenses = db.expenses.reduce((sum, e) => sum + e.amount, 0)
  const contractorLiability = db.contractorPayments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0)

  return (
    <RoleGuard allow={['CEO']}>
      <div className="space-y-6">
        <SectionHeader
          title="Finance & Payments"
          subtitle="Payments per client, expenses, contractor payments, and monthly projections."
          right={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border bg-[var(--panel-strong)] px-3 py-2 text-sm hover:bg-white/8"
                onClick={() => downloadCsv('payments.csv', db.payments)}
              >
                <Download size={16} /> Export CSV
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
                    `Monthly revenue projection: ${money(monthlyRevenueProjection)}`,
                    `Expenses (month to date): ${money(monthlyExpenses)}`,
                    `Pending contractor payments: ${money(contractorLiability)}`,
                    '',
                    'Payment tracker (by client):',
                    ...byClient.map(row => {
                      const parts = [
                        row.client.name,
                        `Paid ${money(row.paid)}`,
                        row.pending > 0 ? `Pending ${money(row.pending)}` : 'Pending —',
                        row.overdue > 0 ? `Overdue ${money(row.overdue)}` : 'Overdue —',
                        `Next invoice ${row.client.nextInvoiceDate}`,
                      ]
                      return `- ${parts.join(' · ')}`
                    }),
                    '',
                    'Expenses:',
                    ...db.expenses.map(e => `- ${e.date} · ${e.category} · ${e.vendor} · ${money(e.amount)}`),
                    '',
                    'Contractor payments:',
                    ...db.contractorPayments.map(p => `- ${p.date} · ${p.contractor} · ${money(p.amount)} · ${p.status}`),
                  ]

                  createPdfBlob({ title: 'Finance Summary', lines })
                    .then(blob => {
                      const url = URL.createObjectURL(blob)
                      if (w) w.location.href = url
                      else {
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'finance_summary.pdf'
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
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border bg-[var(--panel-strong)] p-4">
            <div className="text-xs font-semibold tracking-wide text-[var(--muted)]">Monthly revenue projection</div>
            <div className="mt-2 text-2xl font-semibold">{money(monthlyRevenueProjection)}</div>
            <div className="mt-1 text-xs text-[var(--muted)]">Active clients only</div>
          </div>
          <div className="rounded-2xl border bg-[var(--panel-strong)] p-4">
            <div className="text-xs font-semibold tracking-wide text-[var(--muted)]">Expenses (month to date)</div>
            <div className="mt-2 text-2xl font-semibold">{money(monthlyExpenses)}</div>
            <div className="mt-1 text-xs text-[var(--muted)]">Manual log in V1</div>
          </div>
          <div className="rounded-2xl border bg-[var(--panel-strong)] p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold tracking-wide text-[var(--muted)]">Pending contractor payments</div>
              <TrendingUp size={16} className="text-[var(--muted)]" />
            </div>
            <div className="mt-2 text-2xl font-semibold">{money(contractorLiability)}</div>
            <div className="mt-1 text-xs text-[var(--muted)]">Upcoming cash-out</div>
          </div>
        </div>

        <div className="rounded-2xl border bg-[var(--panel-strong)] overflow-x-auto">
          <div className="p-4">
            <div className="text-sm font-semibold">Payment tracker (by client)</div>
            <div className="text-xs text-[var(--muted)]">Overdue and pending payments surfaced for quick action.</div>
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-black/30">
              <tr className="text-left text-xs text-[var(--muted)]">
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Pending</th>
                <th className="py-3 px-4">Overdue</th>
                <th className="py-3 px-4">Next invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {byClient.map(row => (
                <tr key={row.client.id} className="hover:bg-white/3">
                  <td className="py-3 px-4 font-semibold">{row.client.name}</td>
                  <td className="py-3 px-4">{money(row.paid)}</td>
                  <td className="py-3 px-4">
                    {row.pending > 0 ? <Badge tone="warning">{money(row.pending)}</Badge> : <span className="text-[var(--muted)]">—</span>}
                  </td>
                  <td className="py-3 px-4">
                    {row.overdue > 0 ? <Badge tone="danger">{money(row.overdue)}</Badge> : <span className="text-[var(--muted)]">—</span>}
                  </td>
                  <td className="py-3 px-4 text-[var(--muted)]">{row.client.nextInvoiceDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-[var(--panel-strong)] overflow-x-auto">
            <div className="p-4">
              <div className="text-sm font-semibold">Expenses</div>
              <div className="text-xs text-[var(--muted)]">Software, ads, misc costs (manual entry in V1).</div>
            </div>
            <table className="min-w-full text-sm">
              <thead className="bg-black/30">
                <tr className="text-left text-xs text-[var(--muted)]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {db.expenses.map(e => (
                  <tr key={e.id} className="hover:bg-white/3">
                    <td className="py-3 px-4 text-[var(--muted)]">{e.date}</td>
                    <td className="py-3 px-4 text-[var(--muted)]">{e.category}</td>
                    <td className="py-3 px-4">{e.vendor}</td>
                    <td className="py-3 px-4">{money(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border bg-[var(--panel-strong)] overflow-x-auto">
            <div className="p-4">
              <div className="text-sm font-semibold">Contractor payments</div>
              <div className="text-xs text-[var(--muted)]">Track pending vs paid.</div>
            </div>
            <table className="min-w-full text-sm">
              <thead className="bg-black/30">
                <tr className="text-left text-xs text-[var(--muted)]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Contractor</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {db.contractorPayments.map(p => (
                  <tr key={p.id} className="hover:bg-white/3">
                    <td className="py-3 px-4 text-[var(--muted)]">{p.date}</td>
                    <td className="py-3 px-4 font-semibold">{p.contractor}</td>
                    <td className="py-3 px-4">{money(p.amount)}</td>
                    <td className="py-3 px-4">
                      {p.status === 'Paid' ? <Badge tone="success">Paid</Badge> : <Badge tone="warning">Pending</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}
