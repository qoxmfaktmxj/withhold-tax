import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Fact } from '@/components/Fact'
import type { Fact as FactData } from '@/lib/facts/schema'

const data: FactData = {
  id: 'f_a1b2c3', slug: 's', title: '', chapter: 'ch3', claim: '비영업대금 이익 25%', sourceType: 'LAW',
  sourceTitle: '소득세법', lawRef: '소득세법 제129조', lawUrl: 'https://law.go.kr/x', asOf: '2026-06-08',
  effectiveDate: '', verifyStatus: '확정', risk: 'low', changeType: '없음', previousValue: '',
  history: [{ date: '2026-06-08', author: 'kms', note: 'n' }], nextReviewBy: '',
  primarySourceVerified: false, confidenceScore: 0, subordinateLawRef: '', scopeLimitations: '',
  localTaxRef: '', supersededRefs: '', appliesFrom: '', sunsetDate: '', reviewerId: '',
  sourceIds: [], incomeType: '', appliesTo: '', implementationStatus: 'content_done',
  implementationImpact: { content: true, ui: false, calculation: false, reporting: false, migration: false },
}

describe('Fact', () => {
  it('renders children with source pill and verify status', () => {
    render(<Fact data={data}>비영업대금 이익은 <strong>25%</strong></Fact>)
    expect(screen.getByText(/비영업대금 이익은/)).toBeInTheDocument()
    // SourcePill shows TYPE_LABEL ('법령') and law ref link
    expect(screen.getByText(/법령/)).toBeInTheDocument()
    expect(screen.getByText(/확정/)).toBeInTheDocument()
  })
  it('강의기반 fact wires aria-describedby to unique per-fact disclosure id', () => {
    render(<Fact data={{ ...data, verifyStatus: '강의기반' }}>설명</Fact>)
    const region = screen.getByTestId('fact-f_a1b2c3')
    expect(region.getAttribute('aria-describedby')).toBe('vs-f_a1b2c3')
    const statusEl = document.getElementById('vs-f_a1b2c3')
    expect(statusEl).not.toBeNull()
  })
  it('확정 fact has no aria-describedby', () => {
    render(<Fact data={data}>설명</Fact>)
    const region = screen.getByTestId('fact-f_a1b2c3')
    expect(region).not.toHaveAttribute('aria-describedby')
  })
  it('two 강의기반 facts with different ids produce unique disclosure ids', () => {
    render(
      <>
        <Fact data={{ ...data, id: 'f_aaa111', verifyStatus: '강의기반' }}>첫번째</Fact>
        <Fact data={{ ...data, id: 'f_bbb222', verifyStatus: '강의기반' }}>두번째</Fact>
      </>
    )
    const region1 = screen.getByTestId('fact-f_aaa111')
    const region2 = screen.getByTestId('fact-f_bbb222')
    const id1 = region1.getAttribute('aria-describedby')
    const id2 = region2.getAttribute('aria-describedby')
    expect(id1).toBe('vs-f_aaa111')
    expect(id2).toBe('vs-f_bbb222')
    expect(id1).not.toBe(id2)
    // no duplicate ids in the document
    const allWithId1 = document.querySelectorAll(`#${id1}`)
    expect(allWithId1).toHaveLength(1)
    const allWithId2 = document.querySelectorAll(`#${id2}`)
    expect(allWithId2).toHaveLength(1)
  })
})
