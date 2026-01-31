import fs from 'fs'
import path from 'path'

// Dynamic import for xlsx (optional dependency)
let XLSX: any = null
try {
  XLSX = require('xlsx')
} catch (error) {
  console.warn('xlsx not installed. Install with: npm install xlsx')
}

interface RentalData {
  postcode: string
  dwellingType: string
  bedrooms: string | number
  weeklyRent: number
  year?: string | number
  month?: string | number
  suburb?: string
}

interface ProcessedRentalData {
  postcode: string
  medianWeeklyRent: {
    apartment: number
    house: number
    share: number
  }
  byBedrooms: {
    [bedrooms: string]: {
      apartment: number
      house: number
    }
  }
  nearbySuburbs: Array<{
    name: string
    distance: string
    medianRent: number
  }>
}

// Cache for processed data
let rentalDataCache: RentalData[] | null = null

/**
 * Parse XLSX rental bond data file
 */
export function parseRentalXLSX(xlsxPath: string): RentalData[] {
  if (!XLSX) {
    throw new Error('xlsx not installed. Please install with: npm install xlsx')
  }

  const fullPath = path.join(process.cwd(), xlsxPath)
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`Rental data file not found: ${fullPath}`)
    return []
  }

  // Read the workbook
  const workbook = XLSX.readFile(fullPath)
  
  // Get the first sheet (or you can specify a sheet name)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  
  // Convert to JSON
  const rawData = XLSX.utils.sheet_to_json(worksheet, { 
    raw: false, // Convert numbers to strings for consistent handling
    defval: '' // Default value for empty cells
  })
  
  // Map to our data structure
  // Adjust column names based on your actual XLSX structure
  const data: RentalData[] = rawData.map((row: any) => {
    // Common column name variations - adjust based on your file
    const postcode = row['Postcode'] || row['postcode'] || row['POSTCODE'] || row['Post Code'] || ''
    const dwellingType = row['Dwelling Type'] || row['DwellingType'] || row['dwelling_type'] || row['Dwelling'] || ''
    const bedrooms = row['Bedrooms'] || row['bedrooms'] || row['BEDROOMS'] || row['Number of Bedrooms'] || row['Bedroom'] || ''
    const weeklyRent = parseFloat(row['Weekly Rent'] || row['WeeklyRent'] || row['weekly_rent'] || row['Rent'] || row['Weekly'] || '0')
    const year = row['Year'] || row['year'] || row['YEAR'] || undefined
    const month = row['Month'] || row['month'] || row['MONTH'] || undefined
    const suburb = row['Suburb'] || row['suburb'] || row['SUBURB'] || row['Suburb Name'] || undefined
    
    if (postcode && weeklyRent > 0) {
      return {
        postcode: String(postcode).padStart(4, '0'), // Ensure 4-digit postcode
        dwellingType: String(dwellingType),
        bedrooms: bedrooms,
        weeklyRent,
        year,
        month,
        suburb,
      }
    }
    return null
  }).filter((item: RentalData | null): item is RentalData => item !== null)
  
  return data
}

/**
 * Load and cache rental data
 */
export function loadRentalData(xlsxPath?: string): RentalData[] {
  if (rentalDataCache) {
    return rentalDataCache
  }
  
  const path = xlsxPath || 'public/data/rentalbond_lodgements_year_2025.xlsx'
  
  try {
    rentalDataCache = parseRentalXLSX(path)
    console.log(`Loaded ${rentalDataCache.length} rental records`)
    return rentalDataCache
  } catch (error) {
    console.error('Error loading rental data:', error)
    return []
  }
}

/**
 * Get rental data for a specific postcode
 */
export function getRentalDataByPostcode(
  allData: RentalData[],
  postcode: string
): ProcessedRentalData {
  // Normalize postcode (ensure 4 digits)
  const normalizedPostcode = postcode.padStart(4, '0')
  const postcodeData = allData.filter(d => d.postcode === normalizedPostcode)
  
  if (postcodeData.length === 0) {
    // Return empty data structure if no data found
    return {
      postcode: normalizedPostcode,
      medianWeeklyRent: {
        apartment: 0,
        house: 0,
        share: 0,
      },
      byBedrooms: {},
      nearbySuburbs: [],
    }
  }
  
  // Filter by dwelling type
  const apartments = postcodeData.filter(d => {
    const type = String(d.dwellingType).toLowerCase()
    return type.includes('apartment') || 
           type.includes('unit') ||
           type.includes('flat') ||
           type.includes('studio')
  })
  
  const houses = postcodeData.filter(d => {
    const type = String(d.dwellingType).toLowerCase()
    return type.includes('house') ||
           type.includes('townhouse') ||
           type.includes('villa') ||
           type.includes('cottage') ||
           type.includes('terrace')
  })
  
  // Calculate medians
  const apartmentRents = apartments.map(d => d.weeklyRent).filter(r => r > 0).sort((a, b) => a - b)
  const houseRents = houses.map(d => d.weeklyRent).filter(r => r > 0).sort((a, b) => a - b)
  
  const medianApartment = calculateMedian(apartmentRents)
  const medianHouse = calculateMedian(houseRents)
  const medianShare = Math.round(medianApartment * 0.4) // Estimate share house as 40% of apartment
  
  // Group by bedrooms
  const byBedrooms: { [key: string]: { apartment: number; house: number } } = {}
  const bedroomGroups = ['1', '2', '3', '4', '5']
  
  for (const beds of bedroomGroups) {
    const aptBeds = apartments.filter(d => {
      const bedStr = String(d.bedrooms)
      return bedStr === beds || bedStr.startsWith(beds)
    })
    const houseBeds = houses.filter(d => {
      const bedStr = String(d.bedrooms)
      return bedStr === beds || bedStr.startsWith(beds)
    })
    
    byBedrooms[beds] = {
      apartment: calculateMedian(aptBeds.map(d => d.weeklyRent).filter(r => r > 0)),
      house: calculateMedian(houseBeds.map(d => d.weeklyRent).filter(r => r > 0)),
    }
  }
  
  // Find nearby suburbs (simplified - would need actual suburb coordinates)
  const nearbySuburbs = findNearbySuburbs(allData, normalizedPostcode)
  
  return {
    postcode: normalizedPostcode,
    medianWeeklyRent: {
      apartment: medianApartment || 0,
      house: medianHouse || 0,
      share: medianShare || 0,
    },
    byBedrooms,
    nearbySuburbs,
  }
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid]
}

function findNearbySuburbs(
  allData: RentalData[], 
  postcode: string, 
  limit: number = 3
): Array<{ name: string; distance: string; medianRent: number }> {
  // Get unique postcodes (excluding current)
  const uniquePostcodes = [...new Set(allData.map(d => d.postcode))]
    .filter(p => p !== postcode && p.length === 4)
  
  const nearby: Array<{ name: string; distance: string; medianRent: number }> = []
  
  // Get suburbs for nearby postcodes
  for (let i = 0; i < Math.min(limit, uniquePostcodes.length); i++) {
    const nearbyPostcode = uniquePostcodes[i]
    const nearbyData = allData.filter(d => d.postcode === nearbyPostcode)
    const median = calculateMedian(nearbyData.map(d => d.weeklyRent).filter(r => r > 0))
    
    // Try to get suburb name from data
    const suburbName = nearbyData.find(d => d.suburb)?.suburb || `Postcode ${nearbyPostcode}`
    
    if (median > 0) {
      nearby.push({
        name: suburbName,
        distance: `${(i + 1) * 2}km`, // Estimated distance
        medianRent: median,
      })
    }
  }
  
  return nearby
}
