'use client'

import { useMemo, useState } from 'react'
import nonTaxableRulesRaw from '@/content/tax-rules/2026/non-taxable-income.json'
import { applyMonthlyCapRule, loadRules } from '@/lib/rules/engine'

const RULES = loadRules(nonTaxableRulesRaw).filter((rule) => rule.formula.type === 'monthly-cap')
const KRW = (n: number) => n.toLocaleString('ko-KR') + '원'

const field: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '9px 12px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--white)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9rem',
  color: 'var(--text-primary)',
}
const label: React.CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: 'var(--gray-600)',
  marginBottom: 6,
}

export function NonTaxableCapCalculator() {
  const [ruleId, setRuleId] = useState('meal_allowance_cap')
  const [monthlyAmount, setMonthlyAmount] = useState('250000')
  const [months, setMonths] = useState('1')
  const [childrenUnder6, setChildrenUnder6] = useState('1')
  const [isSpecialSite, setIsSpecialSite] = useState(false)

  const rule = RULES.find((item) => item.ruleId === ruleId) ?? RULES[0]
  const result = useMemo(
    () =>
      applyMonthlyCapRule(rule, {
        monthlyAmount: Number(monthlyAmount.replace(/[^0-9]/g, '')) || 0,
        months: Number(months.replace(/[^0-9]/g, '')) || 1,
        childrenUnder6: Number(childrenUnder6.replace(/[^0-9]/g, '')) || 0,
        isSpecialSite,
      }),
    [childrenUnder6, isSpecialSite, monthlyAmount, months, rule]
  )
  const needsChildren = rule.ruleId === 'childcare_allowance_cap_per_child'
  const needsSpecialSite = rule.ruleId === 'overseas_work_exemption'

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, maxWidth: 760 }}>
        <div>
          <label htmlFor="nt-rule" style={label}>급여 항목</label>
          <select id="nt-rule" style={field} value={ruleId} onChange={(e) => setRuleId(e.target.value)}>
            {RULES.map((item) => (
              <option key={item.ruleId} value={item.ruleId}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="nt-amount" style={label}>월 지급액</label>
          <input
            id="nt-amount"
            style={field}
            inputMode="numeric"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="nt-months" style={label}>적용 개월 수</label>
          <input
            id="nt-months"
            style={field}
            inputMode="numeric"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
          />
        </div>
        {needsChildren && (
          <div>
            <label htmlFor="nt-children" style={label}>6세 이하 자녀 수</label>
            <input
              id="nt-children"
              style={field}
              inputMode="numeric"
              value={childrenUnder6}
              onChange={(e) => setChildrenUnder6(e.target.value)}
            />
          </div>
        )}
        {needsSpecialSite && (
          <label
            htmlFor="nt-special-site"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 24,
              color: 'var(--gray-700)',
              fontSize: '0.86rem',
              fontWeight: 600,
            }}
          >
            <input
              id="nt-special-site"
              type="checkbox"
              checked={isSpecialSite}
              onChange={(e) => setIsSpecialSite(e.target.checked)}
            />
            원양어업 선박·국외 건설현장 등 특례
          </label>
        )}
      </div>

      <section
        aria-label="검산 결과"
        style={{
          marginTop: 18,
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-xs)',
          padding: '18px 20px',
          maxWidth: 760,
        }}
      >
        <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>적용 rule</td>
              <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                {rule.ruleId}@{rule.version}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>기간 한도</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.periodCap)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>총 지급액</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.grossAmount)}</td>
            </tr>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 0 0', fontWeight: 700 }}>비과세 금액</td>
              <td style={{ textAlign: 'right', padding: '8px 0 0', fontWeight: 800, color: 'var(--blue-700)' }}>
                {KRW(result.nonTaxableAmount)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '2px 0', color: 'var(--gray-600)' }}>과세 전환 금액</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.taxableAmount)}</td>
            </tr>
          </tbody>
        </table>
        {rule.warnings.length > 0 && (
          <ul style={{ margin: '12px 0 0', paddingLeft: 18, color: 'var(--gray-600)', fontSize: '0.78rem', lineHeight: 1.6 }}>
            {rule.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
