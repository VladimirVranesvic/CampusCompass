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
  
  // Filter for main rounds (2026 dates, Year 12 students)
  const mainRounds = rounds.filter(r => 
    r.offersReleased.includes('2026') || 
    r.notes.includes('Main offer rounds for 2025 Year 12 students')
  )
  
  // Get important dates
  const septemberRound2 = rounds.find(r => r.round === 'September Round 2')
  const decemberRound2 = rounds.find(r => r.round === 'December Round 2')
  const januaryRound1 = rounds.find(r => r.round === 'January Round 1')
  
  const importantDates = [
    {
      date: parseDate(septemberRound2?.applyBy || '2025-08-21'),
      event: 'On-time Application Deadline (September Round 2)'
    },
    {
      date: '2025-12-15', // ATAR Release (typically mid-December)
      event: 'ATAR Release'
    },
    {
      date: parseDate(decemberRound2?.offersReleased || '2025-12-23'),
      event: 'December Round 2 Offers (Main Round)'
    },
    {
      date: parseDate(januaryRound1?.offersReleased || '2026-01-08'),
      event: 'January Round 1 Offers (Main Round)'
    },
  ]
  
  // Format offer rounds - focus on main rounds for Year 12 students
  const offerRounds = mainRounds
    .filter(r => r.notes.includes('Main offer rounds for 2025 Year 12 students'))
    .slice(0, 5)
    .map((round, index) => ({
      round: index + 1,
      date: parseDate(round.offersReleased),
      description: round.round,
      applyBy: parseDate(round.applyBy),
      changePreferencesBy: parseDate(round.changePreferencesBy),
    }))
  
  // Find application deadline (September Round 2 is typically the main deadline)
  const applicationDeadline = septemberRound2?.applyBy || '2025-08-21'
  
  return {
    applicationDeadline: parseDate(applicationDeadline),
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
