import { createClient, SupabaseClient } from "@supabase/supabase-js"

/**
 * Rental data from Supabase bond table.
 * Table key (README): Postcode (int8), Dwelling Type (F/H/T/O/U), Bedrooms, Weekly Rent (text).
 * We map: F = apartment, H = house, T = townhouse (display; was "share"), O = other.
 */

/** Supabase table name — must match exactly (e.g. "RentalData" in dashboard). */
const RENTAL_TABLE = "RentalData"
const POSTCODES_TABLE = "PostCodes"

function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }
  return createClient(url, key)
}

export type DwellingCode = "F" | "H" | "T" | "O" | "U"

export interface RentalRow {
  id?: number
  Postcode?: number
  postcode?: number
  "Dwelling Type"?: string
  dwelling_type?: string
  Bedrooms?: string
  bedrooms?: string
  "Weekly Rent"?: string | number
  weekly_rent?: string | number
}

function getPostcode(row: RentalRow): number | null {
  const p = row.Postcode ?? row.postcode
  if (p === undefined || p === null) return null
  return typeof p === "number" ? p : parseInt(String(p), 10)
}

function getDwellingTypeRaw(row: RentalRow): string {
  const t = row["Dwelling Type"] ?? row["Dwelling type"] ?? row["DwellingType"] ?? row.dwelling_type ?? ""
  return String(t).trim()
}

function getDwellingType(row: RentalRow): string {
  return getDwellingTypeRaw(row).toUpperCase().slice(0, 1)
}

/** Map dwelling code to category per README: (F) Flat/unit, (H) House, (T) Terrace/townhouse. (O) Other and (U) Unknown excluded. */
function getDwellingCategory(row: RentalRow): "F" | "H" | "T" | null {
  const raw = getDwellingTypeRaw(row).toLowerCase()
  const code = getDwellingType(row)
  if (code === "F" || raw.includes("flat") || raw.includes("unit") || raw.includes("apartment") || raw.includes("studio")) return "F"
  if (code === "H" || raw.includes("house")) return "H"
  if (code === "T" || raw.includes("terrace") || raw.includes("townhouse") || raw.includes("semi")) return "T"
  return null
}

