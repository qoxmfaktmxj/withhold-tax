'use client'

import { useState, useMemo } from 'react'
import { buildIndex, searchIndex, type Doc } from '@/lib/search/build-index'
import { chapterTitle } from '@/lib/chapter-meta'

interface SearchProps {
  docs: Doc[]
  availableChapters: string[]
}

export function Search({ docs, availableChapters }: SearchProps) {
  const [query, setQuery] = useState('')
  const idx = useMemo(() => buildIndex(docs), [docs])
  const results = useMemo(() => (query.trim() ? searchIndex(idx, query.trim()) : []), [idx, query])
  const availableSet = useMemo(() => new Set(availableChapters), [availableChapters])

  return (
    <div className="wt-search" style={{ margin: 'var(--space-lg) 0', maxWidth: 520 }}>
      <label
        htmlFor="fact-search"
        style={{
          display: 'block',
          marginBottom: 6,
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.62rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--ink-faint)',
        }}
      >
        규정 검색
      </label>
      <div className="wt-sidebar-search" style={{ maxWidth: 520 }}>
        <input
          id="fact-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="조문·키워드 검색 — 예: 식대, 소액부징수…"
          aria-label="원천징수 규정 검색"
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '8px 12px', fontFamily: 'inherit', fontSize: '0.84rem', color: 'var(--ink)' }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="검색어 지우기"
          >
            ✕
          </button>
        )}
      </div>
      {results.length > 0 && (
        <ul
          id="search-results-list"
          className="wt-search-results"
          aria-label="검색 결과"
          style={{ maxWidth: 520 }}
        >
          {results.map((r) => (
            <li key={r.id} className="wt-search-item">
              {availableSet.has(r.chapter) ? (
                <a href={`/ch/${r.chapter}`}>
                  <span
                    className="wt-mono"
                    style={{ fontSize: '0.65rem', color: 'var(--oxblood)', marginRight: 8, letterSpacing: '0.08em' }}
                  >
                    {chapterTitle(r.chapter)}
                  </span>
                  <strong style={{ color: 'var(--ink)', fontWeight: 500 }}>{r.title}</strong>
                </a>
              ) : (
                <span style={{ color: 'var(--ink-faint)' }}>
                  <span
                    className="wt-mono"
                    style={{ fontSize: '0.65rem', marginRight: 8, letterSpacing: '0.08em' }}
                  >
                    {chapterTitle(r.chapter)}
                  </span>
                  {r.title}
                  <span
                    className="wt-mono"
                    style={{ color: 'var(--label-muted)', fontSize: '0.65rem', marginLeft: 6 }}
                  >
                    (작성 예정)
                  </span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
