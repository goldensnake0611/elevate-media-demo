'use client'

import { useMemo, useState } from 'react'
import { Download, Plus, Users } from 'lucide-react'
import SectionHeader from '@/components/SectionHeader'
import Badge from '@/components/Badge'
import RoleGuard from '@/components/RoleGuard'
import { useAuth } from '@/lib/auth'
import { useDemoDb } from '@/lib/db'
import { downloadCsv } from '@/lib/export'
import { StandupEntry, Task, TaskStatus } from '@/lib/types'

const statuses: TaskStatus[] = ['Todo', 'In Progress', 'Blocked', 'Done']

function uuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

export default function OpsPage() {
  const { user } = useAuth()
  const { db, updateDb, appendAudit } = useDemoDb()
  const today = new Date().toISOString().slice(0, 10)

  const clientById = useMemo(() => new Map(db.clients.map(c => [c.id, c])), [db.clients])

  const tasksByStatus = useMemo(() => {
    const map = new Map<TaskStatus, Task[]>()
    for (const s of statuses) map.set(s, [])
    for (const t of db.tasks) map.get(t.status)?.push(t)
    for (const s of statuses) map.set(s, (map.get(s) || []).slice().sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1)))
    return map
  }, [db.tasks])

  const todaysStandups = db.standups.filter(s => s.date === today)

  const [standupDraft, setStandupDraft] = useState<Omit<StandupEntry, 'id'>>({
    date: today,
    owner: user?.name ?? 'Team',
    yesterday: '',
    today: '',
    blockers: '',
  })

  const [taskDraft, setTaskDraft] = useState<Omit<Task, 'id'>>({
    clientId: db.clients[0]?.id ?? '',
    title: '',
    owner: user?.name ?? 'Team',
    status: 'Todo',
    dueDate: today,
    priority: 'Medium',
  })
  const [showTaskForm, setShowTaskForm] = useState(false)

  return (
    <RoleGuard allow={['CEO', 'OPS']}>
      <div className="space-y-6">
        <SectionHeader
          title="Team & Tasks"
          subtitle="Daily standup log, task board by client, and weekly reporting foundation."
          right={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border bg-[var(--panel-strong)] px-3 py-2 text-sm hover:bg-white/8"
                onClick={() => downloadCsv('tasks.csv', db.tasks)}
              >
                <Download size={16} /> Tasks CSV
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] text-black px-3 py-2 text-sm font-semibold hover:brightness-110"
                onClick={() => setShowTaskForm(v => !v)}
              >
                <Plus size={16} /> New task
              </button>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-[var(--panel-strong)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Daily Standup</div>
                <div className="text-xs text-[var(--muted)]">{today}</div>
              </div>
              <div className="inline-flex items-center gap-2 text-xs text-[var(--muted)]">
                <Users size={14} /> {todaysStandups.length} entries
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {todaysStandups.map(s => (
                <div key={s.id} className="rounded-2xl border bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{s.owner}</div>
                    <Badge tone={s.blockers.trim() ? 'warning' : 'success'}>{s.blockers.trim() ? 'Blocked' : 'Clear'}</Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[var(--muted)]">
                    <div>
                      <div className="font-semibold text-[var(--foreground)]">Yesterday</div>
                      <div className="mt-1">{s.yesterday}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--foreground)]">Today</div>
                      <div className="mt-1">{s.today}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--foreground)]">Blockers</div>
                      <div className="mt-1">{s.blockers || '—'}</div>
                    </div>
                  </div>
                </div>
              ))}
              {todaysStandups.length === 0 && <div className="text-sm text-[var(--muted)]">No entries yet.</div>}
            </div>

            <div className="mt-4 rounded-2xl border bg-black/15 p-3">
              <div className="text-sm font-semibold">Add standup entry</div>
              <input
                className="mt-3 w-full rounded-xl border bg-black/20 px-3 py-2 text-sm outline-none"
                value={standupDraft.owner}
                onChange={e => setStandupDraft(d => ({ ...d, owner: e.target.value }))}
                placeholder="Name"
              />
              <textarea
                className="mt-3 w-full rounded-xl border bg-black/20 px-3 py-2 text-sm outline-none"
                value={standupDraft.yesterday}
                onChange={e => setStandupDraft(d => ({ ...d, yesterday: e.target.value }))}
                placeholder="Yesterday"
                rows={2}
              />
              <textarea
                className="mt-3 w-full rounded-xl border bg-black/20 px-3 py-2 text-sm outline-none"
                value={standupDraft.today}
                onChange={e => setStandupDraft(d => ({ ...d, today: e.target.value }))}
                placeholder="Today"
                rows={2}
              />
              <textarea
                className="mt-3 w-full rounded-xl border bg-black/20 px-3 py-2 text-sm outline-none"
                value={standupDraft.blockers}
                onChange={e => setStandupDraft(d => ({ ...d, blockers: e.target.value }))}
                placeholder="Blockers"
                rows={2}
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  className="rounded-xl bg-[var(--accent)] text-black px-3 py-2 text-sm font-semibold hover:brightness-110"
                  onClick={() => {
                    if (!standupDraft.owner.trim()) return
                    const entry: StandupEntry = { id: uuid(), ...standupDraft, date: today }
                    updateDb(prev => ({ ...prev, standups: [entry, ...prev.standups] }))
                    appendAudit({
                      actor: user?.email ?? 'unknown',
                      module: 'Ops',
                      entityId: entry.id,
                      entityLabel: entry.owner,
                      field: 'standup',
                      from: '',
                      to: today,
                    })
                    setStandupDraft(d => ({ ...d, yesterday: '', today: '', blockers: '' }))
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-[var(--panel-strong)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Task Board</div>
                <div className="text-xs text-[var(--muted)]">Organized by client, tracked by status.</div>
              </div>
              <div className="text-xs text-[var(--muted)]">{db.tasks.length} tasks</div>
            </div>

            {showTaskForm && (
              <div className="mt-4 rounded-2xl border bg-black/15 p-3">
                <div className="text-sm font-semibold">New task</div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    className="rounded-xl border bg-black/20 px-3 py-2 text-sm outline-none"
                    value={taskDraft.clientId}
                    onChange={e => setTaskDraft(d => ({ ...d, clientId: e.target.value }))}
                  >
                    {db.clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="rounded-xl border bg-black/20 px-3 py-2 text-sm outline-none"
                    value={taskDraft.owner}
                    onChange={e => setTaskDraft(d => ({ ...d, owner: e.target.value }))}
                    placeholder="Owner"
                  />
                  <input
                    className="md:col-span-2 rounded-xl border bg-black/20 px-3 py-2 text-sm outline-none"
                    value={taskDraft.title}
                    onChange={e => setTaskDraft(d => ({ ...d, title: e.target.value }))}
                    placeholder="Task title"
                  />
                  <select
                    className="rounded-xl border bg-black/20 px-3 py-2 text-sm outline-none"
                    value={taskDraft.status}
                    onChange={e => setTaskDraft(d => ({ ...d, status: e.target.value as TaskStatus }))}
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <input
                    className="rounded-xl border bg-black/20 px-3 py-2 text-sm outline-none"
                    value={taskDraft.dueDate}
                    onChange={e => setTaskDraft(d => ({ ...d, dueDate: e.target.value }))}
                    placeholder="YYYY-MM-DD"
                  />
                  <select
                    className="rounded-xl border bg-black/20 px-3 py-2 text-sm outline-none"
                    value={taskDraft.priority}
                    onChange={e => setTaskDraft(d => ({ ...d, priority: e.target.value as 'Low' | 'Medium' | 'High' }))}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-xl border bg-black/20 px-3 py-2 text-sm hover:bg-black/30"
                    onClick={() => setShowTaskForm(false)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="rounded-xl bg-[var(--accent)] text-black px-3 py-2 text-sm font-semibold hover:brightness-110"
                    onClick={() => {
                      if (!taskDraft.title.trim() || !taskDraft.clientId) return
                      const task: Task = { id: uuid(), ...taskDraft, owner: user?.name ?? taskDraft.owner }
                      updateDb(prev => ({ ...prev, tasks: [task, ...prev.tasks] }))
                      appendAudit({
                        actor: user?.email ?? 'unknown',
                        module: 'Ops',
                        entityId: task.id,
                        entityLabel: task.title,
                        field: 'task',
                        from: '',
                        to: task.status,
                      })
                      setTaskDraft(d => ({ ...d, title: '' }))
                      setShowTaskForm(false)
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {statuses.map(status => (
                <div key={status} className="rounded-2xl border bg-black/15 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{status}</div>
                    <Badge tone={status === 'Done' ? 'success' : status === 'Blocked' ? 'warning' : 'default'}>
                      {(tasksByStatus.get(status) || []).length}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    {(tasksByStatus.get(status) || []).map(t => (
                      <div key={t.id} className="rounded-xl border bg-[var(--panel)] p-3">
                        <div className="text-sm font-semibold">{t.title}</div>
                        <div className="mt-1 text-xs text-[var(--muted)]">
                          {clientById.get(t.clientId)?.name ?? 'Client'} · {t.owner} · Due {t.dueDate}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge tone={t.priority === 'High' ? 'danger' : t.priority === 'Medium' ? 'warning' : 'default'}>
                            {t.priority}
                          </Badge>
                          <select
                            className="ml-auto rounded-xl border bg-black/20 px-2 py-2 text-xs outline-none"
                            value={t.status}
                            onChange={e => {
                              const next = e.target.value as TaskStatus
                              updateDb(prev => ({ ...prev, tasks: prev.tasks.map(x => (x.id === t.id ? { ...x, status: next } : x)) }))
                              appendAudit({
                                actor: user?.email ?? 'unknown',
                                module: 'Ops',
                                entityId: t.id,
                                entityLabel: t.title,
                                field: 'status',
                                from: t.status,
                                to: next,
                              })
                            }}
                          >
                            {statuses.map(s => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                    {(tasksByStatus.get(status) || []).length === 0 && <div className="text-xs text-[var(--muted)]">No tasks.</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}
