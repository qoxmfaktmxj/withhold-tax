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
    <div
      className="wt-search"
      style={{ margin: 'var(--space-lg) 0', maxWidth: 520 }}
    >
      <label
        htmlFor="fact-search"
        style={{
          display: 'block',
          marginBottom: 6,
          fontFamily: 'var(--font-display)',
          fontSize: '0.68rem',
          fontWeight: 700,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: 'var(--gray-500)',
        }}
      >
        규정 검색
      </label>

      {/* Search box */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-xs)',
          overflow: 'hidden',
          maxWidth: 520,
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocusCapture={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = 'var(--blue-500)'
          el.style.boxShadow = '0 0 0 3px rgb(37 99 235 / .12)'
        }}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = 'var(--border)'
            el.style.boxShadow = 'var(--shadow-xs)'
          }
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ marginLeft: 12, color: 'var(--gray-400)', flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          id="fact-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="조문·키워드 검색 — 예: 식대, 소액부징수…"
          aria-label="원천징수 규정 검색"
          aria-controls={results.length > 0 ? 'search-results-list' : undefined}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            padding: '9px 10px',
            fontFamily: 'var(--font-body)',
            fontSize: '0.84rem',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="검색어 지우기"
            style={{
              border: 'none',
              background: 'transparent',
              padding: '0 12px',
              color: 'var(--gray-400)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              lineHeight: 1,
            }}
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
                <a href={`/ch/${r.chapter}${r.sectionId ? `#${r.sectionId}` : ''}`}>
                  <span
                    className="wt-mono"
                    style={{
                      fontSize: '0.65rem',
                      color: 'var(--blue-600)',
                      fontWeight: 600,
                      marginRight: 8,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {chapterTitle(r.chapter)}
                  </span>
                  <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {r.heading}
                  </strong>
                </a>
              ) : (
                <span style={{ color: 'var(--gray-400)' }}>
                  <span
                    className="wt-mono"
                    style={{ fontSize: '0.65rem', marginRight: 8, letterSpacing: '0.06em' }}
                  >
                    {chapterTitle(r.chapter)}
                  </span>
                  {r.heading}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
