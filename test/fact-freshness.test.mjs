import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

describe('fact-freshness CLI', () => {
  it('formats generated date in Asia/Seoul instead of UTC', () => {
    const out = execFileSync(
      process.execPath,
      ['scripts/fact-freshness.mjs', '--json', '--today', '2026-06-09T15:00:00.000Z'],
      { cwd: ROOT, encoding: 'utf8' }
    )
    const report = JSON.parse(out)

    expect(report.generated).toBe('2026-06-10')
  })

  it('sorts critical facts before high-risk facts', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fact-freshness-'))
    fs.mkdirSync(path.join(tmp, 'content'))
    fs.writeFileSync(
      path.join(tmp, 'content', 'facts.json'),
      JSON.stringify([
        {
          id: 'f_high01',
          title: 'high',
          chapter: 'ch1',
          verifyStatus: '강의기반',
          asOf: '2026-06-01',
          nextReviewBy: '2027-03-31',
          risk: 'high',
        },
        {
          id: 'f_crit01',
          title: 'critical',
          chapter: 'ch1',
          verifyStatus: '강의기반',
          asOf: '2026-06-01',
          nextReviewBy: '2027-03-31',
          risk: 'critical',
        },
      ])
    )

    const out = execFileSync(
      process.execPath,
      [path.join(ROOT, 'scripts', 'fact-freshness.mjs'), '--json', '--today', '2026-06-10T00:00:00.000Z'],
      { cwd: tmp, encoding: 'utf8' }
    )
    const report = JSON.parse(out)

    expect(report.flagged.map((fact) => fact.id)).toEqual(['f_crit01', 'f_high01'])
  })
})
