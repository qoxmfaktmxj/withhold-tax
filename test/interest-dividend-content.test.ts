import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import factsRaw from '@/content/facts.json'
import { loadFacts } from '@/lib/facts/store'

describe('interest-dividend expanded content', () => {
  const facts = loadFacts(factsRaw)
  const mdx = readFileSync(join(process.cwd(), 'content/chapters/interest-dividend.mdx'), 'utf8')

  it('adds the interest 13-type withholding-rate table from slides 480-482', () => {
    expect(mdx).toContain('## 이자소득 13유형 원천징수세율')
    expect(mdx).toContain('<F id="f_id0013">')
    for (const text of [
      '국가·지방자치단체 발행 채권',
      '직장공제회 초과반환금',
      '기본세율',
      '비영업대금의 이익',
      '25%',
      '비실명 이자·배당',
      '45%',
      '금융실명법상 비실명 금융자산',
      '90%',
      '공모부동산집합투자기구',
      '9%',
      '조세특례제한법 제87조의7',
    ]) {
      expect(mdx).toContain(text)
    }
  })

  it('adds the nine income-timing rows for interest and dividend income', () => {
    expect(mdx).toContain('## 이자·배당 귀속시기 9유형')
    expect(mdx).toContain('<F id="f_id0015">')
    for (const text of [
      '채권·증권 이자·할인액',
      '예금·적금·부금 이자',
      '통지예금 이자',
      '저축성보험 보험차익',
      'RP 매매차익',
      '직장공제회 초과반환금',
      '비영업대금 이익',
      '잉여금처분 결의일',
      '집합투자기구로부터의 이익',
    ]) {
      expect(mdx).toContain(text)
    }
  })

  it('records 2026 dividend-scope changes for IMA and foreign corporations', () => {
    expect(mdx).toContain('## 2026 배당소득 범위 보강')
    expect(mdx).toContain('<F id="f_id0016">')
    expect(mdx).toContain('<F id="f_id0017">')
    expect(mdx).toContain('종합투자계좌(IMA)')
    expect(mdx).toContain('배당소득에 포함')
    expect(mdx).toContain('외국법인')
    expect(mdx).toContain('장외파생상품')
    expect(mdx).toContain('국내원천 배당소득')
  })

  it('keeps the newly added fact statuses aligned with source certainty', () => {
    for (const factId of ['f_id0013', 'f_id0014', 'f_id0015', 'f_id0016', 'f_id0017', 'f_id0018']) {
      expect(mdx).toContain(`<F id="${factId}">`)
      expect(facts.find((fact) => fact.id === factId)).toBeDefined()
    }

    for (const factId of ['f_id0013', 'f_id0014', 'f_id0015', 'f_id0016', 'f_id0017']) {
      expect(facts.find((fact) => fact.id === factId)).toMatchObject({
        sourceType: 'LAW',
        verifyStatus: '확정',
        primarySourceVerified: true,
        sourceIds: ['src_law_go_kr'],
      })
    }

    expect(facts.find((fact) => fact.id === 'f_id0018')).toMatchObject({
      sourceType: 'LAW',
      verifyStatus: '확정',
      primarySourceVerified: true,
      lawRef: '조세특례제한법 제87조의7',
    })
    expect(facts.find((fact) => fact.id === 'f_id0018')?.previousValue).toContain('제87조의6')
  })
})
