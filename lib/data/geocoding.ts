/**
 * Postcode to coordinates mapping
 * For NSW postcodes, we'll use a lookup table
 * In production, you'd use a geocoding API or comprehensive postcode database
 */

interface PostcodeLocation {
  postcode: string
  latitude: number
  longitude: number
  suburb: string
  state: string
}

// Common NSW postcodes with coordinates
// This is a simplified lookup - in production, use a comprehensive database
const postcodeDatabase: { [key: string]: PostcodeLocation } = {
  // Sydney CBD and inner suburbs
  '2000': { postcode: '2000', latitude: -33.8688, longitude: 151.2093, suburb: 'Sydney', state: 'NSW' },
  '2001': { postcode: '2001', latitude: -33.8688, longitude: 151.2093, suburb: 'Sydney', state: 'NSW' },
  '2010': { postcode: '2010', latitude: -33.8847, longitude: 151.2100, suburb: 'Darlinghurst', state: 'NSW' },
  '2011': { postcode: '2011', latitude: -33.8847, longitude: 151.2100, suburb: 'Potts Point', state: 'NSW' },
  '2015': { postcode: '2015', latitude: -33.9200, longitude: 151.2000, suburb: 'Alexandria', state: 'NSW' },
  '2016': { postcode: '2016', latitude: -33.9200, longitude: 151.2000, suburb: 'Mascot', state: 'NSW' },
  '2017': { postcode: '2017', latitude: -33.9200, longitude: 151.2000, suburb: 'Botany', state: 'NSW' },
  '2018': { postcode: '2018', latitude: -33.9200, longitude: 151.2000, suburb: 'Maroubra', state: 'NSW' },
  '2020': { postcode: '2020', latitude: -33.9000, longitude: 151.2500, suburb: 'Randwick', state: 'NSW' },
  '2021': { postcode: '2021', latitude: -33.9000, longitude: 151.2500, suburb: 'Coogee', state: 'NSW' },
  '2022': { postcode: '2022', latitude: -33.9000, longitude: 151.2500, suburb: 'Bondi', state: 'NSW' },
  '2031': { postcode: '2031', latitude: -33.8700, longitude: 151.2000, suburb: 'Glebe', state: 'NSW' },
  '2032': { postcode: '2032', latitude: -33.8700, longitude: 151.2000, suburb: 'Newtown', state: 'NSW' },
  '2033': { postcode: '2033', latitude: -33.8700, longitude: 151.2000, suburb: 'Camperdown', state: 'NSW' },
  '2034': { postcode: '2034', latitude: -33.8700, longitude: 151.2000, suburb: 'Annandale', state: 'NSW' },
  '2035': { postcode: '2035', latitude: -33.8700, longitude: 151.2000, suburb: 'Leichhardt', state: 'NSW' },
  '2036': { postcode: '2036', latitude: -33.8700, longitude: 151.2000, suburb: 'Marrickville', state: 'NSW' },
  '2037': { postcode: '2037', latitude: -33.8700, longitude: 151.2000, suburb: 'Petersham', state: 'NSW' },
  '2038': { postcode: '2038', latitude: -33.8700, longitude: 151.2000, suburb: 'Dulwich Hill', state: 'NSW' },
  '2039': { postcode: '2039', latitude: -33.8700, longitude: 151.2000, suburb: 'Summer Hill', state: 'NSW' },
  '2040': { postcode: '2040', latitude: -33.8700, longitude: 151.2000, suburb: 'Ashfield', state: 'NSW' },
  '2041': { postcode: '2041', latitude: -33.8700, longitude: 151.2000, suburb: 'Haberfield', state: 'NSW' },
  '2042': { postcode: '2042', latitude: -33.8700, longitude: 151.2000, suburb: 'Five Dock', state: 'NSW' },
  '2043': { postcode: '2043', latitude: -33.8700, longitude: 151.2000, suburb: 'Drummoyne', state: 'NSW' },
  '2044': { postcode: '2044', latitude: -33.8700, longitude: 151.2000, suburb: 'Balmain', state: 'NSW' },
  '2045': { postcode: '2045', latitude: -33.8700, longitude: 151.2000, suburb: 'Rozelle', state: 'NSW' },
  '2046': { postcode: '2046', latitude: -33.8700, longitude: 151.2000, suburb: 'Lilyfield', state: 'NSW' },
  '2047': { postcode: '2047', latitude: -33.8700, longitude: 151.2000, suburb: 'Lewisham', state: 'NSW' },
  '2048': { postcode: '2048', latitude: -33.8700, longitude: 151.2000, suburb: 'Stanmore', state: 'NSW' },
  '2049': { postcode: '2049', latitude: -33.8700, longitude: 151.2000, suburb: 'Enmore', state: 'NSW' },
  '2050': { postcode: '2050', latitude: -33.8700, longitude: 151.2000, suburb: 'Newtown', state: 'NSW' },
  // Western Sydney
  '2141': { postcode: '2141', latitude: -33.8500, longitude: 151.0500, suburb: 'Parramatta', state: 'NSW' },
  '2142': { postcode: '2142', latitude: -33.8500, longitude: 151.0500, suburb: 'Westmead', state: 'NSW' },
  '2143': { postcode: '2143', latitude: -33.8500, longitude: 151.0500, suburb: 'Wentworthville', state: 'NSW' },
  '2144': { postcode: '2144', latitude: -33.8500, longitude: 151.0500, suburb: 'Merrylands', state: 'NSW' },
  '2145': { postcode: '2145', latitude: -33.8500, longitude: 151.0500, suburb: 'Guildford', state: 'NSW' },
  '2146': { postcode: '2146', latitude: -33.8500, longitude: 151.0500, suburb: 'Auburn', state: 'NSW' },
  '2147': { postcode: '2147', latitude: -33.8500, longitude: 151.0500, suburb: 'Lidcombe', state: 'NSW' },
  '2148': { postcode: '2148', latitude: -33.8500, longitude: 151.0500, suburb: 'Granville', state: 'NSW' },
  '2150': { postcode: '2150', latitude: -33.8000, longitude: 151.0000, suburb: 'Blacktown', state: 'NSW' },
  '2151': { postcode: '2151', latitude: -33.8000, longitude: 151.0000, suburb: 'Seven Hills', state: 'NSW' },
  '2152': { postcode: '2152', latitude: -33.8000, longitude: 151.0000, suburb: 'Baulkham Hills', state: 'NSW' },
  '2153': { postcode: '2153', latitude: -33.8000, longitude: 151.0000, suburb: 'Castle Hill', state: 'NSW' },
  '2154': { postcode: '2154', latitude: -33.8000, longitude: 151.0000, suburb: 'Kellyville', state: 'NSW' },
  '2155': { postcode: '2155', latitude: -33.8000, longitude: 151.0000, suburb: 'Rouse Hill', state: 'NSW' },
  // University locations (approximate)
  '2052': { postcode: '2052', latitude: -33.8885, longitude: 151.1873, suburb: 'Camperdown', state: 'NSW' }, // University of Sydney
  '2051': { postcode: '2050', latitude: -33.9173, longitude: 151.2313, suburb: 'Kensington', state: 'NSW' }, // UNSW
  '2007': { postcode: '2007', latitude: -33.8832, longitude: 151.2016, suburb: 'Ultimo', state: 'NSW' }, // UTS
  '2109': { postcode: '2109', latitude: -33.7731, longitude: 151.1127, suburb: 'Macquarie Park', state: 'NSW' }, // Macquarie University
  '2751': { postcode: '2751', latitude: -33.6094, longitude: 150.7375, suburb: 'Richmond', state: 'NSW' }, // Western Sydney University (Richmond)
  '2500': { postcode: '2500', latitude: -34.4278, longitude: 150.8931, suburb: 'Wollongong', state: 'NSW' }, // University of Wollongong
  '2308': { postcode: '2308', latitude: -32.9283, longitude: 151.7578, suburb: 'Callaghan', state: 'NSW' }, // University of Newcastle
}

