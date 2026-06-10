import { Tbl } from '@/components/blocks/Tbl'

export interface ScreenField {
  key: string
  label: string
  type: string
  required: boolean
  source: 'manual' | 'employee' | 'payroll' | 'rule'
  validation?: string
  helpText?: string
}

const SOURCE_LABEL: Record<ScreenField['source'], string> = {
  manual: '수동 입력',
  employee: '직원 마스터',
  payroll: '급여 시스템',
  rule: '규칙/계산',
}

export function ScreenSpec({ fields }: { fields: ScreenField[] }) {
  return (
    <Tbl scroll>
      <thead>
        <tr>
          <th style={{ fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>필드 키</th>
          <th>라벨</th>
          <th>타입</th>
          <th>필수</th>
          <th>입력 원천</th>
          <th>검증 규칙</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((f) => (
          <tr key={f.key}>
            <td>
              <code style={{ fontSize: '0.82rem', color: 'var(--gray-700)' }}>{f.key}</code>
            </td>
            <td>
              {f.label}
              {f.helpText && (
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 2 }}>
                  {f.helpText}
                </div>
              )}
            </td>
            <td style={{ whiteSpace: 'nowrap', color: 'var(--gray-600)', fontSize: '0.88rem' }}>
              {f.type}
            </td>
            <td style={{ textAlign: 'center', fontSize: '1rem' }}>
              {f.required ? '●' : '○'}
            </td>
            <td style={{ whiteSpace: 'nowrap', fontSize: '0.88rem', color: 'var(--gray-600)' }}>
              {SOURCE_LABEL[f.source]}
            </td>
            <td style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
              {f.validation ?? '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </Tbl>
  )
}
