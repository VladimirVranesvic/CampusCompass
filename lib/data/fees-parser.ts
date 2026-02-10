import fs from 'fs'
import path from 'path'

export interface FacultyFee {
  faculty: string
  annualFee: number
  notes?: string
}

const UNI_NAME_TO_SLUG: Record<string, string> = {
  'University of Sydney': 'university-of-sydney',
  'UNSW Sydney': 'unsw-sydney',
  'University of Technology Sydney': 'university-of-technology-sydney',
  'Macquarie University': 'macquarie-university',
  'Western Sydney University': 'western-sydney-university',
  'University of Wollongong': 'university-of-wollongong',
  'University of Newcastle': 'university-of-newcastle',
  'Charles Sturt University': 'charles-sturt-university',
  'Southern Cross University': 'southern-cross-university',
  'University of New England': 'university-of-new-england',
}

export function getUniSlug(uniName: string): string | null {
  return UNI_NAME_TO_SLUG[uniName] ?? null
}

/**
 * Parse a single university's fees CSV from public/data/fees/<slug>.csv.
 * Columns: faculty, annualFee, notes (optional).
 * Returns empty array if file is missing or invalid.
 */
export function parseFeesCSV(uniSlug: string): FacultyFee[] {
  const csvPath = path.join(process.cwd(), 'public', 'data', 'fees', `${uniSlug}.csv`)
  let fileContent: string
  try {
    fileContent = fs.readFileSync(csvPath, 'utf-8')
  } catch {
    return []
  }

  const lines = fileContent.split('\n').filter((line) => line.trim())
  if (lines.length < 2) return []

  const fees: FacultyFee[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
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

    const faculty = values[0]?.trim()
    const annualFeeRaw = values[1]?.trim()
    const notes = values[2]?.trim()
    if (!faculty || annualFeeRaw === undefined) continue

    const annualFee = parseInt(annualFeeRaw, 10)
    if (Number.isNaN(annualFee)) continue

    fees.push({ faculty, annualFee, notes: notes || undefined })
  }
  return fees
}

/**
 * Get the annual fee for one university given optional preferred fields.
 * If preferredFields is provided and a matching faculty exists, returns that fee (or average of matches).
 * Otherwise returns the average of all faculties in the CSV, or null if no data.
 */
export function getAnnualFeeForUni(
  uniName: string,
  preferredFields?: string[]
): number | null {
  const slug = getUniSlug(uniName)
  if (!slug) return null

  const rows = parseFeesCSV(slug)
  if (rows.length === 0) return null

  if (preferredFields && preferredFields.length > 0) {
    const matched = rows.filter((r) =>
      preferredFields.some((f) => f.trim().toLowerCase() === r.faculty.trim().toLowerCase())
    )
    if (matched.length > 0) {
      const sum = matched.reduce((acc, r) => acc + r.annualFee, 0)
      return Math.round(sum / matched.length)
    }
  }

  const sum = rows.reduce((acc, r) => acc + r.annualFee, 0)
  return Math.round(sum / rows.length)
}