/**
 * Get coordinates for a postcode
 */
export function getPostcodeCoordinates(postcode: string): PostcodeLocation | null {
  return postcodeDatabase[postcode] || null
}

/**
 * Get coordinates for a university
 */
export function getUniversityCoordinates(university: string): PostcodeLocation | null {
  const universityMap: { [key: string]: string } = {
    'University of Sydney': '2052',
    'UNSW Sydney': '2050',
    'University of Technology Sydney': '2007',
    'Macquarie University': '2109',
    'Western Sydney University': '2751',
    'University of Wollongong': '2500',
    'University of Newcastle': '2308',
    'Charles Sturt University': '2678', // Wagga Wagga
    'Southern Cross University': '2480', // Lismore
    'University of New England': '2351', // Armidale
  }

  const postcode = universityMap[university]
  return postcode ? getPostcodeCoordinates(postcode) : null
}

/**
 * Fallback: Estimate coordinates from postcode range
 * NSW postcodes generally follow patterns:
 * 2000-2999: Sydney metro
 * 3000-3999: Regional NSW
 */
export function estimatePostcodeCoordinates(postcode: string): PostcodeLocation | null {
  const code = parseInt(postcode)
  
  if (isNaN(code)) {
    return null
  }

  // Sydney metro area (rough estimate)
  if (code >= 2000 && code < 3000) {
    return {
      postcode,
      latitude: -33.8688 + (code % 100) * 0.01,
      longitude: 151.2093 + (code % 100) * 0.01,
      suburb: `Postcode ${postcode}`,
      state: 'NSW',
    }
  }

  // Regional NSW (very rough estimate)
  if (code >= 2300 && code < 3000) {
    return {
      postcode,
      latitude: -32.9283,
      longitude: 151.7578,
      suburb: `Postcode ${postcode}`,
      state: 'NSW',
    }
  }

  return null
}
