import type { ReactNode } from 'react'
export function Flow({ steps }: { steps: ReactNode[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', margin: 'var(--space-md) 0' }}>
      {steps.map((s, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: 'var(--color-surface-card)', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}>{s}</span>
          {i < steps.length - 1 && <span aria-hidden style={{ color: 'var(--color-primary)' }}>→</span>}
        </span>
      ))}
    </div>
  )
}
