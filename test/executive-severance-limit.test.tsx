import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import retirementRulesRaw from '@/content/tax-rules/2026/retirement.json'
import { ExecutiveSeveranceLimitCalculator } from '@/components/calculators/ExecutiveSeveranceLimitCalculator'
import {
  THREE_X_END,
  THREE_X_START,
  TWO_X_START,
  calculateExecutiveSeveranceLimit,
  periodLimit,
  serviceMonths,
  type ExecutiveSeveranceInput,
  type ExecutiveSeveranceResult,
} from '@/lib/executive-severance/check'
import { loadRules } from '@/lib/rules/engine'

describe('calculateExecutiveSeveranceLimit', () => {
  it('단일구간 2배수 — 2021.1.1 취임·2026.12.31 퇴직(72개월), 한도 1.8억 (강의 Slide 277)', () => {
    const result = calculateExecutiveSeveranceLimit({
      totalSeverance: 300_000_000,
      joinDate: '2021-01-01',
      retireDate: '2026-12-31',
      avgAnnualSalary2x: 150_000_000,
    })

    expect(result).toMatchObject({
      valid: true,
      hasPre2012Service: false,
      totalLimit: 180_000_000,
      retirementIncome: 180_000_000,
      excessAmount: 120_000_000,
    })
    expect(result.periods).toHaveLength(1)
    expect(result.periods[0]).toMatchObject({
      periodKey: 'multiplier2',
      multiplier: 2,
      months: 72,
      limit: 180_000_000, // 1.5억 × 1/10 × 72/12 × 2배
    })
  })

  it('복수구간 — 2015.1.1 취임·2026.12.31 퇴직: 3배수 60개월 + 2배수 84개월 분리 계산 (강의 Slide 279~281)', () => {
    const result = calculateExecutiveSeveranceLimit({
      totalSeverance: 700_000_000,
      joinDate: '2015-01-01',
      retireDate: '2026-12-31',
      avgAnnualSalary3x: 100_000_000,
      avgAnnualSalary2x: 150_000_000,
    })

    expect(result.valid).toBe(true)
    expect(result.periods).toHaveLength(2)
    expect(result.periods[0]).toMatchObject({
      periodKey: 'multiplier3',
      multiplier: 3,
      startDate: '2015-01-01',
      endDate: '2019-12-31',
      months: 60,
      limit: 150_000_000, // 1억 × 1/10 × 60/12 × 3배
    })
    expect(result.periods[1]).toMatchObject({
      periodKey: 'multiplier2',
      multiplier: 2,
      startDate: '2020-01-01',
      endDate: '2026-12-31',
      months: 84,
      limit: 210_000_000, // 1.5억 × 1/10 × 84/12 × 2배
    })
    expect(result.totalLimit).toBe(360_000_000)
  })

  it('한도 초과분은 근로소득 전환액 — 복수구간 사례(Slide 301~302): 9억 − 한도 5.64억 = 3.36억', () => {
    const result = calculateExecutiveSeveranceLimit({
      totalSeverance: 900_000_000,
      joinDate: '2018-01-01',
      retireDate: '2026-12-31',
      avgAnnualSalary3x: 240_000_000,
      avgAnnualSalary2x: 300_000_000,
    })

    expect(result.periods[0]).toMatchObject({ months: 24, limit: 144_000_000 })
    expect(result.periods[1]).toMatchObject({ months: 84, limit: 420_000_000 })
    expect(result).toMatchObject({
      totalLimit: 564_000_000,
      excessAmount: 336_000_000, // 근로소득 전환액 = MAX(0, 퇴직금 − 총한도)
      retirementIncome: 564_000_000, // 퇴직소득 인정액 = MIN(퇴직금, 총한도)
    })
  })

  it('한도 내 — 퇴직금이 총한도 이하이면 초과분 0원·전액 퇴직소득 인정', () => {
    expect(
      calculateExecutiveSeveranceLimit({
        totalSeverance: 150_000_000,
        joinDate: '2021-01-01',
        retireDate: '2026-12-31',
        avgAnnualSalary2x: 150_000_000,
      })
    ).toMatchObject({
      valid: true,
      totalLimit: 180_000_000,
      excessAmount: 0,
      retirementIncome: 150_000_000,
    })
  })

  it('2011.12.31 이전 입사는 한도 미반영 경고, 날짜 역전은 invalid', () => {
    const pre2012 = calculateExecutiveSeveranceLimit({
      totalSeverance: 500_000_000,
      joinDate: '2010-01-01',
      retireDate: '2026-12-31',
      avgAnnualSalary3x: 100_000_000,
      avgAnnualSalary2x: 150_000_000,
    })
    expect(pre2012.hasPre2012Service).toBe(true)
    expect(pre2012.warnings.join(' ')).toContain('2011.12.31 이전 근속분')

    expect(
      calculateExecutiveSeveranceLimit({
        totalSeverance: 100_000_000,
        joinDate: '2026-01-01',
        retireDate: '2020-01-01',
      })
    ).toMatchObject({ valid: false, error: '퇴직일이 입사일보다 빠릅니다.' })
  })

  it('근속월수는 1개월 미만을 1개월로 올림 (Slide 273)', () => {
    expect(serviceMonths('2020-01-01', '2020-01-15')).toBe(1)
    expect(serviceMonths('2020-01-15', '2020-03-14')).toBe(2) // 정확히 2개월
    expect(serviceMonths('2020-01-15', '2020-03-20')).toBe(3) // 단수 6일 → 1개월 올림
    expect(periodLimit(150_000_000, 72, 2)).toBe(180_000_000)
  })
})

