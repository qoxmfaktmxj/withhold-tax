import type { ReactNode } from 'react'
export function CheatCard({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div style={{ background: 'var(--color-surface-card)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)' }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div>{children}</div>
    </div>
  )
}
