export type ClientHealth = 'green' | 'yellow' | 'red'

export type Client = {
  id: string
  name: string
  industry: string
  plan: string
  owner: string
  status: 'Active' | 'Paused' | 'At Risk'
  health: ClientHealth
  mrr: number
  nextInvoiceDate: string
  lastUpdate: string
  notes: string
}

export type Payment = {
  id: string
  clientId: string
  date: string
  amount: number
  method: 'Bank' | 'Card' | 'Stripe' | 'Wise'
  status: 'Paid' | 'Pending' | 'Overdue'
  memo?: string
}

export type WeeklyUpdate = {
  id: string
  clientId: string
  weekOf: string
  summary: string
  wins: string
  blockers: string
  nextSteps: string
}

export type CommLog = {
  id: string
  clientId: string
  date: string
  channel: 'WhatsApp' | 'Email' | 'Call'
  note: string
}

export type LeadStage = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost'

export type Lead = {
  id: string
  name: string
  company: string
  source: 'Inbound' | 'Outbound' | 'Referral'
  stage: LeadStage
  value: number
  owner: string
  nextFollowUp: string
  lastContacted: string
  notes: string
}

export type OutreachLog = {
  id: string
  date: string
  owner: string
  channel: 'Email' | 'DM' | 'Call'
  prospect: string
  outcome: 'No Reply' | 'Replied' | 'Booked' | 'Not Fit'
  note: string
}

export type Expense = {
  id: string
  date: string
  category: 'Software' | 'Ads' | 'Contractor' | 'Misc'
  amount: number
  vendor: string
  memo?: string
}

export type ContractorPayment = {
  id: string
  date: string
  contractor: string
  amount: number
  status: 'Paid' | 'Pending'
  memo?: string
}

export type TaskStatus = 'Todo' | 'In Progress' | 'Blocked' | 'Done'

export type Task = {
  id: string
  clientId: string
  title: string
  owner: string
  status: TaskStatus
  dueDate: string
  priority: 'Low' | 'Medium' | 'High'
}

export type StandupEntry = {
  id: string
  date: string
  owner: string
  yesterday: string
  today: string
  blockers: string
}

export type AuditEntry = {
  id: string
  at: number
  actor: string
  module: 'Clients' | 'Sales' | 'Finance' | 'Ops'
  entityId: string
  entityLabel: string
  field: string
  from?: string
  to?: string
}

