import type { StructuredScreenGuideSpec } from '@/lib/screen-guides'

export function StructuredScreenSpec({ spec }: { spec: StructuredScreenGuideSpec }) {
  return (
    <section aria-label="구조화 화면 명세" style={{ margin: 'var(--space-lg) 0' }}>
      <h2>{spec.title} 구조화 명세</h2>
      <table className="wt-tbl" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>필드</th>
            <th>라벨</th>
            <th>타입</th>
            <th>필수 조건</th>
            <th>원천</th>
            <th>차단</th>
          </tr>
        </thead>
        <tbody>
          {spec.fields.map((field) => (
            <tr key={field.key}>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{field.key}</td>
              <td>
                {field.label ?? field.key}
                {field.helpText && (
                  <div style={{ fontSize: '0.76rem', color: 'var(--gray-500)', marginTop: 2 }}>
                    {field.helpText}
                  </div>
                )}
              </td>
              <td>{field.type}</td>
              <td>{field.requiredWhen ?? (field.required ? 'required' : 'optional')}</td>
              <td>{field.source}</td>
              <td>{field.blocking ? 'blocking' : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 12 }}>
        <div>
          <h3 style={{ fontSize: '0.9rem' }}>ruleIds</h3>
          <ul style={{ margin: 0, paddingLeft: 18, fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
            {spec.ruleIds.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 style={{ fontSize: '0.9rem' }}>factIds</h3>
          <ul style={{ margin: 0, paddingLeft: 18, fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
            {spec.factIds.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
