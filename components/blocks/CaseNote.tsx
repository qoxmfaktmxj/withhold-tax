import type { ReactNode } from 'react'

export function CaseNote({ title = '사례', children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="wt-casenote" role="note" aria-label={`사례: ${title}`}>
      <span className="wt-casenote-label">{title}</span>
      <div>{children}</div>
    </aside>
  )
}
