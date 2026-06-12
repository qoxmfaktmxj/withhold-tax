import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import factsRaw from '@/content/facts.json'
import { loadFacts } from '@/lib/facts/store'

describe('foreign worker flat-rate content', () => {
  const facts = loadFacts(factsRaw)
  const ch8 = readFileSync(join(process.cwd(), 'content/chapters/ch8.mdx'), 'utf8')
  const glossary = readFileSync(join(process.cwd(), 'content/chapters/glossary.mdx'), 'utf8')
  const cheatsheet = readFileSync(join(process.cwd(), 'content/chapters/cheatsheet.mdx'), 'utf8')

  it('states the resident foreign worker flat-rate rules without a fixed breakeven claim', () => {
    expect(ch8).toContain('외국인 거주자')
    expect(ch8).toContain('2026.12.31 이전')
    expect(ch8).toContain('특수관계기업')
    expect(ch8).toContain('단일세율 계산용 근로소득 × 19%')
    expect(ch8).toContain('비과세·공제·감면·세액공제 배제')
    expect(ch8).toContain('손익분기점은 법령상 기준이 아니다')
    expect(ch8).not.toContain('총급여가 일정 수준(실무상 약 1억 6천만원)을 초과하면 19% 단일세율이 유리')
  })

  it('does not repeat the old 161 million breakeven shortcut in quick-reference content', () => {
    expect(glossary).toContain('개인별 비교')
    expect(glossary).not.toContain('총급여 1.61억 초과 시 유리')
    expect(cheatsheet).toContain('개인별 비교')
    expect(cheatsheet).not.toContain('1.61억↑')
  })

  it('keeps the breakeven fact as an unverified lecture estimate', () => {
    expect(facts.find((fact) => fact.id === 'f_c80012')).toMatchObject({
      sourceType: 'LECTURE',
      verifyStatus: '강의기반',
      primarySourceVerified: false,
    })
    expect(facts.find((fact) => fact.id === 'f_c80012')?.scopeLimitations).toContain('손익분기')
  })

  it('marks the 19 percent and 20-year rule as law-verified', () => {
    expect(facts.find((fact) => fact.id === 'f_c80013')).toMatchObject({
      sourceType: 'LAW',
      verifyStatus: '확정',
      primarySourceVerified: true,
      lawRef: '조세특례제한법 제18조의2, 조세특례제한법 시행령 제16조의2',
    })
    expect(facts.find((fact) => fact.id === 'f_c80013')?.claim).toContain('2026.12.31 이전')
    expect(facts.find((fact) => fact.id === 'f_c80013')?.claim).toContain('특수관계기업')
    expect(facts.find((fact) => fact.id === 'f_c80013')?.claim).toContain('비과세')
  })
})