function getWeeklyRentNumber(row: RentalRow): number | null {
  const r = row["Weekly Rent"] ?? row["Weekly rent"] ?? row["WeeklyRent"] ?? row.weekly_rent
  if (r === undefined || r === null || r === "") return null
  if (typeof r === "number") return r > 0 ? r : null
  const s = String(r).trim().toUpperCase()
  if (s === "U" || s === "UNKNOWN") return null
  const n = parseFloat(String(r).replace(/[^0-9.-]/g, ""))
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Bedrooms: 0 = studio, 1-3 as-is, 4+ grouped as "4". Returns null for unknown (U) per README. */
function getBedroomKey(row: RentalRow): "0" | "1" | "2" | "3" | "4" | null {
  const b = row.Bedrooms ?? row["Bedrooms"] ?? row.bedrooms
  if (b === undefined || b === null || b === "") return null
  const s = String(b).trim().toUpperCase()
  if (s === "U" || s === "UNKNOWN") return null
  const n = parseInt(String(b).replace(/\D/g, ""), 10)
  if (!Number.isFinite(n) || n < 0) return null
  if (n >= 4) return "4"
  return String(n) as "0" | "1" | "2" | "3"
}

export type RentByType = { apartment: number; house: number; townhouse: number }

export interface RentalAveragesByPostcode {
  postcode: string
  /** Optional label e.g. "University of Sydney" when data is for university area */
  locationLabel?: string
  /** True when main postcode had no rows; values are average of nearby suburbs */
  filledFromNearby?: boolean
  medianWeeklyRent: RentByType
  /** Averages by bedroom count: "0" = studio, "1","2","3", "4" = 4+ bedrooms */
  byBedrooms: Record<string, RentByType>
  nearbySuburbs: Array<{
    name: string
    distance: string
    medianRent: number
    medianWeeklyRent: RentByType
    byBedrooms: Record<string, RentByType>
  }>
}

const NORMALIZE_POSTCODE = (p: string) => String(p).replace(/\D/g, "").padStart(4, "0")

/** Locality names that look like venues/commercial, not suburbs — excluded when picking suburb for postcode */
const NON_SUBURB_PATTERNS = [
  /westfield/i,
  /shopping centre/i,
  /shopping center/i,
  /mail centre/i,
  /mail center/i,
  /delivery centre/i,
  /delivery center/i,
]

function looksLikeSuburb(locality: string): boolean {
  const s = locality.trim()
  if (!s) return false
  return !NON_SUBURB_PATTERNS.some((re) => re.test(s))
}

/**
 * Get the most common suburb/locality for a postcode from PostCodes.
 * If multiple localities share the postcode, returns the one that occurs most often.
 * Skips venue-style names (e.g. "Westfield Parramatta") so we prefer actual suburb names.
 */
export async function getSuburbForPostcode(
  supabase: SupabaseClient,
  postcode: string
): Promise<string | null> {
  const pc = parseInt(NORMALIZE_POSTCODE(postcode), 10)
  if (!Number.isFinite(pc)) return null
  let res = await supabase.from(POSTCODES_TABLE).select("locality").eq("postcode", pc)
  if (res.error && (res.error as { code?: string }).code === "42703") {
    res = await supabase.from(POSTCODES_TABLE).select("locality").eq("Postcode", pc)
  }
  if (res.error || !res.data?.length) return null
  const localities = (res.data as { locality?: string }[])
    .map((r) => (r.locality ?? "").trim())
    .filter(Boolean)
  if (localities.length === 0) return null
  const counts: Record<string, number> = {}
  for (const loc of localities) {
    counts[loc] = (counts[loc] ?? 0) + 1
  }
  // Prefer suburb-like names; ignore venue/commercial names (e.g. Westfield Parramatta)
  let best: string | null = null
  let max = 0
  for (const [loc, n] of Object.entries(counts)) {
    if (!looksLikeSuburb(loc)) continue
    if (n > max) {
      max = n
      best = loc
    }
  }
  // If every locality was filtered out, fall back to overall most frequent
  if (best === null) {
    for (const [loc, n] of Object.entries(counts)) {
      if (n > max) {
        max = n
        best = loc
      }
    }
  }
  return best ?? null
}

/**
 * Fetch rental rows for a postcode from Supabase.
 * Handles: postcode/Postcode column name, and integer or text postcode (README: "Postcode of the rented premises").
 */
export async function fetchRentalRowsForPostcode(
  supabase: SupabaseClient,
  postcode: string
): Promise<RentalRow[]> {
  const normalized = NORMALIZE_POSTCODE(postcode)
  const postcodeInt = parseInt(normalized, 10)
  if (!Number.isFinite(postcodeInt)) return []

  const tryQuery = async (col: string, val: string | number) => {
    const res = await supabase.from(RENTAL_TABLE).select("*").eq(col, val)
    if (res.error && (res.error as { code?: string }).code === "42703") {
      const alt = col === "postcode" ? "Postcode" : "postcode"
      return supabase.from(RENTAL_TABLE).select("*").eq(alt, val)
    }
    return res
  }

  let result = await tryQuery("postcode", postcodeInt)
  if (result.error) {
    if ((result.error as { code?: string }).code === "42P01") return []
    throw result.error
  }
  let rows = (result.data as RentalRow[]) ?? []
  if (rows.length === 0) {
    result = await tryQuery("postcode", normalized)
    if (!result.error) rows = (result.data as RentalRow[]) ?? []
  }
  if (rows.length === 0) {
    result = await tryQuery("Postcode", normalized)
    if (!result.error) rows = (result.data as RentalRow[]) ?? []
  }
  return rows
}

/**
 * Compute AVERAGE (mean) weekly rent by dwelling type.
 *
 * Method:
 * - We take all bond records for the postcode from the rental table.
 * - For each row we read "Dwelling Type" (F/H/T/O/U) and "Weekly Rent".
 * - We only use rows where Weekly Rent parses to a positive number (unknown/invalid skipped).
 * - Dwelling codes (README): F = Flat/unit, H = House, T = Terrace/townhouse/semi-detached, O = Other, U = Unknown.
 * - We group rents by type: F → apartment, H → house, T → townhouse. O and U are excluded so averages reflect actual housing types (O can be rooms/garages and would skew townhouse).
 * - For each type we compute the arithmetic mean (sum of weekly rents / count), then round to the nearest dollar.
 */
function averagesByDwellingType(rows: RentalRow[]): {
  apartment: number
  house: number
  townhouse: number
} {
  const byType: Record<string, number[]> = { F: [], H: [], T: [] }
  for (const row of rows) {
    const rent = getWeeklyRentNumber(row)
    if (rent == null) continue
    const category = getDwellingCategory(row)
    if (category) byType[category].push(rent)
  }
  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0
  return {
    apartment: avg(byType.F),
    house: avg(byType.H),
    townhouse: avg(byType.T),
  }
}

/**
 * Compute average weekly rent by dwelling type and bedroom count.
 * Keys: "0" (studio), "1", "2", "3", "4" (4+ bedrooms).
 */
function averagesByDwellingTypeAndBedroom(rows: RentalRow[]): Record<string, RentByType> {
  const keys: ("0" | "1" | "2" | "3" | "4")[] = ["0", "1", "2", "3", "4"]
  const byKey: Record<string, Record<string, number[]>> = {}
  for (const k of keys) {
    byKey[k] = { F: [], H: [], T: [] }
  }
  for (const row of rows) {
    const rent = getWeeklyRentNumber(row)
    if (rent == null) continue
    const category = getDwellingCategory(row)
    const bedroomKey = getBedroomKey(row)
    if (bedroomKey == null || byKey[bedroomKey] === undefined || !category) continue
    byKey[bedroomKey][category].push(rent)
  }
  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0
  const out: Record<string, RentByType> = {}
  for (const k of keys) {
    out[k] = {
      apartment: avg(byKey[k].F),
      house: avg(byKey[k].H),
      townhouse: avg(byKey[k].T),
    }
  }
  return out
}

/**
 * Get rental averages for one postcode (e.g. university campus postcode).
 * When the main postcode has no rows in RentalData, fills from average of nearby suburbs so the UI still shows useful data.
 */
export async function getRentalAveragesByPostcode(
  postcode: string,
  locationLabel?: string
): Promise<RentalAveragesByPostcode> {
  const supabase = getSupabase()
  const normalized = NORMALIZE_POSTCODE(postcode)
  const rows = await fetchRentalRowsForPostcode(supabase, postcode)
  let medianWeeklyRent = averagesByDwellingType(rows)
  let byBedrooms = averagesByDwellingTypeAndBedroom(rows)

  const nearbySuburbs = await getNearbySuburbsWithRent(supabase, postcode, 3)

  const hasMainData = medianWeeklyRent.apartment > 0 || medianWeeklyRent.house > 0 || medianWeeklyRent.townhouse > 0
  let filledFromNearby = false
  if (!hasMainData && nearbySuburbs.length > 0) {
    filledFromNearby = true
    medianWeeklyRent = {
      apartment: Math.round(
        nearbySuburbs.map((s) => s.medianWeeklyRent.apartment).reduce((a, b) => a + b, 0) / nearbySuburbs.length
      ) || 0,
      house: Math.round(
        nearbySuburbs.map((s) => s.medianWeeklyRent.house).reduce((a, b) => a + b, 0) / nearbySuburbs.length
      ) || 0,
      townhouse: Math.round(
        nearbySuburbs.map((s) => s.medianWeeklyRent.townhouse).reduce((a, b) => a + b, 0) / nearbySuburbs.length
      ) || 0,
    }
    const keys: ("0" | "1" | "2" | "3" | "4")[] = ["0", "1", "2", "3", "4"]
    byBedrooms = {} as Record<string, RentByType>
    for (const k of keys) {
      const apt = nearbySuburbs.map((s) => s.byBedrooms[k]?.apartment ?? 0).filter(Boolean)
      const house = nearbySuburbs.map((s) => s.byBedrooms[k]?.house ?? 0).filter(Boolean)
      const town = nearbySuburbs.map((s) => s.byBedrooms[k]?.townhouse ?? 0).filter(Boolean)
      byBedrooms[k] = {
        apartment: apt.length ? Math.round(apt.reduce((a, b) => a + b, 0) / apt.length) : 0,
        house: house.length ? Math.round(house.reduce((a, b) => a + b, 0) / house.length) : 0,
        townhouse: town.length ? Math.round(town.reduce((a, b) => a + b, 0) / town.length) : 0,
      }
    }
  }

  const lookedUp = await getSuburbForPostcode(supabase, normalized)
  const isGenericLabel =
    !locationLabel ||
    /^Current dwelling$/i.test(locationLabel) ||
    /^Preferred location\s*\(?\d*\)?$/i.test(locationLabel)
  const suburbName = isGenericLabel ? lookedUp ?? locationLabel : locationLabel
  return {
    postcode: normalized,
    ...(suburbName && { locationLabel: suburbName }),
    ...(filledFromNearby && { filledFromNearby: true }),
    medianWeeklyRent,
    byBedrooms,
    nearbySuburbs,
  }
}

/**
 * Get nearby suburb names and distances (no rental data).
 * Used for fallback/mock so we show real locality names instead of "Suburb A/B/C".
 */
export async function getNearbySuburbNamesOnly(
  postcode: string,
  limit: number = 3
): Promise<Array<{ name: string; distance: string }>> {
  const supabase = getSupabase()
  const postcodeInt = parseInt(NORMALIZE_POSTCODE(postcode), 10)
  if (!Number.isFinite(postcodeInt)) return []

  let originResult = await supabase
    .from(POSTCODES_TABLE)
    .select("lat, long, state")
    .eq("postcode", postcodeInt)
    .limit(1)
    .single()
  if (originResult.error && (originResult.error as { code?: string }).code === "42703") {
    originResult = await supabase
      .from(POSTCODES_TABLE)
      .select("lat, long, state")
      .eq("Postcode", postcodeInt)
      .limit(1)
      .single()
  }
  const originRow = originResult.data
  if (originRow?.lat == null || originRow?.long == null) return []

  const lat = Number(originRow.lat)
  const lng = Number(originRow.long)
  const state = originRow.state ?? "NSW"
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return []

  const { data: allPostcodes } = await supabase
    .from(POSTCODES_TABLE)
    .select("postcode, lat, long, locality")
    .eq("state", state)
    .limit(2000)

  if (!allPostcodes?.length) return []

  const withDistance = allPostcodes
    .map((row: { postcode: number; lat: number; long: number; locality?: string }) => ({
      postcode: String(row.postcode).padStart(4, "0"),
      name: row.locality || `Postcode ${row.postcode}`,
      distanceKm: haversineKm(lat, lng, Number(row.lat), Number(row.long)),
    }))
    .filter((r) => r.postcode !== NORMALIZE_POSTCODE(postcode) && r.distanceKm > 0)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)

  return withDistance.map((r) => ({
    name: r.name,
    distance: formatDistance(r.distanceKm),
  }))
}

