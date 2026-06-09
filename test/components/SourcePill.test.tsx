import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SourcePill } from '@/components/SourcePill'

describe('SourcePill', () => {
  it('renders source type label', () => {
    render(<SourcePill sourceType="NTS" sourceTitle="국세청 원천징수 개요" asOf="2026-06-08" lawRef="" lawUrl="" />)
    // SourcePill renders TYPE_LABEL: NTS → '국세청'
    expect(screen.getByText('국세청')).toBeInTheDocument()
  })
  it('has accessible label with source, asOf', () => {
    render(<SourcePill sourceType="LAW" sourceTitle="소득세법" asOf="2026-06-08" lawRef="소득세법 제127조" lawUrl="https://x" />)
    const el = screen.getByRole('note')
    expect(el).toHaveAttribute('aria-label', expect.stringContaining('출처'))
    expect(el.getAttribute('aria-label')).toContain('2026-06-08')
  })
  it('renders law link when lawUrl present', () => {
    render(<SourcePill sourceType="LAW" sourceTitle="소득세법" asOf="2026-06-08" lawRef="소득세법 제127조" lawUrl="https://law.go.kr/x" />)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://law.go.kr/x')
  })
})
