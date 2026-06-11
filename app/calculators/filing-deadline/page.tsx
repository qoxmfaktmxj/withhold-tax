import { FilingDeadlineCalculator } from '@/components/calculators/FilingDeadlineCalculator'

export const metadata = { title: '신고·제출기한 계산기 — 원천징수 레퍼런스' }

export default function FilingDeadlinePage() {
  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>신고·제출기한 계산기</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '62ch' }}>
        지급일을 기준으로 원천세 신고·납부, 지급명세서, 간이지급명세서, 제한세율 신청서 제출기한을 rule 데이터로 산출합니다.
      </p>
      <FilingDeadlineCalculator />
    </article>
  )
}
