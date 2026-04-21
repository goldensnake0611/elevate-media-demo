import { ReactNode } from 'react'

export default function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) {
  const cls =
    tone === 'success'
      ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/25'
      : tone === 'warning'
        ? 'bg-amber-500/15 text-amber-200 border-amber-500/25'
        : tone === 'danger'
          ? 'bg-red-500/15 text-red-200 border-red-500/25'
          : tone === 'info'
            ? 'bg-sky-500/15 text-sky-200 border-sky-500/25'
            : 'bg-white/6 text-[var(--foreground)] border-[var(--border)]'

  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>{children}</span>
}

