export interface Subject {
  id: number
  name: string
  units: number
}

export interface ScalingStat {
  id: number
  subject_id: number
  year: number
  percentile: number
  scaled_mark: number
}

export interface AtarConversionRow {
  year: number
  aggregate: number
  atar: number
}

export interface SubjectInput {
  subjectId: number
  subjectName: string
  units: number
  /** Mark or percentile (0–100) used to look up scaled mark */
  mark: number
}

/**
 * Get scaled mark for a subject from percentile by interpolating scaling_stats.
 */
export function getScaledMarkFromPercentile(
  subjectId: number,
  percentile: number,
  scalingStats: ScalingStat[]
): number {
  const rows = scalingStats
    .filter((s) => s.subject_id === subjectId)
    .sort((a, b) => a.percentile - b.percentile)
  if (rows.length === 0) return 0
  if (percentile <= rows[0].percentile) return rows[0].scaled_mark
  if (percentile >= rows[rows.length - 1].percentile) return rows[rows.length - 1].scaled_mark
  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i]
    const b = rows[i + 1]
    if (percentile >= a.percentile && percentile <= b.percentile) {
      const t = (percentile - a.percentile) / (b.percentile - a.percentile)
      return a.scaled_mark + t * (b.scaled_mark - a.scaled_mark)
    }
  }
  return rows[rows.length - 1].scaled_mark
}

/**
 * Compute best 10 units of scaled marks and return aggregate.
 */
export function getAggregateFromScaledMarks(
  subjectInputs: SubjectInput[],
  scalingStats: ScalingStat[]
): { aggregate: number; bySubject: { subjectName: string; units: number; scaledMark: number }[] } {
  const withScaled = subjectInputs.map((s) => ({
    ...s,
    scaledMark: getScaledMarkFromPercentile(s.subjectId, s.mark, scalingStats),
  }))
  const bySubject = withScaled.map((s) => ({
    subjectName: s.subjectName,
    units: s.units,
    scaledMark: s.scaledMark,
  }))
  const sorted = [...withScaled].sort((a, b) => b.scaledMark - a.scaledMark)
  let unitsLeft = 10
  let aggregate = 0
  for (const s of sorted) {
    if (unitsLeft <= 0) break
    const take = Math.min(s.units, unitsLeft)
    aggregate += s.scaledMark * take
    unitsLeft -= take
  }
  return { aggregate, bySubject }
}

/**
 * Convert aggregate to ATAR by interpolating atar_conversion table.
 */
export function getAtarFromAggregate(
  aggregate: number,
  atarConversion: AtarConversionRow[]
): number {
  if (atarConversion.length === 0) return 0
  const sorted = [...atarConversion].sort((a, b) => a.aggregate - b.aggregate)
  if (aggregate <= sorted[0].aggregate) return sorted[0].atar
  if (aggregate >= sorted[sorted.length - 1].aggregate) return sorted[sorted.length - 1].atar
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i]
    const b = sorted[i + 1]
    if (aggregate >= a.aggregate && aggregate <= b.aggregate) {
      const t = (aggregate - a.aggregate) / (b.aggregate - a.aggregate)
      return Math.round((a.atar + t * (b.atar - a.atar)) * 10) / 10
    }
  }
  return sorted[sorted.length - 1].atar
}

/**
 * Full calculation: subject inputs + scaling + conversion -> aggregate and ATAR.
 */
export function calculateAtar(
  subjectInputs: SubjectInput[],
  scalingStats: ScalingStat[],
  atarConversion: AtarConversionRow[]
): {
  aggregate: number
  atar: number
  bySubject: { subjectName: string; units: number; scaledMark: number }[]
} {
  const { aggregate, bySubject } = getAggregateFromScaledMarks(subjectInputs, scalingStats)
  const atar = getAtarFromAggregate(aggregate, atarConversion)
  return { aggregate, atar, bySubject }
}
