import { StopPoint, findNearestStops, processAllTransXChangeFiles, loadStopsFromJSON } from './transxchange-parser'
import { getPostcodeCoordinates, getUniversityCoordinates, estimatePostcodeCoordinates } from './geocoding'
import fs from 'fs'
import path from 'path'

interface RouteResult {
  university: string
  fromPostcode: string
  originStop: StopPoint | null
  destinationStop: StopPoint | null
  travelTime: number // minutes
  distance: number // km
  cost: string
  transportOptions: string[]
  accessibility: string
  routeDetails?: {
    walkingToStop: number // minutes
    transitTime: number // minutes
    walkingFromStop: number // minutes
    transfers: number
  }
}

/**
 * Calculate commute from postcode to university using TransXChange data
 */
export async function calculateCommuteRoute(
  postcode: string,
  university: string
): Promise<RouteResult> {
  // Get coordinates
  const originCoords = getPostcodeCoordinates(postcode) || estimatePostcodeCoordinates(postcode)
  const destCoords = getUniversityCoordinates(university)

  if (!originCoords || !destCoords) {
    // Fallback to distance-based estimate
    return calculateDistanceBasedRoute(postcode, university, originCoords, destCoords)
  }

  // Load stops (try cached first, then process)
  let stops: StopPoint[]
  const cachePath = 'processed-stops.json'
  
  try {
    stops = loadStopsFromJSON(cachePath)
    if (stops.length === 0) {
      // Process TransXChange files (this is slow, should be done once)
      console.log('Processing TransXChange files... (this may take a while)')
      stops = await processAllTransXChangeFiles()
      
      // Save to cache
      const outputPath = path.join(process.cwd(), 'data', cachePath)
      const dir = path.dirname(outputPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(outputPath, JSON.stringify(stops, null, 2))
    }
  } catch (error) {
    console.error('Error loading stops:', error)
    // Fallback to distance-based
    return calculateDistanceBasedRoute(postcode, university, originCoords, destCoords)
  }

  // Find nearest stops
  const originStops = findNearestStops(
    stops,
    originCoords.latitude,
    originCoords.longitude,
    5, // 5km radius
    3 // top 3 stops
  )

  const destStops = findNearestStops(
    stops,
    destCoords.latitude,
    destCoords.longitude,
    5, // 5km radius
    3 // top 3 stops
  )

  if (originStops.length === 0 || destStops.length === 0) {
    // No stops found, use distance-based estimate
    return calculateDistanceBasedRoute(postcode, university, originCoords, destCoords)
  }

  // Calculate route using nearest stops
  const originStop = originStops[0]
  const destStop = destStops[0]

  // Calculate distances
  const walkingToStop = calculateWalkingTime(
    originCoords.latitude,
    originCoords.longitude,
    originStop.latitude,
    originStop.longitude
  )

  const transitDistance = calculateDistance(
    originStop.latitude,
    originStop.longitude,
    destStop.latitude,
    destStop.longitude
  )

  const walkingFromStop = calculateWalkingTime(
    destStop.latitude,
    destStop.longitude,
    destCoords.latitude,
    destCoords.longitude
  )

  // Estimate transit time (average 40 km/h for bus, 60 km/h for train)
  const averageSpeed = 50 // km/h (mixed transit)
  const transitTime = (transitDistance / averageSpeed) * 60 // minutes

  // Add transfer time (5 minutes per transfer, estimate 1 transfer)
  const transferTime = 5
  const totalTransitTime = transitTime + transferTime

  const totalTravelTime = Math.round(walkingToStop + totalTransitTime + walkingFromStop)

  // Calculate cost (Opal card rates - simplified)
  const cost = calculateOpalCost(transitDistance, totalTravelTime)

  // Determine transport options based on stop types
  const transportOptions = determineTransportOptions(originStop, destStop)

  return {
    university,
    fromPostcode: postcode,
    originStop,
    destinationStop: destStop,
    travelTime: totalTravelTime,
    distance: Math.round(transitDistance * 10) / 10,
    cost: cost.toFixed(2),
    transportOptions,
    accessibility: 'Fully accessible', // Would need to check stop accessibility data
    routeDetails: {
      walkingToStop: Math.round(walkingToStop),
      transitTime: Math.round(totalTransitTime),
      walkingFromStop: Math.round(walkingFromStop),
      transfers: 1, // Estimated
    },
  }
}

/**
 * Fallback: Calculate route based on straight-line distance
 */
function calculateDistanceBasedRoute(
  postcode: string,
  university: string,
  originCoords: any,
  destCoords: any
): RouteResult {
  let distance = 0
  let travelTime = 0

  if (originCoords && destCoords) {
    distance = calculateDistance(
      originCoords.latitude,
      originCoords.longitude,
      destCoords.latitude,
      destCoords.longitude
    )
    // Estimate travel time: 30 km/h average (mixed transport)
    travelTime = Math.round((distance / 30) * 60)
  } else {
    // Very rough estimate
    distance = 20 // km
    travelTime = 45 // minutes
  }

  const cost = calculateOpalCost(distance, travelTime)

  return {
    university,
    fromPostcode: postcode,
    originStop: null,
    destinationStop: null,
    travelTime,
    distance: Math.round(distance * 10) / 10,
    cost: cost.toFixed(2),
    transportOptions: ['Train', 'Bus'],
    accessibility: 'Unknown',
  }
}

/**
 * Calculate walking time between two points
 * Assumes 5 km/h walking speed
 */
function calculateWalkingTime(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const distance = calculateDistance(lat1, lon1, lat2, lon2)
  const walkingSpeed = 5 // km/h
  return (distance / walkingSpeed) * 60 // minutes
}

/**
 * Calculate distance between two coordinates (Haversine formula)
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
 * Calculate Opal card cost (simplified)
 * Opal rates: $3.20-$4.60 for train, $2.40-$4.80 for bus (distance-based)
 */
function calculateOpalCost(distance: number, travelTime: number): number {
  // Simplified: $0.20 per km, minimum $3.20, maximum $4.80
  const baseCost = 3.20
  const perKm = 0.20
  const cost = baseCost + distance * perKm
  return Math.min(Math.max(cost, 3.20), 4.80)
}

/**
 * Determine transport options based on stop characteristics
 */
function determineTransportOptions(originStop: StopPoint, destStop: StopPoint): string[] {
  const options: string[] = []

  // Check stop names for clues
  const originName = originStop.name.toLowerCase()
  const destName = destStop.name.toLowerCase()

  if (originName.includes('station') || destName.includes('station')) {
    options.push('Train')
  }
  if (originName.includes('bus') || destName.includes('bus') || 
      originName.includes('stop') || destName.includes('stop')) {
    options.push('Bus')
  }

  // Default if no clues
  if (options.length === 0) {
    options.push('Train', 'Bus')
  }

  return options
}
