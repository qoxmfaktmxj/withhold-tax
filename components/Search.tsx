'use client'

import { useState, useMemo } from 'react'
import { buildIndex, searchIndex, type Doc } from '@/lib/search/build-index'

export function Search({ docs }: { docs: Doc[] }) {
  const [query, setQuery] = useState('')
  const idx = useMemo(() => buildIndex(docs), [docs])
  const results = useMemo(() => (query.trim() ? searchIndex(idx, query.trim()) : []), [idx, query])

  return (
    <div className="wt-search" style={{ margin: 'var(--space-xl) 0' }}>
      <label htmlFor="fact-search" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
        규정 검색
      </label>
      <input
        id="fact-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="예: 식대, 소액부징수, 비과세…"
        style={{
          width: '100%',
          maxWidth: 480,
          padding: '8px 12px',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-canvas)',
          color: 'var(--color-ink)',
          fontSize: 14,
        }}
      />
      {results.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            marginTop: 8,
            maxWidth: 480,
            border: '1px solid var(--color-hairline)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-canvas)',
          }}
        >
          {results.map((r) => (
            <li key={r.id} style={{ borderTop: '1px solid var(--color-hairline)' }}>
              <a
                href={`/ch/${r.chapter}`}
                style={{
                  display: 'block',
                  padding: '8px 12px',
                  color: 'var(--color-ink)',
                  textDecoration: 'none',
                  fontSize: 14,
                }}
              >
                <span style={{ color: 'var(--color-muted)', fontSize: 12, marginRight: 8 }}>{r.chapter}</span>
                {r.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
