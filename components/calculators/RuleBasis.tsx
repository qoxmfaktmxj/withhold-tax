import factsRaw from '@/content/facts.json'
import { loadFacts } from '@/lib/facts/store'
import { SourcePill } from '@/components/SourcePill'
import { VerifyStatus } from '@/components/VerifyStatus'
import type { TaxRule } from '@/lib/rules/schema'

const FACTS = Object.fromEntries(loadFacts(factsRaw).map((f) => [f.id, f]))

/** 계산기 하단 근거 블록: rule이 참조하는 fact들의 인용 라인 + 검증상태 + 경고 */
export function RuleBasis({ rule }: { rule: TaxRule }) {
  const facts = rule.factIds.map((id) => FACTS[id]).filter(Boolean)
  return (
    <div style={{ marginTop: 'var(--space-lg)' }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.68rem',
          fontWeight: 700,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: 'var(--gray-500)',
          marginBottom: 8,
        }}
      >
        계산 근거 · rule {rule.ruleId}@{rule.version}
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
        {facts.map((f) => (
          <li
            key={f.id}
            style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              fontSize: '0.84rem',
            }}
          >
            <span style={{ fontWeight: 600, marginRight: 6 }}>{f.title}</span>
            <VerifyStatus status={f.verifyStatus} />
            <div style={{ marginTop: 4 }}>
              <SourcePill
                sourceType={f.sourceType}
                sourceTitle={f.sourceTitle}
                asOf={f.asOf}
                lawRef={f.lawRef}
                lawUrl={f.lawUrl}
              />
            </div>
          </li>
        ))}
      </ul>
      {rule.warnings.length > 0 && (
        <ul
          style={{
            margin: '10px 0 0',
            padding: '10px 14px 10px 28px',
            background: 'var(--caution-bg)',
            border: '1px solid var(--caution-border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            color: 'var(--gray-700)',
          }}
        >
          {rule.warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
      <p style={{ marginTop: 10, fontSize: '0.74rem', color: 'var(--gray-500)' }}>
        ⚠️ 본 계산기는 사내 참고용 추정치입니다. 신고·납부 전 국세청·홈택스·세무대리인 확인이 우선하며,
        납부고지 이후 금액은 고지서 기준이 우선합니다.
      </p>
    </div>
  )
}
