import deadlinesRaw from '@/content/tax-rules/2026/deadlines.json'
import { calculateDeadline, loadRules } from '@/lib/rules/engine'

export type NonresidentPayeeType = 'individual' | 'foreign_corporation'
export type NonresidentIncomeType = 'interest' | 'dividend' | 'business' | 'royalty' | 'earned' | 'other'
export type NonresidentRateMode = 'domestic_law' | 'domestic_law_required' | 'treaty_ready'
export type TreatyApplicationFilingStatus =
  | 'not_required'
  | 'required_not_filed'
  | 'filed'
  | 'overdue'
export type NonresidentIssueSeverity = 'error' | 'warning' | 'info'

export type NonresidentPaymentInput = {
  paymentDate: string
  payeeType: NonresidentPayeeType
  incomeType: NonresidentIncomeType
  treatyApplied: boolean
  treatyApplicationFormDate: string | null
  residenceCertificateDate: string | null
  beneficialOwnerConfirmed: boolean
  taxOfficeFilingDate: string | null
  baseDate?: string
}

export type NonresidentPaymentIssue = {
  code: string
  severity: NonresidentIssueSeverity
  message: string
}

export type NonresidentPaymentDecision = {
  filingDeadline: string
  treatyApplicationFilingStatus: TreatyApplicationFilingStatus
  rateMode: NonresidentRateMode
  blockingErrors: NonresidentPaymentIssue[]
  warnings: NonresidentPaymentIssue[]
  checklistItems: string[]
  factIds: string[]
}

const DEADLINE_RULE = loadRules(deadlinesRaw).find(
  (rule) => rule.ruleId === 'treaty_reduced_rate_application_filing'
)

function daysBetween(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00Z`).getTime()
  const end = new Date(`${endDate}T00:00:00Z`).getTime()
  return Math.round((end - start) / 86_400_000)
}

function todayYmd() {
  return new Date().toISOString().slice(0, 10)
}

function filingStatus(
  treatyApplied: boolean,
  taxOfficeFilingDate: string | null,
  baseDate: string,
  filingDeadline: string
): TreatyApplicationFilingStatus {
  if (!treatyApplied) return 'not_required'
  if (taxOfficeFilingDate) return 'filed'
  return daysBetween(baseDate, filingDeadline) < 0 ? 'overdue' : 'required_not_filed'
}

export function evaluateNonresidentPayment(input: NonresidentPaymentInput): NonresidentPaymentDecision {
  if (!DEADLINE_RULE) throw new Error('treaty_reduced_rate_application_filing rule is missing')

  const filingDeadline = calculateDeadline(DEADLINE_RULE, { paymentDate: input.paymentDate }).dueDate
  const blockingErrors: NonresidentPaymentIssue[] = []
  const warnings: NonresidentPaymentIssue[] = [
    {
      code: 'local_income_tax_separate',
      severity: 'info',
      message: '지방소득세 특별징수는 별도 확인합니다.',
    },
  ]

  if (input.treatyApplied && !input.treatyApplicationFormDate) {
    blockingErrors.push({
      code: 'treaty_application_form_required',
      severity: 'error',
      message: '조세조약 적용 시 제한세율 신청서 수령일이 필수입니다. 저장할 수 없습니다.',
    })
  }

  if (input.treatyApplied && !input.residenceCertificateDate) {
    warnings.push({
      code: 'residence_certificate_missing',
      severity: 'warning',
      message: '거주자증명서 수령일이 없습니다. 보관 여부를 확인하세요.',
    })
  }

  if (!input.beneficialOwnerConfirmed) {
    warnings.push({
      code: 'beneficial_owner_unconfirmed',
      severity: 'warning',
      message: '실질귀속자 확인이 완료되지 않았습니다. 조약 혜택 적용 전 확인하세요.',
    })
  }

  if (input.payeeType === 'foreign_corporation') {
    warnings.push({
      code: 'foreign_corporation_treaty_filing',
      severity: 'info',
      message: '외국법인 지급은 법인세법 제98조의6 제4항에 따라 제한세율 신청서등을 익년 2월 말까지 세무서에 제출합니다.',
    })
  }

  const baseDate = input.baseDate ?? todayYmd()
  const treatyApplicationFilingStatus = filingStatus(
    input.treatyApplied,
    input.taxOfficeFilingDate,
    baseDate,
    filingDeadline
  )
  if (input.treatyApplied && !input.taxOfficeFilingDate) {
    const daysUntilDeadline = daysBetween(baseDate, filingDeadline)
    if (daysUntilDeadline < 0) {
      warnings.push({
        code: 'filing_overdue',
        severity: 'error',
        message: '세무서 제출 기한이 경과하였습니다. 가산세 가능성을 세무담당자와 확인하세요.',
      })
    } else {
      if (daysUntilDeadline <= 30) {
        warnings.push({
          code: 'filing_due_soon_30',
          severity: 'warning',
          message: '세무서 제출 기한 30일 이내입니다. 서류 제출을 서두르세요.',
        })
      }
      if (daysUntilDeadline <= 7) {
        warnings.push({
          code: 'filing_due_soon_7',
          severity: 'error',
          message: '세무서 제출 기한 7일 이내입니다. 즉시 처리하세요.',
        })
      }
    }
  }

  const rateMode: NonresidentRateMode = input.treatyApplied
    ? input.treatyApplicationFormDate
      ? 'treaty_ready'
      : 'domestic_law_required'
    : 'domestic_law'

  return {
    filingDeadline,
    treatyApplicationFilingStatus,
    rateMode,
    blockingErrors,
    warnings,
    checklistItems: [
      '제한세율 신청서 수령',
      '거주자증명서 보관',
      '실질귀속자 확인',
      '익년 2월 말 세무서 제출',
      '지방소득세 특별징수 별도 확인',
    ],
    factIds: ['f_nr0014', 'f_nr0015', 'f_nr0016', 'f_nr0018'],
  }
}
