import { getPostcodeCoordinates, getUniversityCoordinates } from './geocoding'

// Response types based on NSW Transport API
interface TripLeg {
  duration?: number
  distance?: number
  transportation?: {
    product?: {
      name?: string
      class?: number
    }
  }
  origin?: {
    name?: string
    coord?: [number, number]
  }
  destination?: {
    name?: string
    coord?: [number, number]
  }
  footPathInfo?: Array<{
    duration?: number
  }>
}

interface Journey {
  legs?: TripLeg[]
  duration?: number
  interchanges?: number
}

interface TripResponse {
  journeys?: Journey[]
}

export interface RouteResult {
  university: string
  fromPostcode: string
  originStop: string | null
  destinationStop: string | null
  travelTime: number // minutes
  distance: number // km
  cost: string
  costUncapped?: string
  costIsCapped?: boolean
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
 * Call NSW Transport Trip Planner API
 */
export async function calculateCommuteRoute(
  postcode: string,
  university: string
): Promise<RouteResult> {
  // Check for API key
  const apiKey = process.env.NSW_TRANSPORT_API_KEY
  if (!apiKey) {
    throw new Error('NSW_TRANSPORT_API_KEY not found in environment variables')
  }

  // Get coordinates from Supabase (required - no fallback)
  const originCoords = await getPostcodeCoordinates(postcode)
  const destCoords = await getUniversityCoordinates(university)

  if (!originCoords) {
    throw new Error(`Postcode ${postcode} not found in database`)
  }

  if (!destCoords) {
    throw new Error(`University ${university} not found in database`)
  }

  // Get current date/time for the trip
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
  const timeStr = now.toTimeString().slice(0, 5).replace(':', '') // HHMM

  // Build URL with coordinates
  const originParam = `${originCoords.longitude}:${originCoords.latitude}:EPSG:4326`
  const destParam = `${destCoords.longitude}:${destCoords.latitude}:EPSG:4326`

  const url = new URL('https://api.transport.nsw.gov.au/v1/tp/trip')
  url.searchParams.set('outputFormat', 'rapidJSON')
  url.searchParams.set('coordOutputFormat', 'EPSG:4326')
  url.searchParams.set('depArrMacro', 'dep')
  url.searchParams.set('itdDate', dateStr)
  url.searchParams.set('itdTime', timeStr)
  url.searchParams.set('type_origin', 'coord')
  url.searchParams.set('name_origin', originParam)
  url.searchParams.set('type_destination', 'coord')
  url.searchParams.set('name_destination', destParam)
  url.searchParams.set('TfNSWTR', 'true')
  url.searchParams.set('version', '10.2.1.42')
  url.searchParams.set('calcNumberOfTrips', '5')
  url.searchParams.set('coordListOutputFormat', 'STRING')

  // Make API request
  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `apikey ${apiKey}`,
    },
  })

  if (!response.ok) {
    throw new Error(`NSW Transport API returned ${response.status}: ${response.statusText}`)
  }

  const data: TripResponse = await response.json()

  // Parse the response
  if (!data.journeys || data.journeys.length === 0) {
    throw new Error(`No journeys found from ${postcode} to ${university}`)
  }

  // Get the fastest journey (sort by duration)
  const sortedJourneys = [...data.journeys].sort((a, b) => {
    const durationA = a.legs?.reduce((sum, leg) => sum + (leg.duration || 0), 0) || 0
    const durationB = b.legs?.reduce((sum, leg) => sum + (leg.duration || 0), 0) || 0
    return durationA - durationB
  })
  const journey = sortedJourneys[0]  // Fastest option
  
  return parseJourneyToRouteResult(journey, postcode, university, originCoords, destCoords)
}

/**
 * Parse journey data from API into RouteResult format
 */
