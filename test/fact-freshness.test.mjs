import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

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
})
