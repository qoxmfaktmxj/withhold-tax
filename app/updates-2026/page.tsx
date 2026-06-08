import factsRaw from '@/content/facts.json'
import { loadFacts } from '@/lib/facts/store'
import { UpdatesDashboard } from '@/components/UpdatesDashboard'

export default function Page() {
  const facts = loadFacts(factsRaw)
  return (
    <>
      <h1>2026년 원천징수 개정·시행</h1>
      <UpdatesDashboard facts={facts} />
    </>
  )
}
