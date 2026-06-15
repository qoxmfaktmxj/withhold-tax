import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import factsRaw from '@/content/facts.json'
import sourcesRaw from '@/content/sources.json'
import { loadFacts } from '@/lib/facts/store'
import { loadSources, sourceById } from '@/lib/sources/store'

describe('ch9 retirement income expanded content', () => {
  const mdx = readFileSync(join(process.cwd(), 'content/chapters/ch9.mdx'), 'utf8')
  const facts = loadFacts(factsRaw)
  const sources = loadSources(sourcesRaw)

  it('adds the 2023 before/after service-year deduction table', () => {
    expect(mdx).toContain('## 9.4-1 근속연수공제 2023 확대 전후')
    expect(mdx).toContain('<F id="f_r90001">')
    for (const text of [
      '2023.1.1',
      '30만원',
      '50만원',
      '80만원',
      '120만원',
      '100만원',
      '200만원',
      '250만원',
      '300만원',
    ]) {
      expect(mdx).toContain(text)
    }
  })

  it('documents the five converted-salary deduction bands', () => {
    expect(mdx).toContain('## 9.4-2 환산급여공제 5구간')
    expect(mdx).toContain('<F id="f_r90002">')
    for (const text of [
      '800만원 이하',
      '7,000만원 이하',
      '1억원 이하',
      '3억원 이하',
      '3억원 초과',
      '4,520만원',
      '6,170만원',
      '1억 5,170만원',
      '35%',
    ]) {
      expect(mdx).toContain(text)
    }
  })

  it('adds the yellow-umbrella deduction retirement-income treatment', () => {
    expect(mdx).toContain('## 9.2-1 노란우산공제 퇴직소득 인정')
    expect(mdx).toContain('<F id="f_r90003">')
    for (const text of [
      '조세특례제한법 제86조의3',
      '조세특례제한법 시행령 제80조의3',
      '퇴직소득',
      '폐업',
      '해산',
      '공제 가입자 사망',
      '대표자의 지위 상실',
      '60세 이상',
      '120개월',
    ]) {
      expect(mdx).toContain(text)
    }
  })

  it('registers the new facts with verified official sources', () => {
    expect(sourceById(sources, 'src_nts_retirement_income_tax')).toMatchObject({
      type: 'NTS_GUIDE',
      publisher: '국세청',
      reliability: 'official-guide',
    })

    expect(facts.find((fact) => fact.id === 'f_r90001')).toMatchObject({
      sourceType: 'LAW',
      verifyStatus: '확정',
      primarySourceVerified: true,
      sourceIds: expect.arrayContaining(['src_law_go_kr', 'src_nts_retirement_income_tax']),
      lawRef: expect.stringContaining('소득세법 제48조'),
    })
    expect(facts.find((fact) => fact.id === 'f_r90002')).toMatchObject({
      sourceType: 'LAW',
      verifyStatus: '확정',
      primarySourceVerified: true,
      sourceIds: expect.arrayContaining(['src_law_go_kr', 'src_nts_retirement_income_tax']),
      lawRef: expect.stringContaining('소득세법 제48조'),
    })
    expect(facts.find((fact) => fact.id === 'f_r90003')).toMatchObject({
      sourceType: 'LAW',
      verifyStatus: '확정',
      primarySourceVerified: true,
      sourceIds: ['src_law_go_kr'],
      lawRef: expect.stringContaining('조세특례제한법 제86조의3'),
      subordinateLawRef: expect.stringContaining('조세특례제한법 시행령 제80조의3'),
    })
  })
})
