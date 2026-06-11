import { NonresidentPaymentChecklist } from '@/components/calculators/NonresidentPaymentChecklist'

export const metadata = { title: '비거주자 지급 체크리스트 — 원천징수 레퍼런스' }

export default function NonresidentPaymentCheckPage() {
  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>비거주자 지급 체크리스트</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '62ch' }}>
        조세조약 적용, 제한세율 신청서, 거주자증명서, 실질귀속자 확인, 세무서 제출기한을 지급 건별로 점검합니다.
      </p>
      <NonresidentPaymentChecklist />
    </article>
  )
}
