import type { ReactNode } from 'react'

export function Flow({ steps }: { steps: ReactNode[] }) {
  return (
    <div className="wt-flow" role="list" aria-label="처리 흐름">
      {steps.map((s, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <span className="wt-flow-step" role="listitem">{s}</span>
          {i < steps.length - 1 && (
            <span aria-hidden className="wt-flow-arrow">→</span>
          )}
        </span>
      ))}
    </div>
  )
}
