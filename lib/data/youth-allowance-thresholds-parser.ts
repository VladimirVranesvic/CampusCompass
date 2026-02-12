/**
 * Server-side parser for Youth Allowance thresholds CSV
 * This file should only be imported in server-side code (API routes, server components)
 */

import fs from 'fs'
import path from 'path'
import { getDefaultThresholds } from './youth-allowance-thresholds'

/**
 * Parse thresholds CSV and return as an object
 * Falls back to default values if CSV is missing or invalid
 */
export function parseThresholdsCSV(): Record<string, number> {
  const csvPath = path.join(process.cwd(), 'public', 'data', 'youth-allowance-thresholds.csv')
  let fileContent: string
  try {
    fileContent = fs.readFileSync(csvPath, 'utf-8')
  } catch (err) {
    console.warn('Youth Allowance thresholds CSV not found at', csvPath, err)
    // Return default thresholds as fallback
    return getDefaultThresholds()
  }

  const lines = fileContent.split('\n').filter((line) => line.trim())
  if (lines.length < 2) {
    console.warn('Youth Allowance thresholds CSV is empty or invalid')
    return getDefaultThresholds()
  }

  const thresholds: Record<string, number> = {}

  // Skip header line (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    // Handle CSV with quoted fields that may contain commas
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
    values.push(current.trim()) // Add last value
    
    if (values.length >= 2) {
      const key = values[0]
      const value = parseFloat(values[1])
      if (key && !isNaN(value)) {
        thresholds[key] = value
      }
    }
  }

  return thresholds
}
