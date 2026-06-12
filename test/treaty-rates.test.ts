import { describe, expect, it } from 'vitest'
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
})
