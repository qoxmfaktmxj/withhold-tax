import type { ReactNode } from 'react'
export function Flow({ steps }: { steps: ReactNode[] }) {
  return (
    <div className="wt-flow">
      {steps.map((s, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
          <span className="wt-flow-step">{s}</span>
          {i < steps.length - 1 && (
            <span aria-hidden className="wt-flow-arrow">→</span>
          )}
        </span>
      ))}
    </div>
  )
}
