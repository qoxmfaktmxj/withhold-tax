/**
 * 임원퇴직금 한도 검산 — 소득세법 §22③ · 소득세법 시행령 §42조의2
 *
 * 산식(강의 PPT Slide 273·275·448):
 *   구간별 한도 = 연평균환산액 × 1/10 × (근속월수 ÷ 12) × 배수
 *   - 2012.1.1 ~ 2019.12.31 근속분: 3배수
 *   - 2020.1.1 ~ 퇴직일 근속분: 2배수
 *   - 근속월수는 1개월 미만을 1개월로 올림(Slide 273)
 *   총한도 = 구간별 한도 합산, 한도 초과분 = MAX(0, 퇴직금 − 총한도) → 근로소득 과세
 *
 * ⚠ 2011.12.31 이전 근속분은 한도 없음(별도 안분 규정) — 본 계산기 미반영.
 *   실무 참조용 추정치이며 최종 확인은 법령·홈택스·세무대리인 기준이 우선.
 */

export const THREE_X_START = '2012-01-01'
export const THREE_X_END = '2019-12-31'
export const TWO_X_START = '2020-01-01'

export type ExecutiveSeverancePeriodLimit = {
  periodKey: 'multiplier3' | 'multiplier2'
  label: string
  startDate: string
  endDate: string
  months: number
  multiplier: 2 | 3
  avgAnnualSalary: number
  limit: number
}

export type ExecutiveSeveranceInput = {
  /** 퇴직급여 지급규정에 따른 퇴직금 총액(원) */
  totalSeverance: number
  /** 입사일(임원 취임일) YYYY-MM-DD */
  joinDate: string
  /** 퇴직일 YYYY-MM-DD */
  retireDate: string
  /** 2019.12.31 기준 직전 3년('17.1.1~'19.12.31) 총급여 연평균환산액 — 구간 3년 미만이면 해당 기간 연환산 */
  avgAnnualSalary3x?: number
  /** 퇴직일 소급 직전 3년 총급여 연평균환산액 */
  avgAnnualSalary2x?: number
}

export type ExecutiveSeveranceResult = {
  valid: boolean
  error?: string
  totalSeverance: number
  hasPre2012Service: boolean
  periods: ExecutiveSeverancePeriodLimit[]
  /** 구간별 한도 합산 */
  totalLimit: number
  /** 퇴직소득 인정액 = MIN(퇴직금, 총한도) */
  retirementIncome: number
  /** 근로소득 전환액 = MAX(0, 퇴직금 − 총한도) */
  excessAmount: number
  warnings: string[]
}

const YMD = /^\d{4}-\d{2}-\d{2}$/

function parseYmd(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return { year, month, day }
}

function nextDay(value: string): string {
  const { year, month, day } = parseYmd(value)
  const d = new Date(Date.UTC(year, month - 1, day + 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

/**
 * 구간 근속월수: 시작일~종료일(포함) 개월 수.
 * 1개월 미만 단수는 1개월로 올림 처리(강의 Slide 273 — "1개월 미만은 1개월로 올림").
 */
export function serviceMonths(startYmd: string, endYmd: string): number {
  if (endYmd < startYmd) return 0
  const s = parseYmd(startYmd)
  const e = parseYmd(nextDay(endYmd)) // 종료일 포함 → 익일 기준 비교
  const base = (e.year - s.year) * 12 + (e.month - s.month)
  return base + (e.day > s.day ? 1 : 0)
}

/** 구간 한도 = 연평균환산액 × 1/10 × (근속월수/12) × 배수 — 원 미만 절사 */
export function periodLimit(avgAnnualSalary: number, months: number, multiplier: 2 | 3): number {
  const avg = Math.max(0, Math.floor(avgAnnualSalary || 0))
  const m = Math.max(0, Math.floor(months || 0))
  return Math.floor((avg * m * multiplier) / 120)
}

export function calculateExecutiveSeveranceLimit(input: ExecutiveSeveranceInput): ExecutiveSeveranceResult {
  const totalSeverance = Math.max(0, Math.floor(input.totalSeverance || 0))
  const warnings: string[] = []

  const invalid = (error: string): ExecutiveSeveranceResult => ({
    valid: false,
    error,
    totalSeverance,
    hasPre2012Service: false,
    periods: [],
    totalLimit: 0,
    retirementIncome: 0,
    excessAmount: 0,
    warnings,
  })

  if (!YMD.test(input.joinDate) || !YMD.test(input.retireDate)) {
    return invalid('입사일과 퇴직일을 YYYY-MM-DD 형식으로 입력하세요.')
  }
  if (input.retireDate < input.joinDate) {
    return invalid('퇴직일이 입사일보다 빠릅니다.')
  }

  const hasPre2012Service = input.joinDate < THREE_X_START
  if (hasPre2012Service) {
    warnings.push(
      '2011.12.31 이전 근속분은 한도 없음(별도 안분 규정) — 본 계산기 미반영. 2012.1.1 이후 구간만 한도를 계산했습니다.'
    )
  }

  const periods: ExecutiveSeverancePeriodLimit[] = []

  // 3배수 구간: 2012.1.1 ~ 2019.12.31 중 실제 근속분
  const start3 = input.joinDate > THREE_X_START ? input.joinDate : THREE_X_START
  const end3 = input.retireDate < THREE_X_END ? input.retireDate : THREE_X_END
  if (start3 <= end3) {
    const months = serviceMonths(start3, end3)
    const avg = Math.max(0, Math.floor(input.avgAnnualSalary3x ?? 0))
    if (avg <= 0) {
      warnings.push('3배수 구간(2012~2019) 연평균환산액 미입력 — 해당 구간 한도를 0원으로 계산했습니다.')
    }
    if (months < 36) {
      warnings.push('3배수 구간 근무기간이 3년 미만 — 해당 기간 총급여를 실제 기간으로 연환산한 금액을 입력해야 합니다.')
    }
    periods.push({
      periodKey: 'multiplier3',
      label: '3배수 구간',
      startDate: start3,
      endDate: end3,
      months,
      multiplier: 3,
      avgAnnualSalary: avg,
      limit: periodLimit(avg, months, 3),
    })
  }

  // 2배수 구간: 2020.1.1 ~ 퇴직일 중 실제 근속분
  if (input.retireDate >= TWO_X_START) {
    const start2 = input.joinDate > TWO_X_START ? input.joinDate : TWO_X_START
    const months = serviceMonths(start2, input.retireDate)
    const avg = Math.max(0, Math.floor(input.avgAnnualSalary2x ?? 0))
    if (avg <= 0) {
      warnings.push('2배수 구간(2020~) 연평균환산액 미입력 — 해당 구간 한도를 0원으로 계산했습니다.')
    }
    periods.push({
      periodKey: 'multiplier2',
      label: '2배수 구간',
      startDate: start2,
      endDate: input.retireDate,
      months,
      multiplier: 2,
      avgAnnualSalary: avg,
      limit: periodLimit(avg, months, 2),
    })
  }

  const totalLimit = periods.reduce((sum, p) => sum + p.limit, 0)
  const excessAmount = Math.max(0, totalSeverance - totalLimit)
  const retirementIncome = totalSeverance - excessAmount

  return {
    valid: true,
    totalSeverance,
    hasPre2012Service,
    periods,
    totalLimit,
    retirementIncome,
    excessAmount,
    warnings,
  }
}
