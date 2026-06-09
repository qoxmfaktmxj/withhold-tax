import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UpdatesDashboard } from '@/components/UpdatesDashboard'
import type { Fact } from '@/lib/facts/schema'

const base: Fact = {
  id: 'f_000001', slug: 's', title: '', chapter: 'ch3', claim: '고배당 9% 폐지, 누진 분리과세', sourceType: 'LAW',
  sourceTitle: '조특법', lawRef: '조세특례제한법 제104조의27', lawUrl: '', asOf: '2026-06-08',
  effectiveDate: '2026-01-01', verifyStatus: '확정', risk: 'high', changeType: '신설',
  previousValue: '고배당 9% 분리과세', history: [{ date: '2026-06-08', author: 'kms', note: 'n' }], nextReviewBy: '',
  primarySourceVerified: false, confidenceScore: 0, subordinateLawRef: '', scopeLimitations: '',
  localTaxRef: '', supersededRefs: '', appliesFrom: '', sunsetDate: '', reviewerId: '',
}

describe('UpdatesDashboard', () => {
  it('lists 2026 changes with before/after and effective date', () => {
    render(<UpdatesDashboard facts={[base]} />)
    expect(screen.getByText(/2026-01-01/)).toBeInTheDocument()
    expect(screen.getByText(/고배당 9% 분리과세/)).toBeInTheDocument()
    expect(screen.getByText(/신설/)).toBeInTheDocument()
  })
  it('renders empty state when no changes', () => {
    render(<UpdatesDashboard facts={[]} />)
    expect(screen.getByText(/개정 항목 없음/)).toBeInTheDocument()
  })
})
