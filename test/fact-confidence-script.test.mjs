import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

function writeFixture(facts) {
  const file = path.join(os.tmpdir(), `fact-confidence-${Date.now()}-${Math.random()}.json`)
  fs.writeFileSync(file, JSON.stringify(facts), 'utf8')
  return file
}

describe('check-fact-confidence CLI', () => {
  it('reports high-risk confirmed facts without primary source verification', () => {
    const facts = [
      {
        id: 'f_000001',
        title: '위험 fact',
        verifyStatus: '확정',
        primarySourceVerified: false,
        risk: 'high',
        implementationImpact: { calculation: false, reporting: false },
      },
      {
        id: 'f_000002',
        title: '원문 확인 fact',
        verifyStatus: '확정',
        primarySourceVerified: true,
        risk: 'high',
        sourceIds: ['src_law_go_kr'],
        lawRef: '소득세법 제127조',
        lawUrl: 'https://www.law.go.kr/법령/소득세법/제127조',
        implementationImpact: { calculation: true, reporting: false },
      },
    ]
    const fixture = writeFixture(facts)
    const out = execFileSync(
      process.execPath,
      ['scripts/check-fact-confidence.mjs', '--json', '--facts', fixture],
      { cwd: ROOT, encoding: 'utf8' }
    )
    const report = JSON.parse(out)

    expect(report.flagged).toHaveLength(1)
    expect(report.flagged[0].id).toBe('f_000001')
    expect(report.flagged[0].reasons).toContain('고위험 확정 fact는 primarySourceVerified=true 여야 함')
  })

  it('requires sourceIds, lawRef, and lawUrl for high-risk or calculation/reporting facts', () => {
    const facts = [
      {
        id: 'f_000004',
        title: '고위험 출처 누락',
        verifyStatus: '확인필요',
        primarySourceVerified: true,
        risk: 'critical',
        sourceIds: [],
        lawRef: '',
        lawUrl: '',
        implementationImpact: { calculation: false, reporting: false },
      },
      {
        id: 'f_000005',
        title: '계산 영향 출처 누락',
        verifyStatus: '확정',
        primarySourceVerified: true,
        risk: 'medium',
        sourceIds: ['src_law_go_kr'],
        lawRef: '',
        lawUrl: 'https://www.law.go.kr/법령/소득세법',
        implementationImpact: { calculation: true, reporting: false },
      },
      {
        id: 'f_000006',
        title: '신고 영향 출처 완료',
        verifyStatus: '확정',
        primarySourceVerified: true,
        risk: 'medium',
        sourceIds: ['src_law_go_kr'],
        lawRef: '소득세법 제164조의3',
        lawUrl: 'https://www.law.go.kr/법령/소득세법/제164조의3',
        implementationImpact: { calculation: false, reporting: true },
      },
    ]
    const fixture = writeFixture(facts)
    const out = execFileSync(
      process.execPath,
      ['scripts/check-fact-confidence.mjs', '--json', '--facts', fixture],
      { cwd: ROOT, encoding: 'utf8' }
    )
    const report = JSON.parse(out)

    expect(report.flagged.map((item) => item.id)).toEqual(['f_000004', 'f_000005'])
    expect(report.flagged[0].reasons).toEqual([
      '고위험 또는 계산/신고 영향 fact는 sourceIds 1개 이상이 필요함',
      '고위험 또는 계산/신고 영향 fact는 lawRef가 필요함',
      '고위험 또는 계산/신고 영향 fact는 lawUrl이 필요함',
    ])
    expect(report.flagged[1].reasons).toEqual([
      '고위험 또는 계산/신고 영향 fact는 lawRef가 필요함',
    ])
  })

  it('exits non-zero in strict mode when confidence rules are violated', () => {
    const fixture = writeFixture([
      {
        id: 'f_000003',
        title: '신고 영향 fact',
        verifyStatus: '확정',
        primarySourceVerified: false,
        risk: 'medium',
        implementationImpact: { calculation: false, reporting: true },
      },
    ])

    expect(() =>
      execFileSync(
        process.execPath,
        ['scripts/check-fact-confidence.mjs', '--strict', '--facts', fixture],
        { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' }
      )
    ).toThrow()
  })
})
