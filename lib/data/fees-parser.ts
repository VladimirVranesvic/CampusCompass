import fs from 'fs'
import path from 'path'

export interface FacultyFee {
  faculty: string
  annualFee: number
  courseYears: number
  notes?: string
  facultyUrl?: string
}

const UNI_NAME_TO_SLUG: Record<string, string> = {
  'Australian Catholic University': 'australian-catholic-university',
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
 * Columns: faculty, annualFee, courseYears, notes (optional), facultyUrl (optional).
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
    const courseYearsRaw = values[2]?.trim()
    const notes = values[3]?.trim()
    const facultyUrlRaw = values[4]?.trim()
    if (!faculty || annualFeeRaw === undefined || courseYearsRaw === undefined) continue

    const annualFee = parseInt(annualFeeRaw, 10)
    if (Number.isNaN(annualFee)) continue

    const courseYears = parseInt(courseYearsRaw, 10)
    if (Number.isNaN(courseYears) || courseYears <= 0) continue

    const facultyUrl =
      facultyUrlRaw && facultyUrlRaw.startsWith("http")
        ? facultyUrlRaw
        : undefined

    fees.push({
      faculty,
      annualFee,
      courseYears,
      notes: notes || undefined,
      facultyUrl,
    })
  }
  return fees
}

/**
 * Get annual fee + course length for one university given optional preferred fields.
 * If preferredFields is provided and a matching faculty exists, returns that fee (or average of matches).
 * Otherwise returns the average of all faculties in the CSV, or null if no data.
 */
export function getFeeInfoForUni(
  uniName: string,
  preferredFields?: string[]
): { annualFee: number; courseYears: number } | null {
  const slug = getUniSlug(uniName)
  if (!slug) return null

  const rows = parseFeesCSV(slug)
  if (rows.length === 0) return null

  if (preferredFields && preferredFields.length > 0) {
    const matched = rows.filter((r) =>
      preferredFields.some((f) => f.trim().toLowerCase() === r.faculty.trim().toLowerCase())
    )
    if (matched.length > 0) {
      const annualFee = Math.round(matched.reduce((acc, r) => acc + r.annualFee, 0) / matched.length)
      const courseYears = Math.round(matched.reduce((acc, r) => acc + r.courseYears, 0) / matched.length)
      return { annualFee, courseYears }
    }
  }

  const annualFee = Math.round(rows.reduce((acc, r) => acc + r.annualFee, 0) / rows.length)
  const courseYears = Math.round(rows.reduce((acc, r) => acc + r.courseYears, 0) / rows.length)
  return { annualFee, courseYears }
}

/**
 * Get all matching faculty fee info for one university, preserving preferredFields order.
 * Returns an array of FacultyFee objects, one per matching faculty.
 * If preferredFields is provided, only returns matching faculties in the order they appear in preferredFields.
 * If no preferredFields or no matches, returns all faculties from the CSV (or empty array if no CSV).
 */
export function getAllMatchingFacultiesForUni(
  uniName: string,
  preferredFields?: string[]
): FacultyFee[] {
  const slug = getUniSlug(uniName)
  if (!slug) return []

  const allRows = parseFeesCSV(slug)
  if (allRows.length === 0) return []

  if (preferredFields && preferredFields.length > 0) {
    const matched: FacultyFee[] = []
    const seenFaculties = new Set<string>()

    // Preserve order: iterate through preferredFields and find matches
    for (const preferredField of preferredFields) {
      const normalizedPreferred = preferredField.trim().toLowerCase()
      for (const row of allRows) {
        const normalizedFaculty = row.faculty.trim().toLowerCase()
        if (
          normalizedFaculty === normalizedPreferred &&
          !seenFaculties.has(normalizedFaculty)
        ) {
          matched.push(row)
          seenFaculties.add(normalizedFaculty)
          break // Only add first match per preferredField
        }
      }
    }
    return matched
  }

  // No preferredFields: return all faculties
  return allRows
}

/**
 * Get all available faculties for a university (regardless of preferred fields).
 * Returns an array of faculty names that the university offers.
 */
export function getAllAvailableFacultiesForUni(uniName: string): string[] {
  const slug = getUniSlug(uniName)
  if (!slug) return []

  const allRows = parseFeesCSV(slug)
  return allRows.map((row) => row.faculty)
}

/** Backward-compatible: returns annual fee only, or null. */
export function getAnnualFeeForUni(
  uniName: string,
  preferredFields?: string[]
): number | null {
  const info = getFeeInfoForUni(uniName, preferredFields)
  return info ? info.annualFee : null
}
