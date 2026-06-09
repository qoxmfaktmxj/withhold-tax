import type { Fact } from '@/lib/facts/schema'
import { lawLink } from '@/lib/law-link'

type Props = Pick<Fact, 'sourceType' | 'sourceTitle' | 'asOf' | 'lawRef' | 'lawUrl'>

// Source-type human label
const TYPE_LABEL: Record<Fact['sourceType'], string> = {
  LAW:            '법령',
  EDICT:          '시행령',
  INTERPRETATION: '해석',
  NTS:            '국세청',
  BOOK:           '도서',
  LECTURE:        '강의',
  CASE:           '판례',
}

export function SourcePill({ sourceType, sourceTitle, asOf, lawRef, lawUrl }: Props) {
  const href = lawUrl || (lawRef ? lawLink(lawRef).url : '')
  const label = `출처: ${sourceTitle}${lawRef ? ', ' + lawRef : ''}, 시행/확인일 ${asOf}`

  return (
    <span
      role="note"
      aria-label={label}
      className="wt-citation"
    >
      {' '}
      <span style={{ color: 'var(--color-muted-soft)' }}>§</span>{' '}
      {href ? (
        <a href={href} target="_blank" rel="noreferrer">
          {lawRef || sourceTitle}
        </a>
      ) : (
        <span>{lawRef || sourceTitle}</span>
      )}
      {asOf && (
        <>
          <span style={{ margin: '0 3px', opacity: 0.5 }}>·</span>
          <span>시행 {asOf.slice(0, 7).replace('-', '.')}</span>
        </>
      )}
      <span style={{ margin: '0 3px', opacity: 0.5 }}>·</span>
      <span>{TYPE_LABEL[sourceType]}</span>
    </span>
  )
}
