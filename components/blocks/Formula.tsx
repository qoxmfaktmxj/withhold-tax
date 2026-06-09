import type { ReactNode } from 'react'
export function Formula({ children }: { children: ReactNode }) {
  return (
    <div className="wt-formula wt-mono">
      {children}
    </div>
  )
}
