import factsRaw from '@/content/facts.json'
import { loadFacts } from '@/lib/facts/store'
import { factsToDocs } from '@/lib/search/facts-docs'
import { Search } from '@/components/Search'

const CHAPTERS = [
  { slug: 'ch1', title: 'Ch1 소득세 기본구조' },
  { slug: 'ch2', title: 'Ch2 법체계·세금분류' },
  { slug: 'ch3', title: 'Ch3 원천징수 핵심' },
  { slug: 'ch4', title: 'Ch4 가산세·신고실무' },
  { slug: 'ch5', title: 'Ch5 거주자·해외파견' },
  { slug: 'ch6', title: 'Ch6 근로소득 비과세 I' },
  { slug: 'ch7', title: 'Ch7 신고서 작성·검증' },
  { slug: 'ch8', title: 'Ch8 근로소득 비과세 II' },
  { slug: 'ch9', title: 'Ch9 간이세액·퇴직소득' },
  { slug: 'ch10', title: 'Ch10 사업·기타소득' },
  { slug: 'nonresident', title: '비거주자·외국법인 원천징수 (신규)' },
  { slug: 'interest-dividend', title: '이자·배당 원천징수 (신규)' },
]

export default function Home() {
  const docs = factsToDocs(loadFacts(factsRaw))
  return (
    <div>
      <section style={{ padding: 'var(--space-section) 0 var(--space-xl)' }}>
        <h1 style={{ fontSize: 48, margin: 0 }}>원천징수 실무 레퍼런스</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: 18 }}>출처·시행일이 명시된 사내 참고 자료. 2026 기준.</p>
        <p><a href="/updates-2026" style={{ color: 'var(--color-primary)' }}>→ 2026년 개정·시행 항목 보기</a></p>
      </section>
      <Search docs={docs} />
      <h2>목차</h2>
      <ul style={{ lineHeight: 2, listStyle: 'none', padding: 0 }}>
        {CHAPTERS.map((c) => (
          <li key={c.slug}><a href={`/ch/${c.slug}`} style={{ color: 'var(--color-ink)' }}>{c.title}</a></li>
        ))}
      </ul>
    </div>
  )
}
