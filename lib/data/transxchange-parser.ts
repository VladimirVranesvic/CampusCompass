import fs from 'fs'
import path from 'path'

// Dynamic import for xml2js (optional dependency)
let parseString: any = null
try {
  const xml2js = require('xml2js')
  parseString = xml2js.parseString
} catch (error) {
  console.warn('xml2js not installed. Install with: npm install xml2js')
}

export interface StopPoint {
  atcoCode: string
  name: string
  longitude: number
  latitude: number
  suburb?: string
  locality?: string
}

interface Route {
  routeId: string
  routeName: string
  stops: StopPoint[]
  journeyPatterns: any[]
}

interface TransXChangeData {
  stops: StopPoint[]
  routes: Route[]
}

// Cache for processed data
let stopsCache: StopPoint[] | null = null
let routesCache: Route[] | null = null

/**
 * Parse a single TransXChange XML file
 */
async function parseTransXChangeFile(filePath: string): Promise<TransXChangeData> {
  if (!parseString) {
    throw new Error('xml2js not installed. Please install with: npm install xml2js')
  }

  const xmlContent = fs.readFileSync(filePath, 'utf-8')
  
  return new Promise((resolve, reject) => {
    parseString(xmlContent, (err: any, result: any) => {
      if (err) {
        reject(err)
        return
      }

      const stops: StopPoint[] = []
      const routes: Route[] = []

      // Extract StopPoints
      const stopPoints = result.TransXChange?.StopPoints?.[0]?.StopPoint || []
      for (const stop of stopPoints) {
        const location = stop.Place?.[0]?.Location?.[0]
        if (location?.Longitude?.[0] && location?.Latitude?.[0]) {
          stops.push({
            atcoCode: stop.AtcoCode?.[0] || '',
            name: stop.Descriptor?.[0]?.CommonName?.[0] || '',
            longitude: parseFloat(location.Longitude[0]),
            latitude: parseFloat(location.Latitude[0]),
            suburb: stop.Place?.[0]?.Suburb?.[0],
            locality: stop.Place?.[0]?.NptgLocalityRef?.[0],
          })
        }
      }

      // Extract Routes (simplified - TransXChange routes are complex)
      const services = result.TransXChange?.Services?.[0]?.Service || []
      for (const service of services) {
        const serviceCode = service.ServiceCode?.[0] || ''
        const description = service.Description?.[0] || ''
        
        // Extract journey patterns and stops
        const journeyPatterns = service.StandardService?.[0]?.JourneyPattern || []
        
        routes.push({
          routeId: serviceCode,
          routeName: description,
          stops: [], // Will be populated from journey patterns
          journeyPatterns: journeyPatterns,
        })
      }

      resolve({ stops, routes })
    })
  })
}

/**
 * Process all TransXChange files and extract stops
 * This is a one-time processing step - results should be cached
 */
export async function processAllTransXChangeFiles(): Promise<StopPoint[]> {
  if (stopsCache) {
    return stopsCache
  }

  const transxchangeDir = path.join(process.cwd(), 'public', 'data', 'transxchange_1')
  const stops: StopPoint[] = []
  const processedFiles = new Set<string>() // Track processed ATCO codes to avoid duplicates

  // Process files in batches to avoid memory issues
  const subdirs = fs.readdirSync(transxchangeDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  for (const subdir of subdirs.slice(0, 10)) { // Limit to first 10 subdirs for performance
    const subdirPath = path.join(transxchangeDir, subdir)
    const files = fs.readdirSync(subdirPath)
      .filter(file => file.endsWith('.xml'))
      .slice(0, 50) // Limit files per directory

    for (const file of files) {
      try {
        const filePath = path.join(subdirPath, file)
        const data = await parseTransXChangeFile(filePath)
        
        // Add unique stops
        for (const stop of data.stops) {
          if (!processedFiles.has(stop.atcoCode)) {
            stops.push(stop)
            processedFiles.add(stop.atcoCode)
          }
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error)
      }
    }
  }

  stopsCache = stops
  return stops
}

/**
 * Find nearest stops to a given coordinate
 */
export function findNearestStops(
  stops: StopPoint[],
  latitude: number,
  longitude: number,
  maxDistance: number = 5, // km
  limit: number = 5
): StopPoint[] {
  const stopsWithDistance = stops.map(stop => {
    const distance = calculateDistance(
      latitude,
      longitude,
      stop.latitude,
      stop.longitude
    )
    return { ...stop, distance }
  })

  return stopsWithDistance
    .filter(s => s.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Save processed stops to JSON for faster loading
 */
export async function saveStopsToJSON(stops: StopPoint[], outputPath: string) {
  const output = path.join(process.cwd(), 'data', outputPath)
  const dir = path.dirname(output)
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  
  fs.writeFileSync(output, JSON.stringify(stops, null, 2))
}

/**
 * Load stops from JSON cache
 */
export function loadStopsFromJSON(inputPath: string): StopPoint[] {
  const input = path.join(process.cwd(), 'data', inputPath)
  
  if (!fs.existsSync(input)) {
    return []
  }
  
  const content = fs.readFileSync(input, 'utf-8')
  return JSON.parse(content)
}
