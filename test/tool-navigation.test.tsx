import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Home from '@/app/page'
import CalculatorsPage from '@/app/calculators/page'
import ToolsPage from '@/app/tools/page'
import ScreenGuidesIndexPage from '@/app/screen-guides/page'
import ReviewDuePage from '@/app/review-due/page'
import BusinessIncomeCalculatorPage from '@/app/calculators/business-income/page'
import MonthlyWithholdingPage from '@/app/calculators/monthly-withholding/page'
import PenaltyCalculatorPage from '@/app/calculators/penalty/page'
import RetirementTaxPage from '@/app/calculators/retirement-tax/page'
import SalaryNetPayPage from '@/app/calculators/salary-net-pay/page'
import StatementPenaltyPage from '@/app/calculators/statement-penalty/page'
import YearEndInstallmentPage from '@/app/calculators/year-end-installment/page'

describe('tool navigation', () => {
  it('does not promote the simple business income 3.3% calculator from home tools', () => {
    render(<Home />)

    const tools = screen.getByRole('list', { name: '도구' })

    expect(within(tools).queryByText(/사업소득/)).not.toBeInTheDocument()
    expect(within(tools).queryByText(/화면 개발 가이드/)).not.toBeInTheDocument()
    expect(within(tools).getByText('실무 도구').closest('a')).toHaveAttribute('href', '/tools')
  })

  it('shows reference health as status badges on the home page', () => {
    render(<Home />)

    const status = screen.getByRole('list', { name: '레퍼런스 상태' })

    expect(within(status).getByRole('listitem', { name: '전체 fact 237' })).toBeInTheDocument()
    expect(within(status).getByRole('listitem', { name: '1차 원문 확인 89' })).toBeInTheDocument()
    expect(within(status).getByRole('listitem', { name: '원문 미확인 148' })).toBeInTheDocument()
    expect(within(status).queryByRole('listitem', { name: '확인 필요 0' })).not.toBeInTheDocument()
    expect(within(status).getByRole('listitem', { name: '검토 임박 4' })).toBeInTheDocument()
    expect(within(status).getByRole('listitem', { name: '링크 오류 0' })).toBeInTheDocument()
    expect(within(status).getByRole('listitem', { name: '마지막 법령 점검 2026-06-12' })).toBeInTheDocument()
  })

  it('keeps the tools index focused on practical risk tools', () => {
    render(<ToolsPage />)

    expect(screen.getByRole('heading', { name: '실무 도구' })).toBeInTheDocument()
    expect(screen.getByText('원천세 미납·가산세 리스크 진단')).toBeInTheDocument()
    expect(screen.getByText('월 급여 원천징수 검산기')).toBeInTheDocument()
    expect(screen.getByText('비과세 급여 한도 검산기')).toBeInTheDocument()
    expect(screen.getByText('신고·제출기한 계산기')).toBeInTheDocument()
    expect(screen.getByText('비거주자 지급 체크리스트')).toBeInTheDocument()
    expect(screen.getByText('연봉·실수령액 계산기')).toBeInTheDocument()
    expect(screen.getByText('연말정산 추가세액 분납 스케줄러')).toBeInTheDocument()
    expect(screen.getByText('지급명세서·간이지급명세서 가산세 계산기')).toBeInTheDocument()
    expect(screen.getByText('퇴직소득세 검산기')).toBeInTheDocument()
    expect(screen.queryByText(/사업소득 원천징수\(3\.3%\)/)).not.toBeInTheDocument()
  })

  it('keeps the calculators index as a compatibility surface for practical tools', () => {
    render(<CalculatorsPage />)

    expect(
      screen.getByRole('heading', { name: '급여·세무 시뮬레이터' })
    ).toBeInTheDocument()
    expect(screen.getByText('원천세 미납·가산세 리스크 진단')).toBeInTheDocument()
    expect(screen.getByText('월 급여 원천징수 검산기')).toBeInTheDocument()
    expect(screen.getByText('비과세 급여 한도 검산기')).toBeInTheDocument()
    expect(screen.getByText('신고·제출기한 계산기')).toBeInTheDocument()
    expect(screen.getByText('비거주자 지급 체크리스트')).toBeInTheDocument()
    expect(screen.getByText('연봉·실수령액 계산기')).toBeInTheDocument()
    expect(screen.getByText('연말정산 추가세액 분납 스케줄러')).toBeInTheDocument()
    expect(screen.getByText('지급명세서·간이지급명세서 가산세 계산기')).toBeInTheDocument()
    expect(screen.getByText('퇴직소득세 검산기')).toBeInTheDocument()
    expect(screen.queryByText(/사업소득 원천징수\(3\.3%\)/)).not.toBeInTheDocument()
  })

  it('names screen guides as implementation checklists', () => {
    render(<ScreenGuidesIndexPage />)

    expect(screen.getByRole('heading', { name: '구현 체크리스트' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: '업무 객체 구현 체크리스트 목록' })).toBeInTheDocument()
    expect(screen.getByText('직원 세무정보')).toBeInTheDocument()
    expect(screen.getByText('급여항목 세무속성')).toBeInTheDocument()
    expect(screen.getByText('신고·제출 일정')).toBeInTheDocument()
    expect(screen.queryByText('직원 세무 프로필')).not.toBeInTheDocument()
    expect(screen.queryByText('원천세 신고·납부 캘린더')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '화면 개발 가이드' })).not.toBeInTheDocument()
  })

  it('names the review due page as an operations queue', () => {
    render(<ReviewDuePage />)

    expect(screen.getByRole('heading', { name: '운영 검토 큐' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '우선순위별 수정 목록' })).toBeInTheDocument()
    expect(
      screen.getByRole('listitem', { name: 'P0 1 implementationStatus 기본값 변경 완료' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('listitem', { name: 'P1 4 employee_yas_installment fact/rule 추가 완료' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('listitem', { name: 'P2 3 fact ID 발급 스크립트 완료' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '검토 임박 항목' })).not.toBeInTheDocument()
  })

  it('frames the business income 3.3% surface as a rule demo', () => {
    render(<BusinessIncomeCalculatorPage />)

    expect(
      screen.getByRole('heading', { name: '사업소득 원천징수 rule demo (3.3%)' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /계산기/ })).not.toBeInTheDocument()
  })

  it('names the penalty tool as a risk diagnosis', () => {
    render(<PenaltyCalculatorPage />)

    expect(
      screen.getByRole('heading', { name: '원천세 미납·가산세 리스크 진단' })
    ).toBeInTheDocument()
  })

  it('adds the monthly withholding checker as a practical tool page', () => {
    render(<MonthlyWithholdingPage />)

    expect(
      screen.getByRole('heading', { name: '월 급여 원천징수 검산기' })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('간이세액표 소득세')).toBeInTheDocument()
  })

  it('adds the salary net pay checker as a practical tool page', () => {
    render(<SalaryNetPayPage />)

    expect(
      screen.getByRole('heading', { name: '연봉·실수령액 검산기' })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('월 총급여')).toBeInTheDocument()
  })

  it('adds the retirement tax checker as a practical tool page', () => {
    render(<RetirementTaxPage />)

    expect(
      screen.getByRole('heading', { name: '퇴직소득세 검산기' })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('공식 산출 퇴직소득세')).toBeInTheDocument()
  })

  it('adds the year-end installment scheduler as a practical tool page', () => {
    render(<YearEndInstallmentPage />)

    expect(
      screen.getByRole('heading', { name: '연말정산 추가세액 분납 스케줄러' })
    ).toBeInTheDocument()
    expect(screen.getAllByText(/2월부터 4월까지/).length).toBeGreaterThan(0)
  })

  it('adds the payment statement penalty calculator as a practical tool page', () => {
    render(<StatementPenaltyPage />)

    expect(
      screen.getByRole('heading', { name: '지급명세서·간이지급명세서 가산세 계산기' })
    ).toBeInTheDocument()
    expect(screen.getAllByText(/미제출·지연제출/).length).toBeGreaterThan(0)
  })
})
