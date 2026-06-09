import { describe, it, expect } from 'vitest'
import { buildIndex, searchIndex, type Doc } from '@/lib/search/build-index'

const docs: Doc[] = [
  {
    id: 'ch3__2',
    chapter: 'ch3',
    sectionId: '소액부징수',
    heading: '소액부징수',
    text: '거주자 인적용역 사업소득 2024.7.1 1000원 미만 원천징수',
  },
  {
    id: 'ch6__1',
    chapter: 'ch6',
    sectionId: '식대-비과세',
    heading: '식대 비과세',
    text: '식대 비과세 월 20만원 현물 전액',
  },
]

describe('search', () => {
  it('builds index and finds by Korean term', () => {
    const idx = buildIndex(docs)
    const r = searchIndex(idx, '식대')
    expect(r[0].id).toBe('ch6__1')
  })

  it('supports prefix match', () => {
    const idx = buildIndex(docs)
    expect(searchIndex(idx, '소액').map((x) => x.id)).toContain('ch3__2')
  })

  it('carries sectionId + chapter for deep-link navigation', () => {
    const idx = buildIndex(docs)
    const r = searchIndex(idx, '식대')
    expect(r[0].chapter).toBe('ch6')
    expect(r[0].sectionId).toBe('식대-비과세')
  })

  it('finds body-text matches that are not in any heading', () => {
    const idx = buildIndex(docs)
    // "현물" appears only in body text, never in a heading
    expect(searchIndex(idx, '현물').map((x) => x.id)).toContain('ch6__1')
  })
})
