'use client'

export function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  const keys = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach(k => set.add(k))
      return set
    }, new Set<string>())
  )

  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v)
    const needsQuotes = /[",\n]/.test(s)
    const escaped = s.replace(/"/g, '""')
    return needsQuotes ? `"${escaped}"` : escaped
  }

  const csv = [keys.join(','), ...rows.map(r => keys.map(k => esc(r[k])).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function printPdf(title: string, html: string) {
  const w = window.open('', '_blank', 'noopener,noreferrer')
  if (!w) return
  w.document.open()
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>${title}</title><style>
    body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;margin:24px;color:#111}
    h1{margin:0 0 16px;font-size:20px}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{border:1px solid #ddd;padding:8px;text-align:left;vertical-align:top}
    th{background:#f5f5f5}
  </style></head><body>${html}</body></html>`)
  w.document.close()
  w.focus()
  w.print()
}

