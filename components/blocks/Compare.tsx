import type { ReactNode } from 'react'

export function Compare({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="wt-compare">
      <div className="wt-compare-side">{left}</div>
      <span className="wt-compare-vs wt-mono">vs</span>
      <div className="wt-compare-side">{right}</div>
    </div>
  )
}
