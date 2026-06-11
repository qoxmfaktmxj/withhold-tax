import { describe, expect, it } from 'vitest'
import searchIndexRaw from '@/content/search-index.json'
import type { SearchDocKind } from '@/lib/search/build-index'

describe('generated search index content kinds', () => {
  const docs = searchIndexRaw as Array<{
    id: string
    kind?: SearchDocKind
    heading: string
    text: string
    href?: string
  }>

  it('indexes internal-reference objects beyond chapter sections', () => {
    const kinds = new Set(docs.map((doc) => doc.kind))

    expect(Array.from(kinds)).toEqual(
      expect.arrayContaining([
        'chapter-section',
        'fact',
        'tax-rule',
        'screen-guide',
        'source',
        'watch-item',
      ])
    )
  })

  it('includes searchable fact, rule, screen guide, source, and watch entries with hrefs', () => {
    expect(docs.find((doc) => doc.id === 'fact:f_yas001')?.href).toBe('/ch/ch7')
    expect(docs.find((doc) => doc.id === 'tax-rule:treaty_reduced_rate_application_filing')?.href)
      .toBe('/tools/filing-deadline')
    expect(docs.find((doc) => doc.id === 'screen-guide:nonresident-payment')?.href)
      .toBe('/screen-guides/nonresident-payment')
    expect(docs.find((doc) => doc.id === 'source:src_law_go_kr')?.href).toBe('/sources')
    expect(docs.find((doc) => doc.id === 'watch-item:watch_2027_dividend_grossup')?.href)
      .toBe('/updates-2026')
  })

  it('uses unique document ids for versioned rules', () => {
    const ids = docs.map((doc) => doc.id)

    expect(new Set(ids).size).toBe(ids.length)
  })
})
