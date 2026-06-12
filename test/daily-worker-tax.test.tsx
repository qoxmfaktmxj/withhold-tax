import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import withholdingRatesRaw from '@/content/tax-rules/2026/withholding-rates.json'
import { DailyWorkerTaxCalculator } from '@/components/calculators/DailyWorkerTaxCalculator'
import {
  DAILY_DEDUCTION,
  SMALL_SUM_THRESHOLD,
  calcDailyIncomeTax,
  calcDailyWorkerTax,
  floorToTen,
  type DailyWorkerTaxInput,
  type DailyWorkerTaxResult,
} from '@/lib/daily-worker/check'
import { loadRules } from '@/lib/rules/engine'

describe('calcDailyWorkerTax', () => {
  it('일당 187,000원 1일 — 일세액 999원 → 소액부징수로 0원 (강의 사례 1)', () => {
    expect(
      calcDailyWorkerTax({ dailyWage: 187_000, workDays: 1, paymentMethod: 'per_day' })
    ).toMatchObject({
      dailyIncomeTax: 999,
      calculatedTotalIncomeTax: 999,
      smallSumApplied: true,
      withheldIncomeTax: 0,
      withheldLocalTax: 0,
      totalWithheldTax: 0,
      netPay: 187_000,
      status: 'small_sum_exempt',
    })
  })

  it('일당 190,000원 1일 — 소득세 1,080원 징수 + 지방소득세 100원 (강의 사례 2)', () => {
    expect(
      calcDailyWorkerTax({ dailyWage: 190_000, workDays: 1, paymentMethod: 'per_day' })
    ).toMatchObject({
      dailyIncomeTax: 1_080,
      smallSumApplied: false,
      withheldIncomeTax: 1_080,
      withheldLocalTax: 100,
      totalWithheldTax: 1_180,
      netPay: 188_820,
      status: 'withhold',
    })
  })

  it('일당 150,000원 이하 — 세액 0원(소액부징수 아님)', () => {
    expect(
      calcDailyWorkerTax({ dailyWage: 150_000, workDays: 3, paymentMethod: 'per_day' })
    ).toMatchObject({
      dailyIncomeTax: 0,
      smallSumApplied: false,
      withheldIncomeTax: 0,
      withheldLocalTax: 0,
      netPay: 450_000,
      status: 'no_tax',
    })
  })

  it('일당 170,000원 — 결정세액 540원 → 소액부징수 (강의 슬라이드 145 사례)', () => {
    expect(calcDailyIncomeTax(170_000)).toBe(540)
    expect(
      calcDailyWorkerTax({ dailyWage: 170_000, workDays: 1, paymentMethod: 'lump_sum' })
    ).toMatchObject({ smallSumApplied: true, withheldIncomeTax: 0, status: 'small_sum_exempt' })
  })

  it('월 일괄 지급은 일별 세액 합계 기준 판정 — 187,000원 × 5일 = 4,995원 징수', () => {
    expect(
      calcDailyWorkerTax({ dailyWage: 187_000, workDays: 5, paymentMethod: 'lump_sum' })
    ).toMatchObject({
      dailyIncomeTax: 999,
      calculatedTotalIncomeTax: 4_995,
      smallSumApplied: false,
      withheldIncomeTax: 4_995,
      withheldLocalTax: 490,
      totalWithheldTax: 5_485,
      netPay: 929_515,
      status: 'withhold',
    })
  })

  it('일별 지급은 일 단위 판정 — 187,000원 × 5일도 전액 소액부징수', () => {
    expect(
      calcDailyWorkerTax({ dailyWage: 187_000, workDays: 5, paymentMethod: 'per_day' })
    ).toMatchObject({
      smallSumApplied: true,
      withheldIncomeTax: 0,
      withheldLocalTax: 0,
      netPay: 935_000,
      status: 'small_sum_exempt',
    })
  })

  it('지방소득세는 10원 미만 절사', () => {
    expect(floorToTen(108)).toBe(100)
  })
})

describe('daily_worker_wht rule — 룰 JSON ↔ lib 교차검증', () => {
  const rule = loadRules(withholdingRatesRaw).find((r) => r.ruleId === 'daily_worker_wht')

  it('rule이 스키마를 통과하고 formula.params가 lib 상수와 일치', () => {
    expect(rule).toBeDefined()
    expect(rule!.calculationMode).toBe('manual-review')
    expect(rule!.formula.params).toMatchObject({
      dailyDeduction: DAILY_DEDUCTION,
      rate: 0.06,
      taxCreditRate: 0.55,
      smallSumThreshold: SMALL_SUM_THRESHOLD,
      localRate: 0.1,
    })
    // lib의 정수 연산(× 27 / 1,000) ↔ params(6% × (1−55%) = 2.7%) 일관성
    const params = rule!.formula.params as { rate: number; taxCreditRate: number }
    expect(params.rate * (1 - params.taxCreditRate) * 1000).toBeCloseTo(27, 8)
  })

  it('examples 전건이 calcDailyWorkerTax 계산과 일치', () => {
    expect(rule).toBeDefined()
    expect(rule!.examples.length).toBeGreaterThan(0)
    for (const example of rule!.examples) {
      const result = calcDailyWorkerTax(example.input as DailyWorkerTaxInput)
      for (const [key, value] of Object.entries(example.expected)) {
        expect(result[key as keyof DailyWorkerTaxResult], `"${example.title}" key ${key}`).toEqual(value)
      }
    }
  })
})

describe('DailyWorkerTaxCalculator', () => {
  it('기본값 187,000원 × 1일 — 소액부징수 0원 표시', () => {
    render(<DailyWorkerTaxCalculator />)

    expect(screen.getByLabelText('일당')).toHaveValue('187000')
    expect(screen.getByLabelText('근무일수')).toHaveValue('1')

    const result = screen.getByRole('region', { name: '일용근로 원천징수 계산 결과' })
    expect(within(result).getByRole('row', { name: '일별 산정세액 999원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '소액부징수 적용' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '징수 소득세 0원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '실수령액 187,000원' })).toBeInTheDocument()
    expect(within(result).getByText('소액부징수 적용 — 원천징수 세액 0원')).toBeInTheDocument()
  })

  it('일당 190,000원으로 변경 시 1,080원 징수·실수령 188,820원', () => {
    render(<DailyWorkerTaxCalculator />)

    fireEvent.change(screen.getByLabelText('일당'), { target: { value: '190000' } })

    const result = screen.getByRole('region', { name: '일용근로 원천징수 계산 결과' })
    expect(within(result).getByRole('row', { name: '징수 소득세 1,080원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '지방소득세 100원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '실수령액 188,820원' })).toBeInTheDocument()
    expect(within(result).getByText('원천징수 대상')).toBeInTheDocument()
  })

  it('월 일괄 지급 선택 시 합계 기준으로 판정이 바뀜 (187,000원 × 5일)', () => {
    render(<DailyWorkerTaxCalculator />)

    fireEvent.change(screen.getByLabelText('근무일수'), { target: { value: '5' } })
    fireEvent.change(screen.getByRole('combobox', { name: '지급방식' }), {
      target: { value: 'lump_sum' },
    })

    const result = screen.getByRole('region', { name: '일용근로 원천징수 계산 결과' })
    expect(within(result).getByRole('row', { name: '산정세액 합계 4,995원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '소액부징수 미적용' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '징수 소득세 4,995원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '실수령액 929,515원' })).toBeInTheDocument()
  })
})
