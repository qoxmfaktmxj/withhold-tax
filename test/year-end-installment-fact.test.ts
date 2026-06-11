import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { FactsFileSchema } from '@/lib/facts/schema'

const factsPath = path.join(process.cwd(), 'content', 'facts.json')
const screenGuidePath = path.join(
  process.cwd(),
  'content',
  'screen-guides',
  'year-end-settlement.mdx'
)

describe('year-end settlement installment fact', () => {
  const facts = FactsFileSchema.parse(JSON.parse(fs.readFileSync(factsPath, 'utf8')))

  it('registers the earned income installment rule as a verified high-risk fact', () => {
    const fact = facts.find((item) => item.id === 'f_yas001')

    expect(fact).toMatchObject({
      id: 'f_yas001',
      slug: 'year-end-settlement.employee.installment',
      chapter: 'ch7',
      incomeType: 'earned',
      lawRef: '소득세법 제137조 제4항',
      risk: 'high',
      changeType: '없음',
      primarySourceVerified: true,
      verifyStatus: '확정',
      implementationImpact: {
        content: true,
        ui: true,
        calculation: true,
        reporting: true,
        migration: false,
      },
    })
    expect(fact?.claim).toContain('10만원')
    expect(fact?.claim).toContain('2월분부터 4월분')
    expect(fact?.sourceIds).toContain('src_law_go_kr')
  })

  it('links the year-end settlement screen guide to the fact id', () => {
    const screenGuide = fs.readFileSync(screenGuidePath, 'utf8')

    expect(screenGuide).toContain('<F id="f_yas001">')
    expect(screenGuide).not.toContain('분납 기준 및 절차: 소득세법 제137조 — 세무담당자 확인 필요.')
  })
})
