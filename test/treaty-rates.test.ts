import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import treatyRates from '@/content/tax-rules/2026/treaty-rates.json'

type TreatyRateEntry = {
  country: string
  countryCode: string
  region: 'asia' | 'americas' | 'oceania' | 'europe-middle-east'
  interest: number[]
  dividend: {
    major25: number[]
    other: number[]
  }
  royalty: number[]
  note?: string
}

describe('2026 treaty rates data', () => {
  const entries = (treatyRates as { rates: TreatyRateEntry[] }).rates
  const formatRates = (rates: number[]) =>
    `${rates.map((rate) => Math.round(rate * 100)).join('/')}%`

  it('contains the planned 34 country sample', () => {
    expect(entries).toHaveLength(34)
    expect(entries.map((entry) => entry.country)).toEqual(
      expect.arrayContaining(['일본', '미국', '독일', 'UAE'])
    )
  })

  it('has valid country codes and rate ranges', () => {
    for (const entry of entries) {
      expect(entry.country).toBeTruthy()
      expect(entry.countryCode).toMatch(/^[A-Z]{2}$/)
      for (const rate of [...entry.interest, ...entry.dividend.major25, ...entry.dividend.other, ...entry.royalty]) {
        expect(rate).toBeGreaterThanOrEqual(0)
        expect(rate).toBeLessThanOrEqual(1)
      }
    }
  })

  it('keeps representative source values from the lecture appendix', () => {
    const japan = entries.find((entry) => entry.country === '일본')
    expect(japan?.interest).toEqual([0.1])
    expect(japan?.dividend.major25).toEqual([0.05])
    expect(japan?.dividend.other).toEqual([0.15])
    expect(japan?.royalty).toEqual([0.1])
    expect(japan?.note).toContain('Rolling')

    const uae = entries.find((entry) => entry.country === 'UAE')
    expect(uae?.royalty).toEqual([0])
  })

  it('classifies Australia and New Zealand as Oceania, not Americas', () => {
    const australia = entries.find((entry) => entry.countryCode === 'AU')
    const newZealand = entries.find((entry) => entry.countryCode === 'NZ')

    expect(australia?.region).toBe('oceania')
    expect(newZealand?.region).toBe('oceania')
  })

  it('keeps nonresident.mdx treaty table in sync with the JSON rates', () => {
    const mdx = readFileSync(join(process.cwd(), 'content/chapters/nonresident.mdx'), 'utf8')
    const sectionStart = mdx.indexOf('## 11. 주요 34개국 제한세율 표')
    expect(sectionStart).toBeGreaterThanOrEqual(0)

    const section = mdx.slice(sectionStart)
    const rows = [...section.matchAll(
      /<tr><td>([^<]+)<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td><\/tr>/g,
    )].map((match) => ({
      country: match[1],
      interest: match[2],
      major25: match[3],
      other: match[4],
      royalty: match[5],
      note: match[6],
    }))

    expect(rows).toHaveLength(entries.length)
    expect(rows.map((row) => row.country)).toEqual(entries.map((entry) => entry.country))

    for (const entry of entries) {
      const row = rows.find((candidate) => candidate.country === entry.country)
      expect(row).toEqual({
        country: entry.country,
        interest: formatRates(entry.interest),
        major25: formatRates(entry.dividend.major25),
        other: formatRates(entry.dividend.other),
        royalty: formatRates(entry.royalty),
        note: entry.note ?? '',
      })
    }
  })
})
