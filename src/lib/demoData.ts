import { Client, CommLog, ContractorPayment, Expense, Lead, OutreachLog, Payment, StandupEntry, Task, WeeklyUpdate } from '@/lib/types'

export type Database = {
  clients: Client[]
  payments: Payment[]
  weeklyUpdates: WeeklyUpdate[]
  comms: CommLog[]
  leads: Lead[]
  outreach: OutreachLog[]
  expenses: Expense[]
  contractorPayments: ContractorPayment[]
  tasks: Task[]
  standups: StandupEntry[]
}

export const DEMO_DB: Database = {
  clients: [
    {
      id: 'c_aurora',
      name: 'Aurora Skincare',
      industry: 'E-commerce (Beauty)',
      plan: 'Meta Ads + SMS',
      owner: 'Mark',
      status: 'Active',
      health: 'green',
      mrr: 4200,
      nextInvoiceDate: '2026-04-25',
      lastUpdate: '2026-04-19',
      notes: 'Scaling prospecting, creative tests ongoing.',
    },
    {
      id: 'c_nova',
      name: 'Nova Athleisure',
      industry: 'E-commerce (Apparel)',
      plan: 'Meta Ads',
      owner: 'Aly',
      status: 'At Risk',
      health: 'yellow',
      mrr: 3000,
      nextInvoiceDate: '2026-04-22',
      lastUpdate: '2026-04-14',
      notes: 'CPAs rising. Needs offer refresh + landing page tweaks.',
    },
    {
      id: 'c_summit',
      name: 'Summit Supplements',
      industry: 'E-commerce (Health)',
      plan: 'Meta Ads + CRO',
      owner: 'Jay',
      status: 'Paused',
      health: 'red',
      mrr: 2500,
      nextInvoiceDate: '2026-04-10',
      lastUpdate: '2026-04-05',
      notes: 'Paused due to payment issue. Waiting for confirmation.',
    },
  ],
  payments: [
    { id: 'p1', clientId: 'c_aurora', date: '2026-04-01', amount: 4200, method: 'Stripe', status: 'Paid', memo: 'April retainer' },
    { id: 'p2', clientId: 'c_nova', date: '2026-03-28', amount: 3000, method: 'Bank', status: 'Paid', memo: 'April retainer' },
    { id: 'p3', clientId: 'c_nova', date: '2026-04-20', amount: 3000, method: 'Bank', status: 'Pending', memo: 'May retainer' },
    { id: 'p4', clientId: 'c_summit', date: '2026-04-10', amount: 2500, method: 'Wise', status: 'Overdue', memo: 'April retainer' },
  ],
  weeklyUpdates: [
    {
      id: 'w1',
      clientId: 'c_aurora',
      weekOf: '2026-04-14',
      summary: 'Stable ROAS with improvements in creative performance.',
      wins: 'New UGC concept improved CTR by 18%.',
      blockers: 'Creative approvals delayed by 2 days.',
      nextSteps: 'Launch 4 new hooks and expand to broad audiences.',
    },
  ],
  comms: [
    { id: 'm1', clientId: 'c_aurora', date: '2026-04-18', channel: 'WhatsApp', note: 'Shared weekly update + next week creative plan.' },
    { id: 'm2', clientId: 'c_summit', date: '2026-04-09', channel: 'Email', note: 'Payment reminder sent. Awaiting response.' },
  ],
  leads: [
    { id: 'l1', name: 'Kara M.', company: 'Velvet Home', source: 'Outbound', stage: 'Contacted', value: 3500, owner: 'Mark', nextFollowUp: '2026-04-22', lastContacted: '2026-04-20', notes: 'Interested in SMS + ads; asked for case studies.' },
    { id: 'l2', name: 'Dylan R.', company: 'Oak & Stone', source: 'Inbound', stage: 'Qualified', value: 5000, owner: 'Aly', nextFollowUp: '2026-04-23', lastContacted: '2026-04-18', notes: 'Booked discovery. Needs offer + timeline.' },
    { id: 'l3', name: 'Mia L.', company: 'Sunroom Goods', source: 'Referral', stage: 'Proposal', value: 4200, owner: 'Jay', nextFollowUp: '2026-04-22', lastContacted: '2026-04-17', notes: 'Proposal out. Waiting for confirmation.' },
  ],
  outreach: [
    { id: 'o1', date: '2026-04-21', owner: 'Mark', channel: 'DM', prospect: 'Velvet Home', outcome: 'Replied', note: 'Asked about pricing & results.' },
    { id: 'o2', date: '2026-04-21', owner: 'Aly', channel: 'Email', prospect: 'Oak & Stone', outcome: 'Booked', note: 'Discovery call booked for Thursday.' },
  ],
  expenses: [
    { id: 'e1', date: '2026-04-05', category: 'Software', amount: 79, vendor: 'ClickUp', memo: 'Team plan' },
    { id: 'e2', date: '2026-04-10', category: 'Software', amount: 49, vendor: 'Google Workspace', memo: 'Agency email' },
  ],
  contractorPayments: [
    { id: 'cp1', date: '2026-04-15', contractor: 'Sam (Designer)', amount: 600, status: 'Paid', memo: 'Creative batch' },
    { id: 'cp2', date: '2026-04-18', contractor: 'Nina (Copy)', amount: 350, status: 'Pending', memo: 'Email flows' },
  ],
  tasks: [
    { id: 't1', clientId: 'c_aurora', title: 'Launch UGC Hook Test Set', owner: 'Mark', status: 'In Progress', dueDate: '2026-04-22', priority: 'High' },
    { id: 't2', clientId: 'c_nova', title: 'Review Landing Page Heatmaps', owner: 'Aly', status: 'Todo', dueDate: '2026-04-23', priority: 'Medium' },
    { id: 't3', clientId: 'c_summit', title: 'Follow up payment confirmation', owner: 'Jay', status: 'Blocked', dueDate: '2026-04-22', priority: 'High' },
  ],
  standups: [
    { id: 's1', date: '2026-04-21', owner: 'Mark', yesterday: 'Reviewed accounts and updated creative briefs.', today: 'Launch new ad set and finalize report.', blockers: 'None' },
    { id: 's2', date: '2026-04-21', owner: 'Aly', yesterday: 'Handled inbound leads and prepared discovery doc.', today: 'Discovery calls + pipeline cleanup.', blockers: 'Waiting on client assets.' },
  ],
}

