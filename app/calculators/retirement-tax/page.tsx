import { RetirementTaxChecker } from '@/components/calculators/RetirementTaxChecker'

export const metadata = { title: '퇴직소득세 검산기 — 원천징수 레퍼런스' }

export default function RetirementTaxPage() {
  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>퇴직소득세 검산기</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '62ch' }}>
        공식 산출 퇴직소득세와 실제 원천징수 소득세·지방소득세를 비교해 차이를 검산합니다.
      </p>
      <RetirementTaxChecker />
    </article>
  )
}
