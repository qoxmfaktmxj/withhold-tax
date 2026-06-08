import type { ReactNode } from 'react'
export function Stats({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', margin: 'var(--space-md) 0' }}>{children}</div>
}
export function Stat({ value, label }: { value: ReactNode; label: ReactNode }) {
  return (
    <div style={{ background: 'var(--color-surface-card)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', minWidth: 120 }}>
      <div className="mono" style={{ fontSize: 24, color: 'var(--color-primary)' }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>{label}</div>
    </div>
  )
}
