import type { ReactNode } from 'react'
export function Formula({ children }: { children: ReactNode }) {
  return (
    <div className="mono" style={{ background: 'var(--color-surface-dark)', color: 'var(--color-on-dark)',
      padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', margin: 'var(--space-md) 0', lineHeight: 1.6 }}>
      {children}
    </div>
  )
}
