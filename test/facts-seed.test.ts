import { describe, it, expect } from 'vitest'
import raw from '@/content/facts.json'
import { loadFacts } from '@/lib/facts/store'

describe('seeded facts.json', () => {
  it('passes schema validation', () => {
    expect(() => loadFacts(raw)).not.toThrow()
  })
  it('has at least the pilot facts', () => {
    expect(loadFacts(raw).length).toBeGreaterThanOrEqual(10)
  })
  it('high-dividend fact is corrected (no standalone 9%)', () => {
    const facts = loadFacts(raw)
    const hd = facts.find((f) => f.slug === 'ch03.high-dividend.special-tax')
    expect(hd).toBeDefined()
    expect(hd!.claim).toMatch(/누진|14|20|25|30/)
    expect(hd!.previousValue).toMatch(/9%/)
  })
})