/**
 * Get 3 nearby suburbs (by distance) and their average weekly rent.
 * Uses PostCodes for lat/long and locality name; rental table for averages.
 */
export async function getNearbySuburbsWithRent(
  supabase: SupabaseClient,
  postcode: string,
  limit: number = 3
): Promise<Array<{ name: string; distance: string; medianRent: number; medianWeeklyRent: RentByType; byBedrooms: Record<string, RentByType> }>> {
  const postcodeInt = parseInt(NORMALIZE_POSTCODE(postcode), 10)
  if (!Number.isFinite(postcodeInt)) return []

  let originResult = await supabase
    .from(POSTCODES_TABLE)
    .select("lat, long, state")
    .eq("postcode", postcodeInt)
    .limit(1)
    .single()
  if (originResult.error && (originResult.error as { code?: string }).code === "42703") {
    originResult = await supabase
      .from(POSTCODES_TABLE)
      .select("lat, long, state")
      .eq("Postcode", postcodeInt)
      .limit(1)
      .single()
  }
  const originRow = originResult.data
  if (originRow?.lat == null || originRow?.long == null) {
    return getNearbySuburbsFromRentalFallback(supabase, postcode, limit)
  }

  const lat = Number(originRow.lat)
  const lng = Number(originRow.long)
  const state = originRow.state ?? "NSW"
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return getNearbySuburbsFromRentalFallback(supabase, postcode, limit)
  }

  const { data: allPostcodes } = await supabase
    .from(POSTCODES_TABLE)
    .select("postcode, lat, long, locality")
    .eq("state", state)
    .limit(2000)

  if (!allPostcodes?.length) {
    return getNearbySuburbsFromRentalFallback(supabase, postcode, limit)
  }

  const withDistance = allPostcodes
    .map((row: { postcode: number; lat: number; long: number; locality?: string }) => ({
      postcode: String(row.postcode).padStart(4, "0"),
      locality: row.locality || `Postcode ${row.postcode}`,
      lat: Number(row.lat),
      long: Number(row.long),
      distanceKm: haversineKm(lat, lng, Number(row.lat), Number(row.long)),
    }))
    .filter((r) => r.postcode !== NORMALIZE_POSTCODE(postcode) && r.distanceKm > 0)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)

  const results: Array<{
    name: string
    distance: string
    medianRent: number
    medianWeeklyRent: RentByType
    byBedrooms: Record<string, RentByType>
  }> = []
  for (const pc of withDistance) {
    const rows = await fetchRentalRowsForPostcode(supabase, pc.postcode)
    const medianWeeklyRent = averagesByDwellingType(rows)
    const byBedrooms = averagesByDwellingTypeAndBedroom(rows)
    const medianRent =
      [medianWeeklyRent.apartment, medianWeeklyRent.house, medianWeeklyRent.townhouse].filter(Boolean).reduce((a, b) => a + b, 0) /
      [medianWeeklyRent.apartment, medianWeeklyRent.house, medianWeeklyRent.townhouse].filter(Boolean).length || 0
    if (medianRent > 0 || medianWeeklyRent.apartment || medianWeeklyRent.house || medianWeeklyRent.townhouse) {
      results.push({
        name: pc.locality,
        distance: formatDistance(pc.distanceKm),
        medianRent: Math.round(medianRent),
        medianWeeklyRent,
        byBedrooms,
      })
    }
  }
  if (results.length >= limit) return results

  // Fallback: PostCodes may not have this postcode, or nearby postcodes have no rental data.
  // Try numerically close postcodes that have data in RentalData.
  const fallback = await getNearbySuburbsFromRentalFallback(supabase, postcode, limit - results.length)
  return [...results, ...fallback]
}

