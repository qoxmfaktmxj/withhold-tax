import { describe, it, expect } from 'vitest'
import { buildIndex, searchIndex } from '@/lib/search/build-index'

const docs = [
  { id: 'f_a00001', chapter: 'ch3', title: '소액부징수', text: '거주자 인적용역 사업소득 2024.7.1 1000원 미만 원천징수' },
  { id: 'f_a00008', chapter: 'ch6', title: '식대 비과세', text: '식대 비과세 월 20만원 현물 전액' },
]

describe('search', () => {
  it('builds index and finds by Korean term', () => {
    const idx = buildIndex(docs)
    const r = searchIndex(idx, '식대')
    expect(r[0].id).toBe('f_a00008')
  })
  it('supports prefix match', () => {
    const idx = buildIndex(docs)
    expect(searchIndex(idx, '소액').map((x) => x.id)).toContain('f_a00001')
  })
})
