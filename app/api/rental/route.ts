import { NextRequest, NextResponse } from "next/server"
import { getRentalAveragesByPostcode } from "@/lib/data/rental-supabase"
import { getLocationLabel } from "@/lib/data/rental-locations"

/**
 * GET /api/rental?postcode=2006&label=University%20of%20Sydney
 * Returns rental averages and nearby suburbs for the given postcode.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postcode = searchParams.get("postcode")?.trim()
    const label = searchParams.get("label")?.trim() || undefined

    if (!postcode || !/^\d{4}$/.test(postcode)) {
      return NextResponse.json(
        { error: "Missing or invalid postcode (must be 4 digits)" },
        { status: 400 }
      )
    }

    const locationLabel = label ?? getLocationLabel(postcode)
    const data = await getRentalAveragesByPostcode(postcode, locationLabel)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Rental API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch rental data" },
      { status: 500 }
    )
  }
}
