export interface LawLink { text: string; url: string }

// best-effort: law.go.kr는 /법령/{법령명}/{조문} 패턴이 대체로 동작. 깨질 수 있으므로 text가 1급.
// 정규식: lazy .+? 로 법령명을 최소 매칭, 공백 후 '제N조(의N)?' 형태를 optional로 캡처.
// 검증된 케이스:
//   '소득세법 제127조'     → lawName='소득세법',     article='제127조'
//   '조세특례제한법 제104조의27' → lawName='조세특례제한법', article='제104조의27'
//   '소득세법'            → lawName='소득세법',     article=undefined
export function lawLink(ref: string): LawLink {
  if (!ref.trim()) return { text: '', url: '' }
  const m = ref.match(/^(.+?)\s*(제\d+조(?:의\d+)?)?$/)
  const lawName = (m?.[1] ?? ref).trim()
  const article = m?.[2]?.trim()
  const base = `https://www.law.go.kr/법령/${encodeURIComponent(lawName)}`
  const url = article ? `${base}/${encodeURIComponent(article)}` : base
  return { text: ref, url }
}
