import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { nextFactId, normalizeFactIdPrefix } from '../scripts/new-fact-id.mjs'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const scriptPath = path.join(root, 'scripts', 'new-fact-id.mjs')

describe('fact ID generator', () => {
  it('normalizes shorthand prefixes to repository fact-id prefixes', () => {
    expect(normalizeFactIdPrefix('ca')).toBe('f_ca')
    expect(normalizeFactIdPrefix('f_yas')).toBe('f_yas')
  })

  it('preserves the existing numeric width and returns the next unused id', () => {
    expect(nextFactId([{ id: 'f_ca0007' }, { id: 'f_ca0010' }, { id: 'f_yas001' }], 'ca')).toBe('f_ca0011')
    expect(nextFactId([{ id: 'f_yas001' }], 'f_yas')).toBe('f_yas002')
  })

  it('starts new prefixes at 0001', () => {
    expect(nextFactId([{ id: 'f_ca0007' }], 'new')).toBe('f_new0001')
  })

  it('prints json from the CLI for the current facts file', () => {
    const output = execFileSync(process.execPath, [scriptPath, 'yas', '--json'], {
      cwd: root,
      encoding: 'utf8',
    })
    const parsed = JSON.parse(output)

    expect(parsed).toMatchObject({
      prefix: 'f_yas',
      nextId: 'f_yas002',
    })
    expect(parsed.existingCount).toBeGreaterThanOrEqual(1)
  })
})
