import { describe, expect, it } from 'vitest'
import { execSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

describe('QA gate scripts', () => {
  it('defines a fail-fast qa command that includes typecheck, freshness, and strict link checks', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))

    expect(packageJson.scripts.typecheck).toBe('tsc --noEmit')
    expect(packageJson.scripts.qa).toBe(
      'npm run lint && npm run typecheck && npm test && npm run check:freshness && npm run check:links -- --strict'
    )
  })

  it('qa-new-routes exits non-zero with structured failure JSON when the target app is unavailable', () => {
    const result = spawnSync(
      process.execPath,
      ['scripts/qa-new-routes.mjs', 'http://127.0.0.1:9'],
      { cwd: ROOT, encoding: 'utf8', timeout: 30_000 }
    )

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('"failed"')
    expect(result.stderr).toContain('"errors"')
  })

  it('typecheck command is executable', () => {
    expect(() =>
      execSync('npm run typecheck', { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' })
    ).not.toThrow()
  }, 30_000)
})
