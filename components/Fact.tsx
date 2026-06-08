import type { ReactNode } from 'react'
import type { Fact as FactData } from '@/lib/facts/schema'
import { SourcePill } from './SourcePill'
import { VerifyStatus } from './VerifyStatus'

export function Fact({ data, children }: { data: FactData; children: ReactNode }) {
  const describedBy = data.verifyStatus === '강의기반' ? `vs-강의기반` : undefined
  const muted = data.verifyStatus === '강의기반'
  return (
    <span data-testid={`fact-${data.id}`} data-fact-id={data.id} aria-describedby={describedBy}
      style={{ background: muted ? 'color-mix(in srgb, var(--color-lecture) 10%, transparent)' : undefined }}>
      {children}{' '}
      <SourcePill sourceType={data.sourceType} sourceTitle={data.sourceTitle} asOf={data.asOf} lawRef={data.lawRef} lawUrl={data.lawUrl} />
      {' '}
      <VerifyStatus status={data.verifyStatus} />
    </span>
  )
}
