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
const postcodeDatabase: { [key: string]: PostcodeLocation } = {
  // Sydney CBD and Inner City (2000-2050)
  '2000': { postcode: '2000', latitude: -33.8688, longitude: 151.2093, suburb: 'Sydney', state: 'NSW' },
  '2001': { postcode: '2001', latitude: -33.8688, longitude: 151.2093, suburb: 'Sydney', state: 'NSW' },
  '2007': { postcode: '2007', latitude: -33.8832, longitude: 151.2016, suburb: 'Ultimo', state: 'NSW' },
  '2008': { postcode: '2008', latitude: -33.8899, longitude: 151.1941, suburb: 'Chippendale', state: 'NSW' },
  '2009': { postcode: '2009', latitude: -33.8843, longitude: 151.1955, suburb: 'Pyrmont', state: 'NSW' },
  '2010': { postcode: '2010', latitude: -33.8847, longitude: 151.2100, suburb: 'Darlinghurst', state: 'NSW' },
  '2011': { postcode: '2011', latitude: -33.8736, longitude: 151.2225, suburb: 'Potts Point', state: 'NSW' },
  '2015': { postcode: '2015', latitude: -33.9200, longitude: 151.2000, suburb: 'Alexandria', state: 'NSW' },
  '2016': { postcode: '2016', latitude: -33.9239, longitude: 151.1906, suburb: 'Redfern', state: 'NSW' },
  '2017': { postcode: '2017', latitude: -33.9400, longitude: 151.1950, suburb: 'Waterloo', state: 'NSW' },
  '2018': { postcode: '2018', latitude: -33.9500, longitude: 151.2050, suburb: 'Rosebery', state: 'NSW' },
  '2019': { postcode: '2019', latitude: -33.9333, longitude: 151.1833, suburb: 'Banksmeadow', state: 'NSW' },
  '2020': { postcode: '2020', latitude: -33.9164, longitude: 151.2411, suburb: 'Mascot', state: 'NSW' },
  '2021': { postcode: '2021', latitude: -33.9205, longitude: 151.2580, suburb: 'Centennial Park', state: 'NSW' },
  '2022': { postcode: '2022', latitude: -33.8910, longitude: 151.2502, suburb: 'Bondi Junction', state: 'NSW' },
  '2023': { postcode: '2023', latitude: -33.8938, longitude: 151.2630, suburb: 'Bellevue Hill', state: 'NSW' },
  '2024': { postcode: '2024', latitude: -33.8986, longitude: 151.2621, suburb: 'Waverley', state: 'NSW' },
  '2025': { postcode: '2025', latitude: -33.9043, longitude: 151.2614, suburb: 'Woollahra', state: 'NSW' },
  '2026': { postcode: '2026', latitude: -33.9147, longitude: 151.2528, suburb: 'Bondi', state: 'NSW' },
  '2027': { postcode: '2027', latitude: -33.8833, longitude: 151.2667, suburb: 'Darling Point', state: 'NSW' },
  '2028': { postcode: '2028', latitude: -33.8833, longitude: 151.2800, suburb: 'Double Bay', state: 'NSW' },
  '2029': { postcode: '2029', latitude: -33.8889, longitude: 151.2764, suburb: 'Rose Bay', state: 'NSW' },
  '2030': { postcode: '2030', latitude: -33.8927, longitude: 151.2861, suburb: 'Dover Heights', state: 'NSW' },
  '2031': { postcode: '2031', latitude: -33.8775, longitude: 151.1869, suburb: 'Randwick', state: 'NSW' },
  '2032': { postcode: '2032', latitude: -33.9145, longitude: 151.2366, suburb: 'Daceyville', state: 'NSW' },
  '2033': { postcode: '2033', latitude: -33.9188, longitude: 151.2294, suburb: 'Kensington', state: 'NSW' },
  '2034': { postcode: '2034', latitude: -33.9974, longitude: 151.2364, suburb: 'Coogee', state: 'NSW' },
  '2035': { postcode: '2035', latitude: -33.9213, longitude: 151.2251, suburb: 'Maroubra', state: 'NSW' },
  '2036': { postcode: '2036', latitude: -33.9333, longitude: 151.2167, suburb: 'Pagewood', state: 'NSW' },
  '2037': { postcode: '2037', latitude: -33.8583, longitude: 151.1667, suburb: 'Glebe', state: 'NSW' },
  '2038': { postcode: '2038', latitude: -33.8833, longitude: 151.1667, suburb: 'Annandale', state: 'NSW' },
  '2039': { postcode: '2039', latitude: -33.8797, longitude: 151.1744, suburb: 'Rozelle', state: 'NSW' },
  '2040': { postcode: '2040', latitude: -33.8833, longitude: 151.1500, suburb: 'Leichhardt', state: 'NSW' },
  '2041': { postcode: '2041', latitude: -33.8667, longitude: 151.1333, suburb: 'Balmain', state: 'NSW' },
  '2042': { postcode: '2042', latitude: -33.9022, longitude: 151.1766, suburb: 'Enmore', state: 'NSW' },
  '2043': { postcode: '2043', latitude: -33.8761, longitude: 151.1539, suburb: 'Erskineville', state: 'NSW' },
  '2044': { postcode: '2044', latitude: -33.8994, longitude: 151.1469, suburb: 'Tempe', state: 'NSW' },
  '2045': { postcode: '2045', latitude: -33.8747, longitude: 151.1478, suburb: 'Haberfield', state: 'NSW' },
  '2046': { postcode: '2046', latitude: -33.8556, longitude: 151.1333, suburb: 'Abbotsford', state: 'NSW' },
  '2047': { postcode: '2047', latitude: -33.8667, longitude: 151.1500, suburb: 'Drummoyne', state: 'NSW' },
  '2048': { postcode: '2048', latitude: -33.8925, longitude: 151.1614, suburb: 'Stanmore', state: 'NSW' },
  '2049': { postcode: '2049', latitude: -33.8986, longitude: 151.1756, suburb: 'Petersham', state: 'NSW' },
  '2050': { postcode: '2050', latitude: -33.8887, longitude: 151.1873, suburb: 'Camperdown', state: 'NSW' },

  // North Shore (2060-2099)
  '2060': { postcode: '2060', latitude: -33.8222, longitude: 151.1811, suburb: 'North Sydney', state: 'NSW' },
  '2061': { postcode: '2061', latitude: -33.7992, longitude: 151.1958, suburb: 'Kirribilli', state: 'NSW' },
  '2062': { postcode: '2062', latitude: -33.8319, longitude: 151.2050, suburb: 'Cammeray', state: 'NSW' },
  '2063': { postcode: '2063', latitude: -33.8267, longitude: 151.2122, suburb: 'Northbridge', state: 'NSW' },
  '2064': { postcode: '2064', latitude: -33.8225, longitude: 151.1956, suburb: 'Artarmon', state: 'NSW' },
  '2065': { postcode: '2065', latitude: -33.8249, longitude: 151.1572, suburb: 'Crows Nest', state: 'NSW' },
  '2066': { postcode: '2066', latitude: -33.8000, longitude: 151.2000, suburb: 'Lane Cove', state: 'NSW' },
  '2067': { postcode: '2067', latitude: -33.7833, longitude: 151.1333, suburb: 'Chatswood', state: 'NSW' },
  '2068': { postcode: '2068', latitude: -33.7833, longitude: 151.1500, suburb: 'Willoughby', state: 'NSW' },
  '2069': { postcode: '2069', latitude: -33.7500, longitude: 151.1667, suburb: 'Castle Cove', state: 'NSW' },
  '2070': { postcode: '2070', latitude: -33.7333, longitude: 151.1667, suburb: 'Lindfield', state: 'NSW' },
  '2071': { postcode: '2071', latitude: -33.7167, longitude: 151.1500, suburb: 'Killara', state: 'NSW' },
  '2072': { postcode: '2072', latitude: -33.7167, longitude: 151.1167, suburb: 'Gordon', state: 'NSW' },
  '2073': { postcode: '2073', latitude: -33.7000, longitude: 151.1167, suburb: 'Pymble', state: 'NSW' },
  '2074': { postcode: '2074', latitude: -33.6667, longitude: 151.1333, suburb: 'Turramurra', state: 'NSW' },
  '2075': { postcode: '2075', latitude: -33.6333, longitude: 151.1167, suburb: 'St Ives', state: 'NSW' },
  '2076': { postcode: '2076', latitude: -33.6500, longitude: 151.0667, suburb: 'Normanhurst', state: 'NSW' },
  '2077': { postcode: '2077', latitude: -33.6333, longitude: 151.0833, suburb: 'Hornsby', state: 'NSW' },
  '2088': { postcode: '2088', latitude: -33.8266, longitude: 151.2424, suburb: 'Mosman', state: 'NSW' },
  '2089': { postcode: '2089', latitude: -33.8333, longitude: 151.2167, suburb: 'Neutral Bay', state: 'NSW' },
  '2090': { postcode: '2090', latitude: -33.7969, longitude: 151.2131, suburb: 'Cremorne', state: 'NSW' },
  '2091': { postcode: '2091', latitude: -33.8167, longitude: 151.2333, suburb: 'Seaforth', state: 'NSW' },
  '2092': { postcode: '2092', latitude: -33.8000, longitude: 151.2500, suburb: 'Balgowlah', state: 'NSW' },
  '2093': { postcode: '2093', latitude: -33.8000, longitude: 151.2667, suburb: 'Manly', state: 'NSW' },
  '2094': { postcode: '2094', latitude: -33.7833, longitude: 151.2667, suburb: 'Fairlight', state: 'NSW' },
  '2095': { postcode: '2095', latitude: -33.7667, longitude: 151.2833, suburb: 'Manly Vale', state: 'NSW' },
  '2096': { postcode: '2096', latitude: -33.7500, longitude: 151.2833, suburb: 'Curl Curl', state: 'NSW' },
  '2097': { postcode: '2097', latitude: -33.7500, longitude: 151.3000, suburb: 'Collaroy', state: 'NSW' },
  '2099': { postcode: '2099', latitude: -33.7500, longitude: 151.2833, suburb: 'Dee Why', state: 'NSW' },

  // Western Sydney (2140-2200)
  '2140': { postcode: '2140', latitude: -33.8014, longitude: 151.0258, suburb: 'Homebush', state: 'NSW' },
  '2141': { postcode: '2141', latitude: -33.8167, longitude: 151.0000, suburb: 'Parramatta', state: 'NSW' },
  '2142': { postcode: '2142', latitude: -33.8083, longitude: 150.9869, suburb: 'Clyde', state: 'NSW' },
  '2143': { postcode: '2143', latitude: -33.8167, longitude: 150.9667, suburb: 'Rosehill', state: 'NSW' },
  '2144': { postcode: '2144', latitude: -33.8333, longitude: 150.9833, suburb: 'Auburn', state: 'NSW' },
  '2145': { postcode: '2145', latitude: -33.7833, longitude: 150.9167, suburb: 'Westmead', state: 'NSW' },
  '2146': { postcode: '2146', latitude: -33.8667, longitude: 150.9167, suburb: 'Toongabbie', state: 'NSW' },
  '2147': { postcode: '2147', latitude: -33.8167, longitude: 150.8333, suburb: 'Seven Hills', state: 'NSW' },
  '2148': { postcode: '2148', latitude: -33.7667, longitude: 150.8167, suburb: 'Blacktown', state: 'NSW' },
  '2150': { postcode: '2150', latitude: -33.7692, longitude: 150.9064, suburb: 'Harris Park', state: 'NSW' },
  '2151': { postcode: '2151', latitude: -33.8000, longitude: 151.0000, suburb: 'North Rocks', state: 'NSW' },
  '2152': { postcode: '2152', latitude: -33.7500, longitude: 150.9833, suburb: 'Northmead', state: 'NSW' },
  '2153': { postcode: '2153', latitude: -33.7333, longitude: 150.9833, suburb: 'Baulkham Hills', state: 'NSW' },
  '2154': { postcode: '2154', latitude: -33.7167, longitude: 150.9500, suburb: 'Castle Hill', state: 'NSW' },
  '2155': { postcode: '2155', latitude: -33.7000, longitude: 150.9167, suburb: 'Kellyville', state: 'NSW' },
  '2156': { postcode: '2156', latitude: -33.6500, longitude: 150.8833, suburb: 'Rouse Hill', state: 'NSW' },
  '2160': { postcode: '2160', latitude: -33.8167, longitude: 151.0333, suburb: 'Merrylands', state: 'NSW' },
  '2161': { postcode: '2161', latitude: -33.8333, longitude: 151.0167, suburb: 'Guildford', state: 'NSW' },
  '2162': { postcode: '2162', latitude: -33.8500, longitude: 151.0333, suburb: 'Yennora', state: 'NSW' },
  '2163': { postcode: '2163', latitude: -33.8667, longitude: 151.0167, suburb: 'Villawood', state: 'NSW' },
  '2164': { postcode: '2164', latitude: -33.8667, longitude: 151.0667, suburb: 'Sefton', state: 'NSW' },
  '2165': { postcode: '2165', latitude: -33.8833, longitude: 151.0167, suburb: 'Fairfield', state: 'NSW' },
  '2166': { postcode: '2166', latitude: -33.8667, longitude: 150.9833, suburb: 'Cabramatta', state: 'NSW' },
  '2170': { postcode: '2170', latitude: -33.9167, longitude: 150.8167, suburb: 'Liverpool', state: 'NSW' },
  '2190': { postcode: '2190', latitude: -33.9167, longitude: 151.0333, suburb: 'Chullora', state: 'NSW' },
  '2191': { postcode: '2191', latitude: -33.9167, longitude: 151.0500, suburb: 'Belfield', state: 'NSW' },
  '2192': { postcode: '2192', latitude: -33.9167, longitude: 151.1000, suburb: 'Belmore', state: 'NSW' },
  '2193': { postcode: '2193', latitude: -33.9167, longitude: 151.1167, suburb: 'Ashbury', state: 'NSW' },
  '2194': { postcode: '2194', latitude: -33.9167, longitude: 151.0833, suburb: 'Campsie', state: 'NSW' },
  '2195': { postcode: '2195', latitude: -33.9333, longitude: 151.0500, suburb: 'Lakemba', state: 'NSW' },
  '2196': { postcode: '2196', latitude: -33.9333, longitude: 151.0833, suburb: 'Punchbowl', state: 'NSW' },
  '2197': { postcode: '2197', latitude: -33.9667, longitude: 151.0500, suburb: 'Wiley Park', state: 'NSW' },
  '2198': { postcode: '2198', latitude: -33.9333, longitude: 151.1167, suburb: 'Hurlstone Park', state: 'NSW' },
  '2199': { postcode: '2199', latitude: -33.9333, longitude: 151.1000, suburb: 'Yagoona', state: 'NSW' },
  '2200': { postcode: '2200', latitude: -33.9167, longitude: 151.0167, suburb: 'Bankstown', state: 'NSW' },

  // University locations
  '2052': { postcode: '2052', latitude: -33.8885, longitude: 151.1873, suburb: 'University of Sydney', state: 'NSW' },
  '2109': { postcode: '2109', latitude: -33.7731, longitude: 151.1127, suburb: 'Macquarie University', state: 'NSW' },

  // Newcastle
  '2300': { postcode: '2300', latitude: -32.9272, longitude: 151.7763, suburb: 'Newcastle', state: 'NSW' },
  '2308': { postcode: '2308', latitude: -32.8928, longitude: 151.7072, suburb: 'Callaghan', state: 'NSW' },

  // Wollongong
  '2500': { postcode: '2500', latitude: -34.4278, longitude: 150.8931, suburb: 'Wollongong', state: 'NSW' },
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
    'UNSW Sydney': '2033',
    'University of Technology Sydney': '2007',
    'Macquarie University': '2109',
    'Western Sydney University': '2150',
    'University of Wollongong': '2500',
    'University of Newcastle': '2308',
  }

  const postcode = universityMap[university]
  return postcode ? getPostcodeCoordinates(postcode) : null
}

