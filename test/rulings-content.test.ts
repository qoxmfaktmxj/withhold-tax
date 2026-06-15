import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import factsRaw from '@/content/facts.json'
import { CHAPTERS } from '@/lib/chapter-meta'
import { loadFacts } from '@/lib/facts/store'

describe('rulings chapter', () => {
  const facts = loadFacts(factsRaw)

  it('is registered in chapter metadata', () => {
    expect(CHAPTERS.find((chapter) => chapter.slug === 'rulings')).toMatchObject({
      title: '소득구분 유권해석 사례',
      cat: 'income',
    })
  })

  it('contains four income-classification case notes', () => {
    const mdx = readFileSync(join(process.cwd(), 'content/chapters/rulings.mdx'), 'utf8')

    for (const factId of ['f_rl0001', 'f_rl0002', 'f_rl0003', 'f_rl0004']) {
      expect(mdx).toContain(`<F id="${factId}">`)
    }
    expect(mdx).toContain('<CaseNote title="강사료 — 계속·반복성">')
    expect(mdx).toContain('<CaseNote title="특허권 사용료 — 계속 대여">')
    expect(mdx).toContain('<CaseNote title="사외이사 — 직무 수행 vs 독립 용역">')
    expect(mdx).toContain('<CaseNote title="사업설비 없는 수수료 — 문서번호 재확인">')
  })

  it('keeps official interpretation facts separate from the unverified lecture case', () => {
    for (const factId of ['f_rl0001', 'f_rl0002', 'f_rl0003']) {
      expect(facts.find((fact) => fact.id === factId)).toMatchObject({
        sourceType: 'INTERPRETATION',
        verifyStatus: '확정',
        primarySourceVerified: true,
        sourceIds: ['src_taxlaw_nts'],
      })
    }

    expect(facts.find((fact) => fact.id === 'f_rl0004')).toMatchObject({
      sourceType: 'LECTURE',
      verifyStatus: '강의기반',
      primarySourceVerified: false,
      sourceIds: ['src_cfo_academy_lecture'],
    })
    expect(facts.find((fact) => fact.id === 'f_rl0004')?.scopeLimitations).toContain('서면1팀-464')
  })

  it('adds the six university research-service patterns from the extracted lecture source', () => {
    const mdx = readFileSync(join(process.cwd(), 'content/chapters/rulings.mdx'), 'utf8')

    expect(mdx).toContain('## 산학협력 연구용역 6패턴')
    expect(mdx).toContain('<F id="f_rl0005">')
    for (const text of [
      '교수 등이 연구용역 제공',
      '고용관계 없는 연구보조원 등',
      '고용관계 있는 연구원',
      '대학이 체결·수령 후 지급',
      '교수가 직접 계약·수령',
      '인건비·연구보조비 지출',
    ]) {
      expect(mdx).toContain(text)
    }

    expect(facts.find((fact) => fact.id === 'f_rl0005')).toMatchObject({
      sourceType: 'LECTURE',
      verifyStatus: '강의기반',
      primarySourceVerified: false,
      sourceIds: ['src_cfo_academy_lecture'],
    })
  })

  it('links the six 2026 interpretation watch cases and only promotes verified documents', () => {
    const mdx = readFileSync(join(process.cwd(), 'content/chapters/rulings.mdx'), 'utf8')

    expect(mdx).toContain('## 2026.1~3 최신 유권해석')
    for (const factId of ['f_rl0006', 'f_rl0007', 'f_rl0008', 'f_rl0009', 'f_rl0010', 'f_rl0011']) {
      expect(mdx).toContain(`<F id="${factId}">`)
    }

    for (const factId of ['f_rl0006', 'f_rl0007', 'f_rl0008', 'f_rl0009', 'f_rl0010']) {
      expect(facts.find((fact) => fact.id === factId)).toMatchObject({
        sourceType: 'INTERPRETATION',
        verifyStatus: '확정',
        primarySourceVerified: true,
        sourceIds: ['src_taxlaw_nts'],
      })
    }

    expect(facts.find((fact) => fact.id === 'f_rl0010')?.lawUrl).toContain('200000000000018676')
    expect(facts.find((fact) => fact.id === 'f_rl0011')).toMatchObject({
      sourceType: 'LECTURE',
      verifyStatus: '강의기반',
      primarySourceVerified: false,
      sourceIds: ['src_cfo_academy_lecture'],
    })
    expect(facts.find((fact) => fact.id === 'f_rl0011')?.scopeLimitations).toContain('사전-2025-법규소득-1221')
  })
})
