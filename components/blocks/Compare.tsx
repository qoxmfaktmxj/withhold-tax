import type { ReactNode } from 'react'
export function Compare({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 'var(--space-md)', alignItems: 'center', margin: 'var(--space-md) 0' }}>
      <div style={{ background: 'var(--color-surface-card)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)' }}>{left}</div>
      <span className="mono" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>VS</span>
      <div style={{ background: 'var(--color-surface-card)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)' }}>{right}</div>
    </div>
  )
}