/**
 * Fallback when distance-based nearby returns empty: find other postcodes in RentalData
 * with data (e.g. numeric neighbours 2044, 2046, 2043…) so we still show something.
 */
async function getNearbySuburbsFromRentalFallback(
  supabase: SupabaseClient,
  postcode: string,
  limit: number
): Promise<Array<{
  name: string
  distance: string
  medianRent: number
  medianWeeklyRent: RentByType
  byBedrooms: Record<string, RentByType>
}>> {
  const center = parseInt(NORMALIZE_POSTCODE(postcode), 10)
  if (!Number.isFinite(center) || limit <= 0) return []

  const results: Array<{
    name: string
    distance: string
    medianRent: number
    medianWeeklyRent: RentByType
    byBedrooms: Record<string, RentByType>
  }> = []

  const excludePostcode = NORMALIZE_POSTCODE(postcode)
  for (let offset = 1; offset <= 50 && results.length < limit; offset++) {
    for (const delta of [offset, -offset]) {
      if (results.length >= limit) break
      const candidate = center + delta
      if (candidate < 0 || candidate > 9999) continue
      const pc = String(candidate).padStart(4, "0")
      if (pc === excludePostcode) continue
      const rows = await fetchRentalRowsForPostcode(supabase, pc)
      const medianWeeklyRent = averagesByDwellingType(rows)
      const hasData =
        medianWeeklyRent.apartment > 0 || medianWeeklyRent.house > 0 || medianWeeklyRent.townhouse > 0
      if (!hasData) continue
      const byBedrooms = averagesByDwellingTypeAndBedroom(rows)
      const medianRent =
        [medianWeeklyRent.apartment, medianWeeklyRent.house, medianWeeklyRent.townhouse]
          .filter(Boolean)
          .reduce((a, b) => a + b, 0) /
        [medianWeeklyRent.apartment, medianWeeklyRent.house, medianWeeklyRent.townhouse].filter(
          Boolean
        ).length || 0
      const suburbName = await getSuburbForPostcode(supabase, pc)
      results.push({
        name: suburbName ?? `Postcode ${pc}`,
        distance: offset === 1 ? "Same area" : `~${offset} postcodes`,
        medianRent: Math.round(medianRent),
        medianWeeklyRent,
        byBedrooms,
      })
    }
  }
  return results
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}
