import type { ReactNode } from 'react'
export function Tbl({ children, scroll }: { children: ReactNode; scroll?: boolean }) {
  return (
    <div style={{ overflowX: scroll ? 'auto' : undefined, margin: 'var(--space-md) 0' }}>
      <table className="wt-tbl">{children}</table>
    </div>
  )
}
