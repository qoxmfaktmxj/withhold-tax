import { describe, it, expect } from 'vitest'
import { lawLink } from '@/lib/law-link'

describe('lawLink', () => {
  it('returns text + best-effort url for 소득세법 제127조', () => {
    const r = lawLink('소득세법 제127조')
    expect(r.text).toBe('소득세법 제127조')
    expect(r.url).toContain('law.go.kr')
    expect(r.url).toContain('소득세법')
  })
  it('returns empty url when ref is empty', () => {
    expect(lawLink('')).toEqual({ text: '', url: '' })
  })
  it('handles 조특법 abbreviation', () => {
    expect(lawLink('조세특례제한법 제104조의27').url).toContain('조세특례제한법')
  })
  it('handles law name with no article (url contains lawName, no trailing slash-article)', () => {
    const r = lawLink('소득세법')
    expect(r.text).toBe('소득세법')
    expect(r.url).toContain('law.go.kr')
    expect(r.url).toContain('소득세법')
    // no article appended after the law name segment
    expect(r.url).not.toContain('%EC%A0%9C') // '제' encoded
  })
})
