import type { ReactNode } from 'react'

export function Formula({ children }: { children: ReactNode }) {
  return (
    <div className="wt-formula wt-mono" role="math" aria-label="수식">
      {children}
    </div>
  )
}
