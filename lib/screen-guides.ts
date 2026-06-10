/** Pure client-safe screen guide metadata — no Node.js fs/path imports */

export const SCREEN_GUIDES: {
  slug: string
  title: string
  purpose: string
  role: string
}[] = [
  {
    slug: 'employee-tax-profile',
    title: '직원 세무 프로필',
    purpose: '거주자/비거주자 구분, 부양가족 수, 원천징수 방식 등 직원별 세무 기초 정보 관리',
    role: 'HR 담당자',
  },
  {
    slug: 'pay-item-master',
    title: '급여 항목 마스터',
    purpose: '과세·비과세 급여 항목 코드, 한도, 지급명세서 반영 여부 등 항목별 세무 속성 관리',
    role: 'HR·급여 담당자',
  },
  {
    slug: 'monthly-payroll-withholding',
    title: '월 급여 원천징수 계산',
    purpose: '간이세액표 기반 소득세·지방소득세 계산 결과 표시 및 비과세 한도 검증',
    role: '급여 담당자',
  },
  {
    slug: 'year-end-settlement',
    title: '연말정산',
    purpose: '근로소득 연말정산 공제 항목 입력, 추가납부세액 계산, 분납 적용',
    role: 'HR·급여 담당자',
  },
  {
    slug: 'business-income-payment',
    title: '사업소득 지급·연말정산',
    purpose: '인적용역 사업소득자 지급 내역 관리, 3.3% 원천징수, 분납 계획 수립',
    role: '경리·급여 담당자',
  },
  {
    slug: 'nonresident-payment',
    title: '비거주자·외국법인 지급',
    purpose: '비거주자·외국법인 소득 지급 시 조세조약·제한세율 적용 및 신청서 관리',
    role: '경리·세무 담당자',
  },
  {
    slug: 'filing-calendar',
    title: '원천세 신고·납부 캘린더',
    purpose: '월별 원천세 신고·납부 및 각종 지급명세서 제출 기한 알림 화면',
    role: '경리·세무 담당자',
  },
  {
    slug: 'penalty-calculator',
    title: '가산세 계산기',
    purpose: '납부지연 가산세 자동 계산(2026.7 개정 전/후 분기) 및 한도 확인',
    role: '세무 담당자',
  },
]

const _titleMap = new Map(SCREEN_GUIDES.map((g) => [g.slug, g.title]))

export function screenGuideTitle(slug: string): string {
  return _titleMap.get(slug) ?? slug
}
