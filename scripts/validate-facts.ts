import { FactsFileSchema } from '../lib/facts/schema'
import facts from '../content/facts.json'

const r = FactsFileSchema.safeParse(facts)
if (r.success) {
  console.log('OK: ' + r.data.length + ' facts validated')
} else {
  console.error('ERRORS:')
  r.error.issues.slice(0, 30).forEach(e =>
    console.error(e.path.join('.'), '-', e.message)
  )
  process.exit(1)
}
