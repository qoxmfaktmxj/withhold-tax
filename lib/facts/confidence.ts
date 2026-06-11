type ConfidenceFact = {
  id?: string
  primarySourceVerified?: boolean
  verifyStatus?: string
}

export function getReferenceConfidenceSummary(facts: ConfidenceFact[]) {
  const total = facts.length
  const primarySourceVerified = facts.filter((fact) => fact.primarySourceVerified === true).length
  const needsReview = facts.filter((fact) => fact.verifyStatus === '확인필요').length
  const lectureBased = facts.filter((fact) => fact.verifyStatus === '강의기반').length

  return {
    total,
    primarySourceVerified,
    primarySourceUnverified: total - primarySourceVerified,
    needsReview,
    lectureBased,
  }
}
