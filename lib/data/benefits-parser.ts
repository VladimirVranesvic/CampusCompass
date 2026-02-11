import fs from 'fs'
import path from 'path'

export interface BenefitDefinition {
  id: string
  name: string
  description?: string
  estimatedAmount: string
  nextSteps: string[]
  learnMoreUrl: string
  category?: string
  ageMin?: number
  ageMax?: number
  incomeBands?: string[]
  livingSituation?: string[]
  requiresIndigenous?: boolean
  requiresMovingForStudy?: boolean
  alwaysEligible: boolean
}

function isNA(val: string | undefined): boolean {
  if (val === undefined) return true
  const trimmed = val.trim()
  return trimmed === '' || trimmed.toUpperCase() === 'N/A'
}

function parseValuesFromLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  for (let j = 0; j < line.length; j++) {
    const char = line[j]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  values.push(current.trim())
  return values
}

/**
 * Parse benefits CSV from public/data/benefits-nsw.csv.
 * Returns empty array if file is missing or invalid.
 */
export function parseBenefitsCSV(): BenefitDefinition[] {
  const csvPath = path.join(process.cwd(), 'public', 'data', 'benefits-nsw.csv')
  let fileContent: string
  try {
    fileContent = fs.readFileSync(csvPath, 'utf-8')
  } catch (err) {
    console.warn('Benefits CSV not found at', csvPath, err)
    return []
  }

  const lines = fileContent.split('\n').filter((line) => line.trim())
  if (lines.length < 2) return []

  const definitions: BenefitDefinition[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseValuesFromLine(lines[i])
    if (values.length < 8) continue

    const [
      id,
      name,
      description,
      estimatedAmount,
      nextStepsRaw,
      learnMoreUrl,
      category,
      ageMinRaw,
      ageMaxRaw,
      incomeBandsRaw,
      livingSituationRaw,
      requiresIndigenousRaw,
      requiresMovingForStudyRaw,
      alwaysEligibleRaw,
    ] = values

    const nextSteps = (nextStepsRaw ?? '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)

    const ageMin = isNA(ageMinRaw) ? undefined : parseInt(ageMinRaw ?? '', 10)
    const ageMax = isNA(ageMaxRaw) ? undefined : parseInt(ageMaxRaw ?? '', 10)

    const incomeBands = isNA(incomeBandsRaw)
      ? undefined
      : (incomeBandsRaw ?? '')
          .split(';')
          .map((s) => s.trim())
          .filter(Boolean)

    const livingSituation = isNA(livingSituationRaw)
      ? undefined
      : (livingSituationRaw ?? '')
          .split(';')
          .map((s) => s.trim())
          .filter(Boolean)

    const requiresIndigenous = isNA(requiresIndigenousRaw)
      ? undefined
      : (requiresIndigenousRaw ?? '').toLowerCase() === 'true'

    const requiresMovingForStudy = isNA(requiresMovingForStudyRaw)
      ? undefined
      : (requiresMovingForStudyRaw ?? '').toLowerCase() === 'true'

    const alwaysEligible = isNA(alwaysEligibleRaw)
      ? false
      : (alwaysEligibleRaw ?? '').toLowerCase() === 'true'

    definitions.push({
      id: (id ?? '').trim(),
      name: (name ?? '').trim(),
      description: (description ?? '').trim() || undefined,
      estimatedAmount: (estimatedAmount ?? '').trim(),
      nextSteps,
      learnMoreUrl: (learnMoreUrl ?? '').trim(),
      category: (category ?? '').trim() || undefined,
      ageMin: Number.isNaN(ageMin) ? undefined : ageMin,
      ageMax: Number.isNaN(ageMax) ? undefined : ageMax,
      incomeBands: incomeBands?.length ? incomeBands : undefined,
      livingSituation: livingSituation?.length ? livingSituation : undefined,
      requiresIndigenous,
      requiresMovingForStudy,
      alwaysEligible,
    })
  }

  return definitions
}
