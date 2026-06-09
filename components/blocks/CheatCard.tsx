import type { ReactNode } from 'react'
export function CheatCard({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="wt-cheatcard">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  )
}
