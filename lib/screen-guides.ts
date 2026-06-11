/** Pure client-safe screen guide metadata — no Node.js fs/path imports */
import businessIncomePaymentSpec from '@/content/screen-specs/business-income-payment.json'
import employeeTaxProfileSpec from '@/content/screen-specs/employee-tax-profile.json'
import filingCalendarSpec from '@/content/screen-specs/filing-calendar.json'
import monthlyPayrollWithholdingSpec from '@/content/screen-specs/monthly-payroll-withholding.json'
import nonresidentPaymentSpec from '@/content/screen-specs/nonresident-payment.json'
import payItemMasterSpec from '@/content/screen-specs/pay-item-master.json'
import penaltyCalculatorSpec from '@/content/screen-specs/penalty-calculator.json'
import yearEndSettlementSpec from '@/content/screen-specs/year-end-settlement.json'

export type ScreenGuideSpecField = {
  key: string
  label?: string
  type: string
  required: boolean
  requiredWhen?: string
  source: string
  blocking?: boolean
  validation?: string
  helpText?: string
}

export type StructuredScreenGuideSpec = {
  screenId: string
  title: string
  fields: ScreenGuideSpecField[]
  ruleIds: string[]
  factIds: string[]
}

export const SCREEN_GUIDES: {
  slug: string
  title: string
  purpose: string
  role: string
}[] = [
  {
    slug: 'employee-tax-profile',
    title: '직원 세무정보',
    purpose: '거주자/비거주자 구분, 부양가족 수, 원천징수 방식 등 직원별 세무 입력값과 검증 규칙',
    role: 'HR 담당자',
  },
  {
    slug: 'pay-item-master',
    title: '급여항목 세무속성',
    purpose: '과세·비과세 급여 항목 코드, 한도, 지급명세서 반영 여부 등 항목별 세무 속성',
    role: 'HR·급여 담당자',
  },
  {
    slug: 'monthly-payroll-withholding',
    title: '월 급여 원천징수 실행',
    purpose: '간이세액표 기반 소득세·지방소득세 산정, 비과세 한도 검증, 지급 전 차단 조건',
    role: '급여 담당자',
  },
  {
    slug: 'year-end-settlement',
    title: '연말정산 정산결과',
    purpose: '공제 항목, 추가납부세액, 분납 적용, 결과 확정 전 검증 조건',
    role: 'HR·급여 담당자',
  },
  {
    slug: 'business-income-payment',
    title: '사업소득 지급',
    purpose: '인적용역 여부, 거주자 분기, 3.3% 적용 가능성, 간이지급명세서·분납 연결',
    role: '경리·급여 담당자',
  },
  {
    slug: 'nonresident-payment',
    title: '비거주자 지급',
    purpose: '비거주자·외국법인 소득 지급 시 조세조약, 제한세율 신청서, 제출기한, 첨부서류 상태',
    role: '경리·세무 담당자',
  },
  {
    slug: 'filing-calendar',
    title: '신고·제출 일정',
    purpose: '원천세 신고·납부, 지급명세서, 간이지급명세서, 제한세율 신청서 제출 일정과 알림 조건',
    role: '경리·세무 담당자',
  },
  {
    slug: 'penalty-calculator',
    title: '가산세 산정',
    purpose: '납부지연 가산세 산식, 2026.7 개정 전후 분기, 한도 적용, 수동 검토 조건',
    role: '세무 담당자',
  },
]

const _titleMap = new Map(SCREEN_GUIDES.map((g) => [g.slug, g.title]))
const _specMap = new Map<string, StructuredScreenGuideSpec>([
  ['employee-tax-profile', employeeTaxProfileSpec as StructuredScreenGuideSpec],
  ['pay-item-master', payItemMasterSpec as StructuredScreenGuideSpec],
  ['monthly-payroll-withholding', monthlyPayrollWithholdingSpec as StructuredScreenGuideSpec],
  ['year-end-settlement', yearEndSettlementSpec as StructuredScreenGuideSpec],
  ['business-income-payment', businessIncomePaymentSpec as StructuredScreenGuideSpec],
  ['nonresident-payment', nonresidentPaymentSpec as StructuredScreenGuideSpec],
  ['filing-calendar', filingCalendarSpec as StructuredScreenGuideSpec],
  ['penalty-calculator', penaltyCalculatorSpec as StructuredScreenGuideSpec],
])

export function screenGuideTitle(slug: string): string {
  return _titleMap.get(slug) ?? slug
}

export function getScreenGuideSpec(slug: string): StructuredScreenGuideSpec | undefined {
  return _specMap.get(slug)
}
