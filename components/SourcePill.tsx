import type { Fact } from '@/lib/facts/schema'
import { lawLink } from '@/lib/law-link'

type Props = Pick<Fact, 'sourceType' | 'sourceTitle' | 'asOf' | 'lawRef' | 'lawUrl'>

const TONE: Record<Fact['sourceType'], string> = {
  LAW: 'var(--color-primary)', EDICT: 'var(--color-primary)', INTERPRETATION: 'var(--color-verified)',
  NTS: 'var(--color-verified)', BOOK: 'var(--color-check)', LECTURE: 'var(--color-muted)', CASE: 'var(--color-muted)',
}

export function SourcePill({ sourceType, sourceTitle, asOf, lawRef, lawUrl }: Props) {
  const label = `출처: ${sourceTitle}${lawRef ? `, ${lawRef}` : ''}, 시행/확인일 ${asOf}`
  const href = lawUrl || (lawRef ? lawLink(lawRef).url : '')
  return (
    <span role="note" aria-label={label}
      className="mono" style={{ display: 'inline-flex', gap: 4, alignItems: 'center', padding: '2px 7px',
        borderRadius: 'var(--radius-pill)', border: `1px solid ${TONE[sourceType]}`, color: TONE[sourceType], fontSize: 10 }}>
      <span>{sourceType}</span>
      {href
        ? <a href={href} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>{lawRef || '법령'}</a>
        : lawRef ? <span>{lawRef}</span> : null}
      <span aria-hidden style={{ opacity: 0.7 }}>· {asOf}</span>
    </span>
  )
}
