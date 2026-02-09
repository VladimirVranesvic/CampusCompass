import fs from 'fs'
import path from 'path'

interface UACRound {
  round: string
  applyBy: string
  uploadBy: string
  changePreferencesBy: string
  offersReleased: string
  notes: string
}

export function parseUACCSV(): UACRound[] {
  const csvPath = path.join(process.cwd(), 'public', 'data', 'UAC-2026.csv')
  const fileContent = fs.readFileSync(csvPath, 'utf-8')
  
  const lines = fileContent.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.trim())
  
  const rounds: UACRound[] = []
  
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
    
    if (values.length >= 6) {
      rounds.push({
        round: values[0],
        applyBy: values[1],
        uploadBy: values[2],
        changePreferencesBy: values[3],
        offersReleased: values[4],
        notes: values[5] || '',
      })
    }
  }
  
  return rounds
}

function parseDate(dateStr: string): string {
  if (!dateStr) return ''
  
  // Remove asterisks and extra whitespace
  const clean = dateStr.replace(/\*/g, '').trim()
  
  const months: { [key: string]: string } = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  }
  
  // Parse format like "Thu 3 Apr 2025" or "Fri 6 Feb 2026*"
  const parts = clean.split(' ')
  
  if (parts.length >= 4) {
    const day = parts[1].padStart(2, '0')
    const month = months[parts[2]] || '01'
    const year = parts[3]
    return `${year}-${month}-${day}`
  }
  
  // If already in ISO format, return as is
  if (clean.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return clean
  }
  
  return clean
}

  
export function generateUACTimelineFromCSV(userData: any) {
  const rounds = parseUACCSV()
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset to start of day for accurate comparison
  
  // Find the next upcoming application deadline
  let nextDeadline = '2026-12-31' // Default fallback
  for (const round of rounds) {
    const applyByDate = new Date(parseDate(round.applyBy))
    if (applyByDate > today) {
      nextDeadline = round.applyBy
      break // Found the next upcoming deadline
    }
  }
  
  // Filter for main rounds (2026 dates, Year 12 students)
  const mainRounds = rounds.filter(r => 
    r.offersReleased.includes('2026') || 
    r.notes.includes('Main offer rounds for 2025 Year 12 students')
  )
  
  // Get the round corresponding to the next deadline
  const nextDeadlineRound = rounds.find(r => r.applyBy === nextDeadline)
  
  // Get ALL important dates (both past and upcoming)
  const importantDates: Array<{ date: string; event: string }> = []
  
  // Add all main round offer dates
  for (const round of mainRounds) {
    importantDates.push({
      date: parseDate(round.offersReleased),
      event: `${round.round} Offers`
    })
  }
  
  // Add ATAR Release if it's a relevant year
  if (mainRounds.length > 0) {
    importantDates.push({
      date: '2025-12-15',
      event: 'ATAR Release'
    })
  }
  
  // Sort by date (earliest first)
  importantDates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // Format ALL offer rounds (both past and upcoming)
  const offerRounds = mainRounds
    .map((round, index) => ({
      round: index + 1,
      date: parseDate(round.offersReleased),
      description: round.round,
      applyBy: parseDate(round.applyBy),
      changePreferencesBy: parseDate(round.changePreferencesBy),
    }))
  
  return {
    applicationDeadline: parseDate(nextDeadline),
    offerRounds,
    importantDates,
    allRounds: rounds.map(r => ({
      round: r.round,
      applyBy: parseDate(r.applyBy),
      uploadBy: parseDate(r.uploadBy),
      changePreferencesBy: parseDate(r.changePreferencesBy),
      offersReleased: parseDate(r.offersReleased),
      notes: r.notes,
    })),
  }
}
