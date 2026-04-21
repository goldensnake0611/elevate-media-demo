import { ReactNode } from 'react'

export default function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string
  value: string
  hint?: string
  icon?: ReactNode
}) {
  return (
    <div className="rounded-2xl border bg-[var(--panel-strong)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold tracking-wide text-[var(--muted)]">{label}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
          {hint && <div className="mt-1 text-xs text-[var(--muted)]">{hint}</div>}
        </div>
        {icon && <div className="h-10 w-10 rounded-2xl border bg-black/20 flex items-center justify-center">{icon}</div>}
      </div>
    </div>
  )
}

