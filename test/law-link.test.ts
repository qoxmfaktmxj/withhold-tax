import { describe, it, expect } from 'vitest'
import { lawLink } from '@/lib/law-link'

describe('lawLink', () => {
  it('returns text + best-effort url for 소득세법 제127조', () => {
    const r = lawLink('소득세법 제127조')
    expect(r.text).toBe('소득세법 제127조')
    expect(r.url).toContain('law.go.kr')
    expect(decodeURIComponent(r.url)).toContain('소득세법')
  })
  it('returns empty url when ref is empty', () => {
    expect(lawLink('')).toEqual({ text: '', url: '' })
  })
  it('handles 조특법 abbreviation', () => {
    expect(decodeURIComponent(lawLink('조세특례제한법 제104조의27').url)).toContain('조세특례제한법')
  })
  it('handles law name with no article (url contains lawName, no trailing slash-article)', () => {
    const r = lawLink('소득세법')
    expect(r.text).toBe('소득세법')
    expect(r.url).toContain('law.go.kr')
    expect(decodeURIComponent(r.url)).toContain('소득세법')
  })
  it('encodes spaced law names with no raw space', () => {
    const r = lawLink('법인세법 시행령 제207조')
    expect(r.url).not.toContain(' ')
    expect(decodeURIComponent(r.url)).toContain('법인세법 시행령')
    expect(decodeURIComponent(r.url)).toContain('제207조')
  })
})
