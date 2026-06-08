import type { ReactNode } from 'react'
export function CaseNote({ title = '사례', children }: { title?: string; children: ReactNode }) {
  return (
    <aside style={{ border: `1px dashed var(--color-muted)`, borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', margin: 'var(--space-md) 0' }}>
      <span className="mono" style={{ fontSize: 11, color: 'var(--color-muted)' }}>{title}</span>
      <div>{children}</div>
    </aside>
  )
}
