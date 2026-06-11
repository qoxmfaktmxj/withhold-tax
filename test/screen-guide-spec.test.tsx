import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SCREEN_GUIDES, getScreenGuideSpec } from '@/lib/screen-guides'
import { StructuredScreenSpec } from '@/components/guides/StructuredScreenSpec'

describe('structured screen guide specs', () => {
  it('loads every screen guide spec from JSON-backed structured data', () => {
    expect(SCREEN_GUIDES.map((guide) => guide.slug)).toEqual([
      'employee-tax-profile',
      'pay-item-master',
      'monthly-payroll-withholding',
      'year-end-settlement',
      'business-income-payment',
      'nonresident-payment',
      'filing-calendar',
      'penalty-calculator',
    ])

    for (const guide of SCREEN_GUIDES) {
      const spec = getScreenGuideSpec(guide.slug)
      expect(spec?.screenId).toBe(guide.slug)
      expect(spec?.title).toBe(guide.title)
      expect(spec?.fields.length).toBeGreaterThan(0)
    }
  })

  it('loads employee, payroll, and filing specs as structured data', () => {
    expect(getScreenGuideSpec('employee-tax-profile')?.fields.map((field) => field.key)).toContain('residenceType')
    expect(getScreenGuideSpec('monthly-payroll-withholding')?.fields.map((field) => field.key)).toContain('taxableGross')
    expect(getScreenGuideSpec('filing-calendar')?.fields.map((field) => field.key)).toContain('treatyFormDueDate')
  })

  it('loads the nonresident payment screen spec as structured data', () => {
    const spec = getScreenGuideSpec('nonresident-payment')

    expect(spec).toMatchObject({
      screenId: 'nonresident-payment',
      ruleIds: ['nonresident_general_wht', 'treaty_reduced_rate_application_filing'],
    })
    expect(spec?.title).toBe('비거주자 지급')
    expect(spec?.factIds).toEqual(expect.arrayContaining(['f_nr0018', 'f_nr0014', 'f_nr0015']))
    expect(spec?.fields).toContainEqual(
      expect.objectContaining({
        key: 'treatyApplicationFormDate',
        type: 'date|null',
        requiredWhen: 'treatyApplied === true',
        blocking: true,
      })
    )
  })

  it('renders structured fields and rule/fact links', () => {
    const specData = getScreenGuideSpec('nonresident-payment')
    expect(specData).toBeDefined()
    render(<StructuredScreenSpec spec={specData!} />)

    const spec = screen.getByRole('region', { name: '구조화 화면 명세' })
    expect(within(spec).getByText('treatyApplied')).toBeInTheDocument()
    expect(within(spec).getByText('treatyApplicationFormDate')).toBeInTheDocument()
    expect(within(spec).getByText('nonresident_general_wht')).toBeInTheDocument()
    expect(within(spec).getByText('f_nr0018')).toBeInTheDocument()
  })
})
