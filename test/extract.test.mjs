import { describe, it, expect } from 'vitest'
import GithubSlugger from 'github-slugger'
import { splitSections, stripMarkdown } from '@/lib/search/extract.mjs'

const SAMPLE = `## 4.1 가산세 체계 ★

<Tbl scroll>
  <tr><td><strong>신고불성실</strong></td><td><F id="f_c40001">본세 × 10%</F></td></tr>
</Tbl>

본문 한 줄 설명.

## 4.3 원천세 납부지연 가산세

<Formula>
원천세 납부지연 가산세 = MIN(A, B)  &lt;한도 10%&gt;
</Formula>
`

describe('stripMarkdown', () => {
  it('removes JSX/HTML tags and keeps text', () => {
    const out = stripMarkdown('<F id="f_x">본세 × 10%</F> <strong>굵게</strong>')
    expect(out).toBe('본세 × 10% 굵게')
  })
  it('decodes the entities we use', () => {
    expect(stripMarkdown('MIN(A,B) &lt;한도&gt;')).toContain('<한도>')
  })
  it('keeps table cell text, drops pipes', () => {
    expect(stripMarkdown('| 구분 | 세율 |')).toBe('구분 세율')
  })
})

describe('splitSections', () => {
  const secs = splitSections(SAMPLE, 'ch4', '가산세·신고실무')

  it('splits by markdown headings', () => {
    expect(secs.length).toBe(2)
    expect(secs[0].heading).toBe('4.1 가산세 체계 ★')
    expect(secs[1].heading).toBe('4.3 원천세 납부지연 가산세')
  })
  it('strips JSX from indexed text', () => {
    expect(secs[0].text).toContain('본세 × 10%')
    expect(secs[0].text).not.toContain('<F')
    expect(secs[0].text).toContain('본문 한 줄 설명')
  })
  it('produces sectionId matching github-slugger (rehype-slug parity)', () => {
    const sg = new GithubSlugger()
    expect(secs[0].sectionId).toBe(sg.slug('4.1 가산세 체계 ★'))
    expect(secs[0].sectionId).toBeTruthy()
  })
  it('gives every section a unique id', () => {
    const ids = secs.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
