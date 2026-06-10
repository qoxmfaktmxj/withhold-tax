import { describe, it, expect } from 'vitest'
import sourcesRaw from '@/content/sources.json'
import factsRaw from '@/content/facts.json'
import { SourcesFileSchema, SourceRecordSchema } from '@/lib/sources/schema'
import { loadSources, sourceById } from '@/lib/sources/store'
import { FactsFileSchema } from '@/lib/facts/schema'

describe('SourceRecord schema', () => {
  it('accepts a valid record', () => {
    const r = SourceRecordSchema.parse({
      id: 'src_law_go_kr',
      type: 'LAW',
      title: '국가법령정보센터',
      publisher: '법제처',
      url: 'https://www.law.go.kr',
      accessedAt: '2026-06-10',
      reliability: 'primary',
    })
    expect(r.jurisdiction).toBe('KR') // default
  })

  it('rejects bad reliability', () => {
    expect(() =>
      SourceRecordSchema.parse({
        id: 'src_x',
        type: 'LAW',
        title: 't',
        publisher: 'p',
        url: 'https://x',
        accessedAt: '2026-06-10',
        reliability: 'blog',
      })
    ).toThrow()
  })
})

describe('content/sources.json', () => {
  const sources = loadSources(sourcesRaw)

  it('parses and has unique ids', () => {
    const ids = sources.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(sources.length).toBeGreaterThanOrEqual(5)
  })

  it('includes the primary law source', () => {
    expect(sourceById(sources, 'src_law_go_kr')?.reliability).toBe('primary')
  })
})

describe('facts ←→ sources integrity', () => {
  it('every fact sourceIds entry resolves to a registered source', () => {
    const sources = SourcesFileSchema.parse(sourcesRaw)
    const known = new Set(sources.map((s) => s.id))
    const facts = FactsFileSchema.parse(factsRaw)
    const missing: string[] = []
    for (const f of facts) {
      for (const sid of f.sourceIds) {
        if (!known.has(sid)) missing.push(`${f.id} → ${sid}`)
      }
    }
    expect(missing).toEqual([])
  })

  it('primary-source-verified facts are linked to the source registry', () => {
    const facts = FactsFileSchema.parse(factsRaw)
    const missing = facts
      .filter((f) => f.primarySourceVerified)
      .filter((f) => f.sourceIds.length === 0)
      .map((f) => f.id)

    expect(missing).toEqual([])
  })
})

describe('extended fact fields (backward compatible)', () => {
  it('parses legacy fact without new fields, applying defaults', () => {
    const legacy = {
      id: 'f_zz0001',
      slug: 'x.y',
      chapter: 'ch1',
      claim: 'c',
      sourceType: 'LAW',
      sourceTitle: 't',
      lawRef: '',
      lawUrl: '',
      asOf: '2026-06-09',
      effectiveDate: '',
      verifyStatus: '확정',
      risk: 'low',
      changeType: '없음',
      previousValue: '',
      history: [{ date: '2026-06-09', author: 'kms', note: 'n' }],
      nextReviewBy: '',
    }
    const f = FactsFileSchema.parse([legacy])[0]
    expect(f.sourceIds).toEqual([])
    expect(f.incomeType).toBe('')
    expect(f.implementationStatus).toBe('content_done')
    expect(f.implementationImpact).toEqual({
      content: true,
      ui: false,
      calculation: false,
      reporting: false,
      migration: false,
    })
    expect(f.appliesTo).toBe('')
  })
})
