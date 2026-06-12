import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import employeeLocalTaxRaw from '@/content/tax-rules/2026/employee-local-tax.json'
import { EmployeeLocalTaxCalculator } from '@/components/calculators/EmployeeLocalTaxCalculator'
import {
  EXEMPTION_THRESHOLD,
  LONG_SERVICE_CAP_PER_PERSON,
  LONG_SERVICE_RATE,
  STANDARD_RATE,
  checkEmployeeLocalTax,
  filingDeadlineFor,
  floorToTen,
  type EmployeeLocalTaxInput,
  type EmployeeLocalTaxResult,
} from '@/lib/employee-local-tax/check'
import { loadRules } from '@/lib/rules/engine'

describe('checkEmployeeLocalTax', () => {
  it('면세점 이하 — 월평균 급여총액 1억 4천만원 → 비과세(신고의무 없음)', () => {
    expect(
      checkEmployeeLocalTax({ avgMonthlyPayroll: 140_000_000, monthlyPayrollTotal: 140_000_000 })
    ).toMatchObject({
      exempt: true,
      tax: 0,
      filingDeadline: null,
      filingDeadlineNote: '면세점 이하 — 신고의무 없음(다만 매월 면세점 판단은 필요)',
    })
  })

  it('면세점 경계 — 월평균 정확히 1억 8천만원도 면세(≤ 기준)', () => {
    expect(
      checkEmployeeLocalTax({
        avgMonthlyPayroll: EXEMPTION_THRESHOLD,
        monthlyPayrollTotal: 190_000_000,
      })
    ).toMatchObject({ exempt: true, tax: 0 })
  })

  it('기존 1억 5천만원 초과 구간인 1억 6천만원도 현행 1억 8천만원 기준에서는 면세', () => {
    expect(
      checkEmployeeLocalTax({ avgMonthlyPayroll: 160_000_000, monthlyPayrollTotal: 160_000_000 })
    ).toMatchObject({ exempt: true, tax: 0 })
  })

  it('과세 사업장 기본 세액 — 공제 없음, 당월 급여총액 2억원 × 0.5% = 100만원', () => {
    expect(
      checkEmployeeLocalTax({ avgMonthlyPayroll: 200_000_000, monthlyPayrollTotal: 200_000_000 })
    ).toMatchObject({
      exempt: false,
      totalDeduction: 0,
      taxBase: 200_000_000,
      taxRatePercent: 0.5,
      tax: 1_000_000,
    })
  })

  it('2026 신설 공제 2종 — 강의 종합사례(Slide 54, ㈜한백테크 2026년 5월분)', () => {
    expect(
      checkEmployeeLocalTax({
        avgMonthlyPayroll: 181_000_000,
        monthlyPayrollTotal: 180_000_000,
        longServiceEmployeeCount: 10,
        longServiceAllowancePerEmployee: 400_000,
        longServiceMonthlyPayPerEmployee: 4_000_000,
        childcareReplacementPay: 15_000_000,
        otherDeduction: 14_940_000,
        paymentMonth: '2026-05',
      })
    ).toMatchObject({
      exempt: false,
      // 1인당 MIN(400,000, 4,000,000×10%=400,000, 360,000) = 360,000 → ×10명
      longServiceDeductionPerEmployee: 360_000,
      longServiceDeduction: 3_600_000,
      childcareDeduction: 15_000_000,
      otherDeduction: 14_940_000,
      totalDeduction: 33_540_000,
      taxBase: 146_460_000,
      tax: 732_300,
      filingDeadline: '2026-06-10',
    })
  })

  it('장기근속수당 공제는 MIN(지급액, 월급여×10%, 36만원) — 10% 한도가 더 작으면 10% 적용', () => {
    expect(
      checkEmployeeLocalTax({
        avgMonthlyPayroll: 200_000_000,
        monthlyPayrollTotal: 200_000_000,
        longServiceEmployeeCount: 5,
        longServiceAllowancePerEmployee: 400_000,
        longServiceMonthlyPayPerEmployee: 3_000_000, // 10% = 300,000 < 360,000
      })
    ).toMatchObject({
      longServiceDeductionPerEmployee: 300_000,
      longServiceDeduction: 1_500_000,
      taxBase: 198_500_000,
      tax: 992_500,
    })
  })

  it('공제 합계가 당월 급여총액을 초과해도 과세표준은 음수가 되지 않음', () => {
    expect(
      checkEmployeeLocalTax({
        avgMonthlyPayroll: 200_000_000,
        monthlyPayrollTotal: 10_000_000,
        childcareReplacementPay: 20_000_000,
      })
    ).toMatchObject({ exempt: false, taxBase: 0, tax: 0 })
  })

  it('세액은 10원 미만 절사', () => {
    expect(floorToTen(732_305)).toBe(732_300)
  })

  it('신고기한은 지급월 다음 달 10일 — 12월분은 익년 1월 10일', () => {
    expect(filingDeadlineFor('2026-12')).toBe('2027-01-10')
    expect(filingDeadlineFor('잘못된값')).toBeNull()
  })
})

