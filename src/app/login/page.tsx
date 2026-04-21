'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('ceo@elevatemedia.io')
  const [password, setPassword] = useState('demo')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    const res = await login({ email, password })
    setIsSubmitting(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    router.replace('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border bg-[var(--panel)] p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight">Elevate Media — Agency OS</div>
            <div className="text-sm text-[var(--muted)]">Demo login (role-based UI)</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wide text-[var(--muted)]">Email</label>
            <div className="flex items-center gap-2 rounded-2xl border bg-black/20 px-3 py-2">
              <Mail size={16} className="text-[var(--muted)]" />
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none text-sm"
                placeholder="you@agency.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wide text-[var(--muted)]">Password</label>
            <div className="flex items-center gap-2 rounded-2xl border bg-black/20 px-3 py-2">
              <Lock size={16} className="text-[var(--muted)]" />
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none text-sm"
                placeholder="demo"
                type="password"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-300">{error}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-[var(--accent)] text-black font-semibold py-3 hover:brightness-110 disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="rounded-2xl border bg-[var(--panel-strong)] p-4 text-sm text-[var(--muted)]">
            <div className="font-semibold text-[var(--foreground)]">Quick roles</div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                className="rounded-xl border bg-black/20 px-3 py-2 hover:bg-black/30"
                onClick={() => setEmail('ceo@elevatemedia.io')}
              >
                CEO
              </button>
              <button
                type="button"
                className="rounded-xl border bg-black/20 px-3 py-2 hover:bg-black/30"
                onClick={() => setEmail('sales@elevatemedia.io')}
              >
                Sales
              </button>
              <button
                type="button"
                className="rounded-xl border bg-black/20 px-3 py-2 hover:bg-black/30"
                onClick={() => setEmail('ops@elevatemedia.io')}
              >
                Ops
              </button>
            </div>
            <div className="mt-2 text-xs">
              Role is inferred from the email prefix for demo purposes.
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