function parseJourneyToRouteResult(
  journey: Journey,
  postcode: string,
  university: string,
  originCoords: any,
  destCoords: any
): RouteResult {
  const legs = journey.legs || []

  // Calculate total travel time from legs (API returns seconds, convert to minutes)
  let totalDuration = 0
  legs.forEach(leg => {
    totalDuration += leg.duration || 0
  })
  const travelTime = totalDuration > 0 ? Math.round(totalDuration / 60) : 0

  // Extract transport modes and walking times
  const transportOptions: string[] = []
  let walkingToStop = 0
  let walkingFromStop = 0
  let transitTime = 0
  const transfers = journey.interchanges || 0

  let totalWalkingTime = 0  // Track ALL walking

  legs.forEach((leg, index) => {
    const transport = leg.transportation?.product
    const legDuration = leg.duration ? Math.round(leg.duration / 60) : 0
    const transportClass = transport?.class
  
    // Check if it's a walking/footpath leg (class 100)
    const isWalking = transportClass === 100 || transport?.name === 'footpath' || !transport
  
    if (isWalking) {
      // Walking leg - add to total
      totalWalkingTime += legDuration
      
      // Still track first/last for breakdown
      if (index === 0) {
        walkingToStop = legDuration
      } else if (index === legs.length - 1) {
        walkingFromStop = legDuration
      }
    } else {
      // Actual transport leg
      // 1=Train, 2=Metro, 4=Light Rail, 5=Bus, 7=Coach, 9=Ferry, 11=School Bus
      if (transportClass === 1 && !transportOptions.includes('Train')) {
        transportOptions.push('Train')
      } else if (transportClass === 2 && !transportOptions.includes('Metro')) {
        transportOptions.push('Metro')
      } else if (transportClass === 4 && !transportOptions.includes('Light Rail')) {
        transportOptions.push('Light Rail')
      } else if (transportClass === 5 && !transportOptions.includes('Bus')) {
        transportOptions.push('Bus')
      } else if (transportClass === 9 && !transportOptions.includes('Ferry')) {
        transportOptions.push('Ferry')
      }
  
      transitTime += legDuration
    }
  })

  // Calculate ACTUAL journey distance from legs (not straight-line!)
  let actualDistance = 0
  legs.forEach(leg => {
    actualDistance += leg.distance || 0  // Distance in meters
  })
  const distanceKm = actualDistance / 1000  // Convert meters to km

  // Use straight-line as fallback if actual distance is suspiciously small
  const straightLineDistance = calculateDistance(
    originCoords.latitude,
    originCoords.longitude,
    destCoords.latitude,
    destCoords.longitude
  )

  // If actual distance is less than half the straight-line, it's probably incomplete
  // (missing transit leg distances), so use straight-line * 1.3 for route factor
  const distance = (distanceKm > 0 && distanceKm > straightLineDistance * 0.5) 
    ? distanceKm 
    : straightLineDistance * 1.3  // Add 30% for non-straight routes

  // Calculate cost based on actual route distance and transport modes
  const { cost, uncappedEstimate, isCapped } = calculateOpalCostWithDetails(distance, travelTime, transportOptions)

  // Get origin and destination stop names
  const originStop = legs[0]?.origin?.name || null
  const destStop = legs[legs.length - 1]?.destination?.name || null

  return {
    university,
    fromPostcode: postcode,
    originStop,
    destinationStop: destStop,
    travelTime: Math.round(travelTime),
    distance: Math.round(distance * 10) / 10,
    cost: cost.toFixed(2),
    costUncapped: uncappedEstimate.toFixed(2),
    costIsCapped: isCapped,
    transportOptions: transportOptions.length > 0 ? transportOptions : ['Train', 'Bus'],
    accessibility: 'Check with transport provider',
    routeDetails: {
      walkingToStop: Math.round(totalWalkingTime),
      transitTime: Math.round(transitTime),
      walkingFromStop: 0,
      transfers,
    },
  }
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

function calculateOpalCost(distance: number, travelTime: number, transportModes: string[] = []): number {
  return calculateOpalCostWithDetails(distance, travelTime, transportModes).cost
}

function calculateOpalCostWithDetails(
  distance: number,
  _travelTime: number,
  transportModes: string[] = []
): { cost: number; uncappedEstimate: number; isCapped: boolean } {
  // APPROXIMATION: Opal uses distance BANDS with fixed fares per band, not a continuous per-km rate.
  // Official structure: transportnsw.info/tickets-fares/fares, IPART Opal determinations.
  // The values below are a simple linear approximation (base + perKm) to get a rough estimate;
  // min/max are in the ballpark of band endpoints. For accurate fares use official band tables.
  // Train/Metro: approx $3.73-$5.36 (perKm 0.25 is approximate, not from official docs)
  // Bus: approx $2.50-$4.90; Ferry: approx $6.20-$9.20
  const hasFerry = transportModes.includes('Ferry')
  const hasTrain = transportModes.includes('Train') || transportModes.includes('Metro')

  let baseCost = 2.50
  let perKm = 0.20
  let maxCost = 4.90

  if (hasFerry) {
    baseCost = 6.20
    perKm = 0.30
    maxCost = 9.20
  } else if (hasTrain) {
    baseCost = 3.73
    perKm = 0.25  // approximate; official fares use distance bands (0–10 km, 10–20 km, etc.)
    maxCost = 5.36
  }

  const uncappedEstimate = baseCost + distance * perKm
  const cost = Math.min(uncappedEstimate, maxCost)
  const isCapped = uncappedEstimate >= maxCost
  return { cost, uncappedEstimate, isCapped }
}