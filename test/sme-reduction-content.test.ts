import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import factsRaw from '@/content/facts.json'
import { loadFacts } from '@/lib/facts/store'

describe('SME employee income tax reduction content', () => {
  const facts = loadFacts(factsRaw)
  const ch6 = readFileSync(join(process.cwd(), 'content/chapters/ch6.mdx'), 'utf8')

  it('adds a ch6 section for SME employee reduction rules', () => {
    expect(ch6).toContain('## 중소기업취업자 소득세 감면')
    expect(ch6).toContain('<F id="f_c80011">')
    for (const text of ['청년', '90%', '5년', '60세 이상', '장애인', '경력단절 근로자', '70%', '3년', '연 200만원', '2026.12.31']) {
      expect(ch6).toContain(text)
    }
    expect(ch6).toContain('경력단절 근로자는 성별을 전제로 쓰지 않는다')
    expect(ch6).toContain('감면기간은 최초 취업일 기준')
  })

  it('summarizes adjacent incentive regimes without over-expanding the chapter', () => {
    expect(ch6).toContain('성과공유 중소기업 경영성과급')
    expect(ch6).toContain('핵심인력 성과보상기금')
    expect(ch6).toContain('내국인 우수인력 국내복귀')
    expect(ch6).toContain('50%·10년')
  })

  it('marks the SME employment fact as verified from the law text', () => {
    expect(facts.find((fact) => fact.id === 'f_c80011')).toMatchObject({
      sourceType: 'LAW',
      verifyStatus: '확정',
      primarySourceVerified: true,
      lawRef: '조세특례제한법 제30조',
    })
    expect(facts.find((fact) => fact.id === 'f_c80011')?.claim).toContain('과세기간별 감면 한도는 200만원')
  })
})
