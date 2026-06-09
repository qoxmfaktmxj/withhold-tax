import type { ReactNode } from 'react'

const KIND_LABEL: Record<string, string> = {
  imp:  '중요',
  note: '참고',
  warn: '주의',
  tip:  '팁',
}

export function Box({
  kind,
  title,
  children,
}: {
  kind: 'imp' | 'note' | 'warn' | 'tip'
  title?: string
  children: ReactNode
}) {
  return (
    <aside className={`wt-box wt-box--${kind}`} role="note">
      <span className="wt-box-label">
        {title || KIND_LABEL[kind] || kind}
      </span>
      <div>{children}</div>
    </aside>
  )
}
