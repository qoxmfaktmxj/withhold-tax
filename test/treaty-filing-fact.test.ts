import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import factsRaw from '@/content/facts.json'

describe('제한세율 적용신청서 제출의무 fact', () => {
  it('f_nr0018은 법인세법 제98조의6 제출의무까지 확인된 근거를 담는다', () => {
    const fact = (factsRaw as Array<{
      id: string
      claim: string
      lawRef: string
      sourceIds: string[]
      primarySourceVerified: boolean
      scopeLimitations: string
    }>).find((item) => item.id === 'f_nr0018')

    expect(fact).toBeDefined()
    expect(fact?.primarySourceVerified).toBe(true)
    expect(fact?.claim).toContain('법인세법 제98조의6 제4항')
    expect(fact?.lawRef).toContain('법인세법 제98조의6 제4항')
    expect(fact?.sourceIds).toContain('src_law_go_kr')
    expect(fact?.scopeLimitations).not.toContain('현행본')
    expect(fact?.scopeLimitations).not.toContain('미확인')
  })

  it('비거주자·외국법인 본문도 법인세법 근거를 직접 표시한다', () => {
    const mdx = fs.readFileSync(path.join(process.cwd(), 'content/chapters/nonresident.mdx'), 'utf8')

    expect(mdx).toContain('법인세법 제98조의6 제4항')
    expect(mdx).not.toContain('외국법인(법인세법) 측 동일 의무는 1차 확인 미완')
  })
})
