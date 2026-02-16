import { supabase } from '../supabase/client'

interface PostcodeLocation {
  postcode: string
  latitude: number
  longitude: number
  suburb: string
  state: string
}

// Cache for postcodes to avoid repeated DB calls
const postcodeCache: { [key: string]: PostcodeLocation } = {}

// Get coordinates for a postcode from Supabase
export async function getPostcodeCoordinates(
  postcode: string
): Promise<PostcodeLocation | null> {
  // Check cache first
  if (postcodeCache[postcode]) {
    return postcodeCache[postcode]
  }

  try {
    // Convert postcode to integer for query (database stores as int8)
    const postcodeInt = parseInt(postcode, 10)
    
    if (isNaN(postcodeInt)) {
      console.error(`Invalid postcode format: ${postcode}`)
      return null
    }

    const { data, error } = await supabase
      .from('PostCodes')
      .select('postcode, lat, long, locality, state')
      .eq('postcode', postcodeInt)
      .limit(1)        // Get just the first match
      .single()        // Convert array to single object

    if (error) {
      console.error('Error fetching postcode:', error)
      return null
    }

    if (data) {
      // Map database columns to our interface
      const result: PostcodeLocation = {
        postcode: String(data.postcode),
        latitude: data.lat,
        longitude: data.long,
        suburb: data.locality,
        state: data.state,
      }
      
      // Cache the result
      postcodeCache[postcode] = result
      return result
    }

    return null
  } catch (error) {
    console.error('Error fetching postcode:', error)
    return null
  }
}

/** University campus postcodes (NSW) — shared with plan API and rental logic */
export const UNIVERSITY_POSTCODE: Record<string, string> = {
  'University of Sydney': '2006',
  'UNSW Sydney': '2052',
  'University of Technology Sydney': '2007',
  'Macquarie University': '2109',
  'Western Sydney University': '2751',
  'University of Wollongong': '2522',
  'University of Newcastle': '2308',
  'Charles Sturt University': '2678',
  'Southern Cross University': '2480',
  'University of New England': '2351',
  'Australian Catholic University': '2060',
}

/**
 * Get coordinates for a university
 */
export async function getUniversityCoordinates(
  university: string
): Promise<PostcodeLocation | null> {
  const postcode = UNIVERSITY_POSTCODE[university]
  return postcode ? getPostcodeCoordinates(postcode) : null
}