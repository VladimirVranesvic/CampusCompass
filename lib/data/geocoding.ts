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

/**
 * Get coordinates for a university
 */
export async function getUniversityCoordinates(
  university: string
): Promise<PostcodeLocation | null> {
  const universityMap: { [key: string]: string } = {
    'University of Sydney': '2006',              // Camperdown/Darlington campus
    'UNSW Sydney': '2052',                       // Kensington campus
    'University of Technology Sydney': '2007',   // Ultimo campus
    'Macquarie University': '2109',              // Macquarie Park
    'Western Sydney University': '2751',         // Parramatta South campus
    'University of Wollongong': '2522',          // Main Wollongong campus
    'University of Newcastle': '2308',           // Callaghan campus
    'Charles Sturt University': '2678',          // Wagga Wagga main campus
    'Southern Cross University': '2480',         // Lismore campus
    'University of New England': '2351',         // Armidale campus
  }

  const postcode = universityMap[university]
  return postcode ? getPostcodeCoordinates(postcode) : null
}