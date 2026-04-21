import { Database } from '@/lib/demoData'

export type Alert = {
  id: string
  level: 'info' | 'warning' | 'critical'
  title: string
  detail: string
  cta?: { label: string; href: string }
}

function daysUntil(dateIso: string) {
  const d = new Date(dateIso)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getAlerts(db: Database): Alert[] {
  const alerts: Alert[] = []

  for (const p of db.payments) {
    if (p.status !== 'Overdue') continue
    const client = db.clients.find(c => c.id === p.clientId)
    alerts.push({
      id: `pay_${p.id}`,
      level: 'critical',
      title: 'Overdue payment',
      detail: `${client?.name ?? 'Client'} is overdue (${p.amount.toLocaleString()} USD).`,
      cta: { label: 'Open Finance', href: '/finance' },
    })
  }

  for (const c of db.clients) {
    const dueIn = daysUntil(c.nextInvoiceDate)
    if (dueIn <= 3 && dueIn >= 0) {
      alerts.push({
        id: `inv_${c.id}`,
        level: 'warning',
        title: 'Invoice due soon',
        detail: `${c.name} invoice is due in ${dueIn} day${dueIn === 1 ? '' : 's'}.`,
        cta: { label: 'Open Client', href: `/clients/${c.id}` },
      })
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const standupCount = db.standups.filter(s => s.date === today).length
  if (standupCount === 0) {
    alerts.push({
      id: 'standup_missing',
      level: 'warning',
      title: 'Standup missing',
      detail: 'No standup entries logged for today.',
      cta: { label: 'Open Ops', href: '/ops' },
    })
  }

  const outreachToday = db.outreach.filter(o => o.date === today).length
  if (outreachToday < 5) {
    alerts.push({
      id: 'outreach_low',
      level: 'info',
      title: 'Outreach target',
      detail: `Daily outreach is at ${outreachToday}/5 entries.`,
      cta: { label: 'Open Sales', href: '/sales' },
    })
  }

  return alerts.slice(0, 8)
}

