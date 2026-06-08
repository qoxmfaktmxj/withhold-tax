import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Fact } from '@/components/Fact'
import type { Fact as FactData } from '@/lib/facts/schema'

const data: FactData = {
  id: 'f_a1b2c3', slug: 's', chapter: 'ch3', claim: '비영업대금 이익 25%', sourceType: 'LAW',
  sourceTitle: '소득세법', lawRef: '소득세법 제129조', lawUrl: 'https://law.go.kr/x', asOf: '2026-06-08',
  effectiveDate: '', verifyStatus: '확정', risk: 'low', changeType: '없음', previousValue: '',
  history: [{ date: '2026-06-08', author: 'kms', note: 'n' }], nextReviewBy: '',
  primarySourceVerified: false, confidenceScore: 0, subordinateLawRef: '', scopeLimitations: '',
  localTaxRef: '', supersededRefs: '', appliesFrom: '', sunsetDate: '', reviewerId: '',
}

describe('Fact', () => {
  it('renders children with source pill and verify status', () => {
    render(<Fact data={data}>비영업대금 이익은 <strong>25%</strong></Fact>)
    expect(screen.getByText(/비영업대금 이익은/)).toBeInTheDocument()
    expect(screen.getByText('LAW')).toBeInTheDocument()
    expect(screen.getByText(/확정/)).toBeInTheDocument()
  })
  it('강의기반 fact wires aria-describedby to status disclosure', () => {
    render(<Fact data={{ ...data, verifyStatus: '강의기반' }}>설명</Fact>)
    const region = screen.getByTestId('fact-f_a1b2c3')
    expect(region.getAttribute('aria-describedby')).toContain('vs-강의기반')
  })
})