describe('employee_local_tax rule — 룰 JSON ↔ lib 교차검증', () => {
  const rule = loadRules(employeeLocalTaxRaw).find((r) => r.ruleId === 'employee_local_tax')

  it('rule이 스키마를 통과하고 formula.params가 lib 상수와 일치', () => {
    expect(rule).toBeDefined()
    expect(rule!.calculationMode).toBe('manual-review')
    expect(rule!.formula.params).toMatchObject({
      standardRate: STANDARD_RATE,
      exemptionThreshold: EXEMPTION_THRESHOLD,
      longServiceRate: LONG_SERVICE_RATE,
      longServiceCapPerPerson: LONG_SERVICE_CAP_PER_PERSON,
      filingDeadlineDay: 10, // filingDeadlineFor()의 다음 달 10일과 일치
    })
  })

  it('examples 전건이 checkEmployeeLocalTax 계산과 일치', () => {
    expect(rule).toBeDefined()
    expect(rule!.examples.length).toBeGreaterThan(0)
    for (const example of rule!.examples) {
      const result = checkEmployeeLocalTax(example.input as EmployeeLocalTaxInput)
      for (const [key, value] of Object.entries(example.expected)) {
        expect(result[key as keyof EmployeeLocalTaxResult], `"${example.title}" key ${key}`).toEqual(value)
      }
    }
  })
})

describe('EmployeeLocalTaxCalculator', () => {
  it('기본값 법령 검증 사례 — 과세표준 146,460,000원·세액 732,300원 표시', () => {
    render(<EmployeeLocalTaxCalculator />)

    expect(screen.getByLabelText('직전 12개월 월평균 급여총액')).toHaveValue('181000000')
    expect(screen.getByLabelText('당월 급여총액(비과세 제외)')).toHaveValue('180000000')

    const result = screen.getByRole('region', { name: '종업원분 주민세 계산 결과' })
    expect(within(result).getByText('면세점 초과 — 종업원분 주민세 신고 대상')).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '장기근속수당 공제 -3,600,000원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '육아휴직 대체인력 공제 -15,000,000원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '과세표준 146,460,000원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '세액(표준세율 0.5%) 732,300원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '신고기한 2026-06-10' })).toBeInTheDocument()
  })

  it('월평균 급여총액을 1억 4천만원으로 변경 시 면세 판정·세액 0원', () => {
    render(<EmployeeLocalTaxCalculator />)

    fireEvent.change(screen.getByLabelText('직전 12개월 월평균 급여총액'), {
      target: { value: '140000000' },
    })

    const result = screen.getByRole('region', { name: '종업원분 주민세 계산 결과' })
    expect(
      within(result).getByText('면세점 이하 — 종업원분 주민세 비과세(신고의무 없음)')
    ).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '세액(표준세율 0.5%) 0원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '신고기한 —' })).toBeInTheDocument()
  })
})