describe('executive_severance_limit rule — 룰 JSON ↔ lib 교차검증', () => {
  const rule = loadRules(retirementRulesRaw).find((r) => r.ruleId === 'executive_severance_limit')

  it('rule이 스키마를 통과하고 formula.params가 lib 상수와 일치', () => {
    expect(rule).toBeDefined()
    expect(rule!.calculationMode).toBe('manual-review')
    expect(rule!.formula.params).toMatchObject({
      salaryRatio: 0.1, // periodLimit()의 ÷120 = ×1/10 ×1/12 과 일치
      multiplier3x: 3,
      multiplier2x: 2,
      threeXStart: THREE_X_START,
      threeXEnd: THREE_X_END,
      twoXStart: TWO_X_START,
    })
  })

  it('examples 전건이 calculateExecutiveSeveranceLimit 계산과 일치', () => {
    expect(rule).toBeDefined()
    expect(rule!.examples.length).toBeGreaterThan(0)
    for (const example of rule!.examples) {
      const result = calculateExecutiveSeveranceLimit(example.input as ExecutiveSeveranceInput)
      expect(result.valid, `"${example.title}" valid`).toBe(true)

      // limit3x/limit2x 는 구간별 한도(periods[].limit)에 매핑
      const { limit3x, limit2x, ...rest } = example.expected as Record<string, number>
      if (limit3x !== undefined) {
        const period3 = result.periods.find((p) => p.periodKey === 'multiplier3')
        expect(period3?.limit, `"${example.title}" limit3x`).toBe(limit3x)
      }
      if (limit2x !== undefined) {
        const period2 = result.periods.find((p) => p.periodKey === 'multiplier2')
        expect(period2?.limit, `"${example.title}" limit2x`).toBe(limit2x)
      }
      for (const [key, value] of Object.entries(rest)) {
        expect(result[key as keyof ExecutiveSeveranceResult], `"${example.title}" key ${key}`).toEqual(value)
      }
    }
  })
})

describe('ExecutiveSeveranceLimitCalculator', () => {
  it('기본값 복수구간 사례 — 3배수 1.5억 + 2배수 2.1억, 초과 3.4억 근로소득 전환 표시', () => {
    render(<ExecutiveSeveranceLimitCalculator />)

    expect(screen.getByLabelText('퇴직금 총액')).toHaveValue('700000000')
    expect(screen.getByLabelText('입사일(임원 취임일)')).toHaveValue('2015-01-01')
    expect(screen.getByLabelText('퇴직일')).toHaveValue('2026-12-31')

    const result = screen.getByRole('region', { name: '임원퇴직금 한도 계산 결과' })
    expect(within(result).getByText('한도 초과 — 초과분은 근로소득으로 과세')).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '3배수 구간 한도 · 60개월 150,000,000원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '2배수 구간 한도 · 84개월 210,000,000원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '퇴직소득 한도 합계 360,000,000원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '근로소득 전환액 340,000,000원' })).toBeInTheDocument()
  })

  it('2020 이후 취임으로 변경 시 단일 2배수 구간 — 72개월 한도 1.8억', () => {
    render(<ExecutiveSeveranceLimitCalculator />)

    fireEvent.change(screen.getByLabelText('입사일(임원 취임일)'), {
      target: { value: '2021-01-01' },
    })
    fireEvent.change(screen.getByLabelText('퇴직금 총액'), { target: { value: '300000000' } })

    const result = screen.getByRole('region', { name: '임원퇴직금 한도 계산 결과' })
    expect(within(result).queryByRole('row', { name: /3배수 구간 한도/ })).not.toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '2배수 구간 한도 · 72개월 180,000,000원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '근로소득 전환액 120,000,000원' })).toBeInTheDocument()
  })

  it('퇴직금을 한도 이하로 변경 시 한도 이내 메시지·초과분 0원', () => {
    render(<ExecutiveSeveranceLimitCalculator />)

    fireEvent.change(screen.getByLabelText('퇴직금 총액'), { target: { value: '350000000' } })

    const result = screen.getByRole('region', { name: '임원퇴직금 한도 계산 결과' })
    expect(within(result).getByText('한도 이내 — 전액 퇴직소득 인정')).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '근로소득 전환액 0원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '퇴직소득 인정액 350,000,000원' })).toBeInTheDocument()
  })
})
