import type { ReactNode } from 'react'
export function Stats({ children }: { children: ReactNode }) {
  return <div className="wt-stats">{children}</div>
}
export function Stat({ value, label }: { value: ReactNode; label: ReactNode }) {
  return (
    <div className="wt-stat">
      <div className="wt-stat-value wt-mono">{value}</div>
      <div className="wt-stat-label">{label}</div>
    </div>
  )
}
