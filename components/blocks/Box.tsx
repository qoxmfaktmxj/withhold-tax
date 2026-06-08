import type { ReactNode } from 'react'
const TONE = { imp: 'var(--color-primary)', note: 'var(--color-verified)', warn: 'var(--color-check)', tip: '#2c5f8a' } as const
export function Box({ kind, title, children }: { kind: keyof typeof TONE; title?: string; children: ReactNode }) {
  return (
    <aside style={{ borderLeft: `3px solid ${TONE[kind]}`, background: 'var(--color-surface-card)',
      padding: 'var(--space-md) var(--space-lg)', borderRadius: 'var(--radius-md)', margin: 'var(--space-md) 0' }}>
      {title && <strong style={{ color: TONE[kind] }}>{title}</strong>}
      <div>{children}</div>
    </aside>
  )
}