/**
 * Fallback: Estimate coordinates from postcode range (IMPROVED FORMULA)
 * NSW postcodes generally follow patterns:
 * 2000-2249: Sydney metro
 * 2250-2299: Central Coast
 * 2300-2349: Newcastle/Hunter
 * 2500-2549: Wollongong/Illawarra
 */
export function estimatePostcodeCoordinates(postcode: string): PostcodeLocation | null {
  const code = parseInt(postcode)
  
  if (isNaN(code)) {
    return null
  }

  // Sydney metro area (2000-2249) - improved accuracy
  if (code >= 2000 && code < 2250) {
    // Much smaller offsets for better approximation
    const offset = code - 2000
    const latOffset = (offset % 50) * 0.003  // Reduced from 0.01
    const lonOffset = Math.floor(offset / 50) * 0.015  // Reduced from 0.01
    
    return {
      postcode,
      latitude: -33.8688 + latOffset,
      longitude: 151.2093 + lonOffset,
      suburb: `Postcode ${postcode}`,
      state: 'NSW',
    }
  }

  // Central Coast (2250-2299)
  if (code >= 2250 && code < 2300) {
    return {
      postcode,
      latitude: -33.43,
      longitude: 151.34,
      suburb: `Postcode ${postcode}`,
      state: 'NSW',
    }
  }

  // Newcastle area (2280-2349)
  if (code >= 2280 && code < 2350) {
    return {
      postcode,
      latitude: -32.93,
      longitude: 151.78,
      suburb: `Postcode ${postcode}`,
      state: 'NSW',
    }
  }

  // Wollongong/Illawarra (2500-2549)
  if (code >= 2500 && code < 2550) {
    return {
      postcode,
      latitude: -34.43,
      longitude: 150.89,
      suburb: `Postcode ${postcode}`,
      state: 'NSW',
    }
  }

  // Blue Mountains (2750-2799)
  if (code >= 2750 && code < 2800) {
    return {
      postcode,
      latitude: -33.72,
      longitude: 150.31,
      suburb: `Postcode ${postcode}`,
      state: 'NSW',
    }
  }

  return null
}